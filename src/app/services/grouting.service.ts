import { Injectable } from '@angular/core';
import { ElectronService } from 'ngx-electron';
import { ConnectionStr } from '../models/socket';

@Injectable({
  providedIn: 'root'
})
export class GroutingService {
  connectionStr: ConnectionStr;
  linkMsg = {
    state: false,
    now: false
  };

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
      }
    });
    this.e.ipcRenderer.on(`groutingheartbeat`, async (event, data) => {
      console.log(data);
    });
  }
}
