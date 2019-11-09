import { Socket } from "net";
import { asciiRequestCmd } from "./createCMD";
import { returnData16 } from "./returnData";
import { ConnectionStr, CallpackData } from "./modle";



export class Modbus {
  public client: Socket;
  private connectionStr: ConnectionStr;
  private writeState = false;
  private callback: Function;
  private callbackT: any;
  private tolinkT: any;
  public connectFunc: Function;
  public errorFunc: Function;
  public closeFunc: Function;
  public toLinkFunc: Function;
  public heartbeatFunc: Function;

  constructor(connstr: ConnectionStr) {
    this.connectionStr = connstr;
    this.connectTCP();
  }

  connectTCP() {
    const client = new Socket();
    const connstr = this.connectionStr;
    client.setEncoding('utf8');
    client.setNoDelay(true);
    client.connect(connstr.port, connstr.ip);
    client.setTimeout(connstr.setTimeout);

    client.on('data', (data: any) => {
      console.log('data');
      this.callback({ success: true, data });
    });
    client.on('drain', () => {
      console.log('drain');
      // this.writeState = false;
    });
    client.on('connect', () => {
      console.log('connect');
      if (this.connectFunc) {
        this.connectFunc();
      }
    });
    client.on('timeout', () => {
      console.log('timeout');
      this.heartbeat();
    });
    client.on('close', (c) => {
      console.log('close', c);
      this.toLInk();
      if (this.closeFunc) {
        this.closeFunc();
      }
    });
    client.on('error', (r) => {
      console.log('error', r);
      client.destroy();
      if (this.errorFunc) {
        this.errorFunc();
      }
    });
    this.client = client;
  }

  /** to Link */
  private toLInk() {
    if (!this.tolinkT && this.connectionStr) {
      this.tolinkT = setTimeout(() => {
        if (this.client.destroyed) {
          console.log('重新链接', new Date().getTime());
          this.tolinkT = null;
          this.toLinkFunc();
          this.connectTCP();
        }
      }, this.connectionStr.toLinkTime);
    }
  }
  /** heartbeat */
  private heartbeat() {
    console.log('84', this.connectionStr.heartbeatAddress);
    const t1 = new Date().getTime();
    this.FC3(this.connectionStr.heartbeatAddress, 1).then(r => {
      const t = new Date().getTime() - t1;
      this.heartbeatFunc({r, t})
    }).catch(r => {
      const t = new Date().getTime() - t1;
      this.heartbeatFunc({r, t})
    });
  }
  /** 取消链接 */
  cancelLink() {
    clearTimeout(this.tolinkT);
    this.client.end();
    this.connectionStr = null;
    this.client = null;
    return new Promise((resolve, reject) => {
      resolve({ success: true, data: '取消链接' });
    });
  }
  // modbus发送数据拼接
  getCmd(fc: number, address: number, data: any, state: any = null) {
    return asciiRequestCmd(this.connectionStr.address, fc, address, data, state, this.connectionStr.mode);
  }
  /**
   * FC1 "Read Coil Status" // 读取线圈状态
   * ":010100000001FD\r\n"
   * @param {Number} address 读取线圈起始地址
   * @param {Number} length 读取线圈数量
   */
  readCoilStatue(address: number, length: any) {
    const cmd = this.getCmd(1, address, length);
    return this.sendRequest(cmd);
  }
  FC1(address: any, length: any) {
    return this.readCoilStatue(address, length);
  }
  // FC2 "Read Input Status" 读取输入状态
  readInputStatue(address: number, quantity: any) {
    const cmd = this.getCmd(2, address, quantity);
    // 00 00 00 00 00 06 01 03 00 00 00 0A
    return this.sendRequest(cmd);
  }
  FC2(address: any, length: any) {
    return this.readInputStatue(address, length);
  }
  // FC3 "Read Holding Registers" 读取16位寄存器数据 : 01 03 0C 0064 0065 0066 0067 0068 0069 89
  readRegisters16(address: number, quantity: any) {
    const cmd = this.getCmd(3, address, quantity);
    console.log('129',cmd);

    return this.sendRequest(cmd);
  }
  FC3(address: number, quantity: any) {
    return this.readRegisters16(address, quantity);
  }

  // FC5 "Force Single Coil" 强制单线圈
  writeSingleCoil(address: number, value: boolean) {
    const cmd = this.getCmd(5, address, value);
    return this.sendRequest(cmd);
  }
  FC5(address: number, value: boolean) {
    return this.writeSingleCoil(address, value);
  }
  // FC6 "Preset Single Register" 预设单个寄存器
  writeSingleRegister16(address: number, data: any) {
    const cmd = this.getCmd(6, address, data);
    return this.sendRequest(cmd);
  }
  FC6(address: number, data: any) {
    return this.writeSingleRegister16(address, data);
  }

  // FC15 "Force Multiple Coil" 强制多个线圈
  writeMultipleCoil(address: number, bits: Array<0|1>) {
    const cmd = this.getCmd(15, address, bits);
    return this.sendRequest(cmd);
  }
  FC15(address: number, bits: Array<0|1>) {
    return this.writeMultipleCoil(address, bits);
  }
  // FC16 "Preset Multiple Registers" 预置多个16位寄存器
  // :0110 119A 0001 02 002F 12
  // :0110 100B 0001 02 02C2 0D
  // :0110 119A 0002 04 0028 0028 EE
  writeMultipleRegisters16(address: number, datas: any, state: any = null) {
    const cmd = this.getCmd(16, address, datas, state);
    console.log('fc16', cmd);
    return this.sendRequest(cmd);
  }
  FC16_int16(address: number, datas: any) {
    return this.writeMultipleRegisters16(address, datas);
  }
  FC16_int32(address: number, datas: any) {
    return this.writeMultipleRegisters16(address, datas, 'int32');
  }
  FC16_float(address: number, datas: any) {
    return this.writeMultipleRegisters16(address, datas, 'float');
  }

  /** 发送请求 */
  private sendRequest(cmdStr: string): Promise<CallpackData> {
    return new Promise((resolve, reject) => {
      if (!this.writeState) {
        this.writeState = true;
        this.client.write(cmdStr);
        this.callbackT = setTimeout(() => {
          this.reSend();
          reject({ success: false });
        }, 3000)
        this.callback = (data: any) => {
          this.reSend();
          if (data.success) {
            resolve({ success: true, data: returnData16(data.data, this.connectionStr.mode) });
          } else {
            reject({ success: false });
          }
        }
      } else {
        reject({ success: false });
      }
    });
  }
  private reSend() {
    clearTimeout(this.callbackT);
    this.callbackT = null;
    this.writeState = false;
  }
}

