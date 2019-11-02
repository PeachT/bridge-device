
import { ElectronService } from "ngx-electron";
import { ConnectionStr } from '../models/socketTCP';
import { Store } from '@ngrx/store';
import { NgrxState } from '../ngrx/reducers';
import { resetTensionLive, initTensionLive } from '../ngrx/actions/tensionLink.action';
import { TensionLive } from '../models/tensionLive';
import { NzMessageService } from 'ng-zorro-antd';

export class PLCSocket {
  connStr: ConnectionStr;
  linkMsg: TensionLive = {
    state: false,
    now: false,
    link: false,
    oldTime: 0,
    delayTime: '0s',
    msg: '',
    monitoringState: false
  };
  constructor(
    private e: ElectronService,
    private store$: Store<NgrxState>,
    connStr: ConnectionStr,
    link: boolean = false,
  ) {
    this.connStr = connStr;
    if (!link) {
      this.linkSocket();
    } else {
      console.log('已连接监听');
      this.ipcon();
    }
  }
  /** 链接 */
  linkSocket() {
    console.log('发送链接', this.connStr);
    this.e.ipcRenderer.send('LinkTCP', this.connStr);
    this.ipcon();
  }
  /** 监听 */
  private ipcon() {
    /** 监听链接状态 */
    this.e.ipcRenderer.on(`${this.connStr.uid}connection`, async (event, data) => {
      console.log(data);
      if (data.success) {
        this.linkMsg.state = false;
        this.store$.dispatch(resetTensionLive({data: {msg: '链接中', link: true}}));
      } else {
        this.linkMsg.link = false;
        this.store$.dispatch(resetTensionLive({data: {msg: '链接有误', link: false}}));
      }
    });
    /** 监听心跳 */
    this.e.ipcRenderer.on(`${this.connStr.uid}heartbeat`, async (event, data) => {
      this.linkMsg.link = true;
      const time = new Date().getTime();
      const delayTime =  (time - this.linkMsg.oldTime - this.connStr.hz) || time;
      this.linkMsg.oldTime = time;
      let delayTimeStr = this.linkMsg.delayTime;
      if (delayTime < 500) {
        delayTimeStr = '0.5s';
      } else if (delayTime > 500 && delayTime < 1001) {
        delayTimeStr = '1s';
      } else {
        delayTimeStr = '2s';
      }
      if (delayTimeStr !== this.linkMsg.delayTime) {
        this.store$.dispatch(resetTensionLive({data: {delayTime: delayTimeStr}}))
      }
    });
  }
  /** 取消链接 */
  cancelLink() {
    this.e.ipcRenderer.removeAllListeners(`${this.connStr.uid}tastLink`);
    this.e.ipcRenderer.removeAllListeners(`${this.connStr.uid}connection`);
    this.e.ipcRenderer.removeAllListeners(`${this.connStr.uid}heartbeat`);
    this.e.ipcRenderer.send('CancelTCP', this.connStr.uid);
    this.linkMsg.delayTime = '0s';
    this.store$.dispatch(initTensionLive(null))
  }
  /** ipc */
  ipc(channel: string, data:{address: number, value: any, channel: string} | {state: boolean, channel: string}) {
    return new Promise((resolve, reject) => {
      const t = setTimeout(() => {
        reject({success: false, data: '超时错误'});
      }, this.connStr.setTimeout);
      this.e.ipcRenderer.send(`${this.connStr.uid}${channel}`, data);
      this.e.ipcRenderer.once(data.channel, (r) => {
        clearTimeout(t);
        resolve({success: true, data: r});
      })
    })
  }
}

/** 测试链接 */
export function testLink(e: ElectronService, store$, connStr: ConnectionStr): Promise<PLCSocket> {
  return new Promise((resolve, reject) => {
    console.log('链接');
    e.ipcRenderer.send('TestLinkTCP', connStr);
    const t = setTimeout(() => {
      reject('超时错误');
    }, 3000);
    /** 监听ip测试 */
    e.ipcRenderer.once(`${connStr.uid}testLink`, async (event, data) => {
      // {alive: true, link: false, msg: '测试链接'}
      if (data.alive) {
        resolve(new PLCSocket(e, store$, connStr, data.link));
        console.log(data);
        clearTimeout(t);
      } else {
        console.error(data);
        clearTimeout(t);
        reject('测试链接错误');
      }
    });
  });
}
