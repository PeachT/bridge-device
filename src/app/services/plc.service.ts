import { Injectable, ChangeDetectorRef } from '@angular/core';
import { ElectronService } from 'ngx-electron';
import { PLCSocket, testLink } from '../class/PLCSocket';
import { DbService } from './db.service';
import { NzMessageService } from 'ng-zorro-antd';
import { ConnectionStr } from '../models/socketTCP';
import { TensionTask } from '../models/tension';
import { Store } from '@ngrx/store';
import { NgrxState } from '../ngrx/reducers';
import { Subject } from 'rxjs';
import { Router } from '@angular/router';
import { TcpLive } from '../models/tensionLive';

@Injectable({
  providedIn: 'root'
})
export class PLCService {
  // tcp: PLCSocket;
  /** 张拉数据 */
  data: TensionTask;
  /** 张拉孔 */
  holeIndex: number;
  /** 链接字符串 */
  connStr: ConnectionStr;
  /** PLC sub */
  private plclink = new Subject();
  // 获得一个Observable;
  LinkState$ = this.plclink.asObservable();
  // socket 状态信息
  socketInfo = {
    /** 链接状态 */
    state: '',
    /** 是否链接 */
    link: false,
    /** 通信延时 */
    linkDelay: 0,
    /** 监控任务状态 */
    monitoringState: false,
    /** 当前状态说明 */
    msg: '',
  };
  /** 上次通信成功返回时的时间戳 */
  oldTime = 0;
  /** 禁止停止链接 */
  noOut = false;

  constructor(
    private e: ElectronService,
    private message: NzMessageService,
    private store$: Store<NgrxState>,
    private router: Router,
  ) { }


  /** 链接 */
  link(name: string) {
    const connStr: ConnectionStr = JSON.parse(localStorage.getItem(name));
    console.log('链接', connStr);
    if (connStr) {
      this.connStr = connStr;
      this.e.ipcRenderer.send('LinkTCP', this.connStr);
      this.ipcon();
      this.socketInfo.link = true;
      this.socketInfo.state = '';
      this.socketInfo.msg = '尝试链接';
      this.socketInfo.linkDelay = null;
      this.plclink.next();
      this.e.ipcRenderer.once(`${this.connStr.uid}testLink`, async (event, data) => {
        if (data.link) {
          this.socketInfo.state = 'success';
          this.socketInfo.msg = '链接中';
        } else {
        }
      });
    } else {
      this.message.error('没有配置链接数据');
    }
  }
  linkSocket() {
    console.log('发送链接', this.connStr);
  }
  /** 监听 */
  private ipcon() {
    /** 监听链接状态 */
    this.e.ipcRenderer.on(`${this.connStr.uid}connection`, async (event, data) => {
      console.log(data);
      this.socketInfo.state = data.state;
      this.socketInfo.msg = data.msg;
      this.socketInfo.link = true;
      this.plclink.next();
    });
    /** 监听心跳 */
    this.e.ipcRenderer.on(`${this.connStr.uid}heartbeat`, async (event, data) => {
      const time = new Date().getTime();
      this.socketInfo.linkDelay = (time - this.oldTime - this.connStr.hz) || time;
      this.oldTime = time;
      this.plclink.next();
    });
  }
  /** 取消链接 */
  cancelLink() {
    if (!this.socketInfo.monitoringState && !this.noOut) {
      this.e.ipcRenderer.removeAllListeners(`${this.connStr.uid}LinkTCP`);
      this.e.ipcRenderer.removeAllListeners(`${this.connStr.uid}connection`);
      this.e.ipcRenderer.removeAllListeners(`${this.connStr.uid}heartbeat`);
      this.e.ipcRenderer.send('CancelTCP', this.connStr.uid);
      this.socketInfo.link = false;
      this.socketInfo.state = null;
      this.socketInfo.msg = '';
      this.connStr = null;
    }
  }
  /** ipc */
  ipc(channel: string, data: { address: number, value: any, channel: string } | { state: boolean, channel: string }) {
    return new Promise((resolve, reject) => {
      const t = setTimeout(() => {
        reject({ success: false, data: '超时错误' });
      }, this.connStr.setTimeout);
      this.e.ipcRenderer.send(`${this.connStr.uid}${channel}`, data);
      this.e.ipcRenderer.once(data.channel, (r) => {
        clearTimeout(t);
        resolve({ success: true, data: r });
      })
    })
  }
}
