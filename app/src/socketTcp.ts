import { Modbus } from "./Modbus/modbus";
import { ConnectionStr, RequestModel } from "./Modbus/modle";
import { ipcMain, IpcMainEvent, BrowserWindow } from "electron";


// {
//   ip: '127.0.0.1',
//   port: 10002,
//   // port: 502,
//   address: 1,
//   setTimeout: 5000,
//   mode: 'ascii',
//   // mode: 'tcp',
//   heartbeatAddress: 4096,
//   toLinkTime: 5000
// }
export class SocketTcp {
  private connectionStr: ConnectionStr;
  private uid: string;
  private modbus: Modbus;
  private win: BrowserWindow;

  constructor(connstr: ConnectionStr, win: BrowserWindow) {
    this.connectionStr = connstr;
    this.uid = connstr.uid;
    this.win = win;
    this.modbus = new Modbus(this.connectionStr);
    this.modbus.closeFunc = () => {
      console.log('前台close');
      this.win.webContents.send(`${this.uid}close`, {link: false, state: 'error', msg: `链接失败`});
    }
    this.modbus.connectFunc = () => {
      console.log('前台connect');
      this.win.webContents.send(`${this.uid}connect`, {link: true, state: 'success', msg: `链接中`});
    }
    this.modbus.errorFunc = () => {
      console.log('前台error');
      this.win.webContents.send(`${this.uid}error`, {link: false, state: 'error', msg: `链接错误`});
    }
    this.modbus.toLinkFunc = () => {
      console.log('前台error');
      this.win.webContents.send(`${this.uid}toLink`, {link: false, state: 'error', msg: `重新链接`});
    }
    this.modbus.heartbeatFunc = (data) => {
      console.log('前台heartbeat', data);
      if (data.r.success) {
        this.win.webContents.send(`${this.uid}heartbeat`, {link: true, state: 'error', delay: data.t});
      } else {
        this.win.webContents.send(`${this.uid}heartbeat`, {link: false, state: 'error', msg: `数据错误`});
      }
    }
    this.IPCOn(this.uid, this.modbus);
  }
  IPCOn(uid: string, tcp: Modbus) {
    // cancelLink
    // FC1
    // FC2
    // FC3
    // FC5
    // FC6
    // FC15
    // FC16_int16
    // FC16_int32
    // FC16_float
    ipcMain.on(`${uid}Socket`, async (e: IpcMainEvent, arg: RequestModel) => {
      const callbackData = await tcp[arg.request](arg.address, arg.value);
      e.sender.send(arg.callpack, callbackData);
    });
  }
  /** 取消链接 */
  cancelLink() {
    return this.modbus.cancelLink();
  }
}

