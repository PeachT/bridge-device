
import { ElectronService } from "ngx-electron";
import { ConnectionStr } from '../models/socketTCP';

export class PLCSocket {
  connStr: ConnectionStr;
  linkMsg = {
    state: false,
    now: false,
    link: false,
    oldTime: 0,
    delayTime: '0s',
    msg: ''
  };
  constructor(
    private e: ElectronService,
    connStr: ConnectionStr,
    link: boolean = false
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
      } else {
        this.linkMsg.link = false;
      }
    });
    /** 监听心跳 */
    this.e.ipcRenderer.on(`${this.connStr.uid}heartbeat`, async (event, data) => {
      this.linkMsg.link = true;
      const time = new Date().getTime();
      const delayTime =  (time - this.linkMsg.oldTime - this.connStr.hz) || time;
      this.linkMsg.oldTime = time;
      // console.log(delayTime);
      if (delayTime < 500) {
        this.linkMsg.delayTime = '0.5s';
      } else if (delayTime > 500 && delayTime < 1001) {
        this.linkMsg.delayTime = '1s';
      } else {
        this.linkMsg.delayTime = '2s';
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
  }
  /** ipc */
  ipc(channel: string, data:{address: number, value: any, channel: string} | {state: boolean, channel: string}) {
    return new Promise((resolve, reject) => {
      const t = setTimeout(() => {
        reject({success: false, data: '超时错误'});
      }, this.connStr.setTimeout);
      this.e.ipcRenderer.send(`${this.connStr.uid}${channel}`, data);
      this.e.ipcRenderer.on(data.channel, (r) => {
        clearTimeout(t);
        resolve({success: true, data: r});
      })
    })
  }
}

/** 测试链接 */
export function testLink(e: ElectronService, connStr: ConnectionStr): Promise<PLCSocket> {
  return new Promise((resolve, reject) => {
    console.log('链接');
    e.ipcRenderer.send('TestLinkTCP', connStr);
    /** 监听ip测试 */
    e.ipcRenderer.once(`${connStr.uid}testLink`, async (event, data) => {
      // {alive: true, link: false, msg: '测试链接'}
      if (data.alive) {
        resolve(new PLCSocket(e, connStr, data.link));
        console.log(data);
      } else {
        console.error(data);
        reject('测试链接错误');
      }
    });
    setTimeout(() => {
      reject('超时错误');
    }, 3000);
  });
}
