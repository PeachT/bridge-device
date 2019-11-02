import { Injectable } from '@angular/core';
import { ElectronService } from 'ngx-electron';
import { PLC_D } from '../models/IPCChannel';
import { Subject } from 'rxjs';
import { ConnectionStr } from '../models/socketTCP';

@Injectable({
  providedIn: 'root'
})
export class GroutingService {
  connectionStr: ConnectionStr;
  linkMsg = {
    state: false,
    now: false,
    link: false,
    oldTime: 0,
    delayTime: '0s',
    msg: null
  };

  /** PLC sub */
  private plcSub = new Subject();
  // 获得一个Observable;
  plcSubject = this.plcSub.asObservable();
  /** PLC sub */
  private plcSub1 = new Subject();
  // 获得一个Observable;
  plcSubject1 = this.plcSub1.asObservable();

  constructor(
    private e: ElectronService,
  ) {
    this.connectionStr = JSON.parse(localStorage.getItem('groutingConn')) || {
      /** ip */
      ip: null,
      /** 端口号 */
      port: 502,
      /** PLC地址 */
      address: 1,
      /** 设备名称 */
      uid: 'grouting',
      /** 通信延时 */
      setTimeout: 3000,
      hz: 100
    };
  }
  linkSocket() {
    this.linkMsg.now = true;
    this.e.ipcRenderer.send('tastLink', `${this.connectionStr.ip}`);
    this.e.ipcRenderer.once(`tastLink`, (event, data) => {
      console.log(data);
      if (data.alive) {
        this.linkMsg.state = true;
        this.e.ipcRenderer.send('groutingRun', this.connectionStr);
        this.ipcOn();
      } else {
        this.linkMsg.now = false;
        this.linkMsg.state = false;
      }
    });
  }
  ipcOn() {
    this.e.ipcRenderer.on(`groutingconnection`, async (event, data) => {
      console.log(data);
      if (data.success) {
        this.linkMsg.state = false;
        // this.linkMsg.link = true;
        this.linkMsg.msg = '链接中';
        // this.store$.dispatch(resetTensionLive({data: {msg: '链接中'}}));
      } else {
        this.linkMsg.link = false;
        this.plcSub.next({state: false, data});
        // this.store$.dispatch(resetTensionLive({data: {msg: '链接有误'}}));
        this.linkMsg.msg = '链接有误';
      }
    });
    this.e.ipcRenderer.on(`groutingheartbeat`, async (event, data) => {
      this.linkMsg.link = true;
      const time = new Date().getTime();
      this.plcSub.next({state: true, data: data.data});
    });
    this.e.ipcRenderer.on(`groutingheartbeat1`, async (event, data) => {
      this.linkMsg.link = true;
      const time = new Date().getTime();
      const delayTime =  (time - this.linkMsg.oldTime - this.connectionStr.hz) || time;
      this.linkMsg.oldTime = time;
      if (delayTime < 500) {
        this.linkMsg.delayTime = '0.5s';
      } else if (delayTime > 500 && delayTime < 1001) {
        this.linkMsg.delayTime = '1s';
      } else {
        this.linkMsg.delayTime = '2s';
      }
      // console.log(data);
      this.plcSub1.next({state: true, data: data.data});
    });
  }
}
