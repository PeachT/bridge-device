import { Injectable } from '@angular/core';
import { ElectronService } from 'ngx-electron';
import { NzMessageService } from 'ng-zorro-antd';
import { ConnectionStr, RequestModel } from '../models/socketTCP';
import { TensionTask } from '../models/tension';
import { Store } from '@ngrx/store';
import { NgrxState } from '../ngrx/reducers';
import { Subject } from 'rxjs';
import { Router } from '@angular/router';

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
  /** PLC sub */
  private plcError = new Subject();
  // 获得一个Observable;
  LinkError$ = this.plcError.asObservable();
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
  get plcState() {
    return this.socketInfo.state === 'success';
  }

  constructor(
    private e: ElectronService,
    private message: NzMessageService,
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
    } else {
      this.message.error('没有配置链接数据');
    }
  }
  linkSocket() {
    console.log('发送链接', this.connStr);
  }
  /** 监听 */
  private ipcon() {
    const uid = this.connStr.uid;
    /** 监听链接状态 */
    this.e.ipcRenderer.on(`${this.connStr.uid}connect`, async (event, data) => {
      // console.log(data);
      console.log('监听链接状态');

      this.socketInfo.state = data.state;
      this.socketInfo.msg = data.msg;
      this.socketInfo.link = true;
      this.plcError.next(data.state === 'success');
    });
    /** 监听心跳 */
    this.e.ipcRenderer.on(`${this.connStr.uid}heartbeat`, async (event, data) => {
      // console.log(data);
      console.log('监听心跳');

      this.oldTime = data.delay;
      this.plclink.next();
    });
    /** 监听关闭连接 */
    this.e.ipcRenderer.on(`${this.connStr.uid}close`, async (event, data) => {
      console.log('监听关闭连接');
      this.plclink.next();
    });
    /** 监听连接错误 */
    this.e.ipcRenderer.on(`${this.connStr.uid}error`, async (event, data) => {
      console.log('监听连接错误');

      this.socketInfo.state = data.state;
      this.socketInfo.msg = data.msg;
      this.plclink.next();
    });
    /** 监听重新连接 */
    this.e.ipcRenderer.on(`${this.connStr.uid}toLink`, async (event, data) => {
      console.log('监听重新连接');

      this.socketInfo.state = data.state;
      this.socketInfo.msg = data.msg;
      this.plclink.next();
    });
  }
  /** 取消链接 */
  cancelLink() {
    if (!this.socketInfo.monitoringState && !this.noOut) {
      const uid = this.connStr.uid;
      this.e.ipcRenderer.send('CancelLink', uid);
      this.e.ipcRenderer.once(`${uid}CancelLink`, (e, data) => {
        console.log('取消链接');

        this.e.ipcRenderer.removeAllListeners(`${this.connStr.uid}LinkTCP`);
        this.e.ipcRenderer.removeAllListeners(`${this.connStr.uid}connection`);
        this.e.ipcRenderer.removeAllListeners(`${this.connStr.uid}heartbeat`);
        this.socketInfo.link = false;
        this.socketInfo.state = null;
        this.socketInfo.msg = '';
        this.connStr = null;
        this.plclink.next();
      })
    }
  }
  /** ipc */
  ipc(data: RequestModel) {
    return new Promise((resolve, reject) => {
      const t = setTimeout(() => {
        reject({ success: false, data: '超时错误' });
      }, this.connStr.setTimeout);
      this.e.ipcRenderer.send(`${this.connStr.uid}Socket`, data);
      this.e.ipcRenderer.once(data.callpack, (r) => {
        clearTimeout(t);
        resolve({ success: true, data: r });
      })
    })
  }
}
