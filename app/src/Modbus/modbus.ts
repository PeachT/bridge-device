import { Socket } from "net";
import { asciiRequestCmd } from "./createCMD";
import { returnData16 } from "./returnData";


interface ConnectionStr {
  /** ip */
  ip: string;
  /** 端口号 */
  port: number;
  /** PLC地址 */
  address: number;
  /** 通信延时 */
  setTimeout: number;
  /** 通信模式 */
  mode: string;
  /** 心跳地址 */
  heartbeatAddress: number
}

interface SendRequestModel {
  address: number;
  lengat: number;
  array: Array<number | boolean>;
}
enum FC {
  FC1 = 1,
  FC2 = 2,
  FC3 = 3,
  FC5 = 5,
  FC6 = 6,
  FC15 = 15,
  FC16 = 16,
}

// Vue.use(Vuex);
export class Modbus {
  private client: Socket;
  private connectionStr: ConnectionStr;
  private writeState = false;
  private callback: Function;
  private callbackT: any;

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
    });
    client.on('timeout', () => {
      console.log('timeout');
      this.FC3(this.connectionStr.heartbeatAddress, 1);
    });
    client.on('close', (c) => {
      console.log('close', c);
    });
    client.on('error', (r) => {
      console.log('error', r);
      client.destroy();
    });
    this.client = client;
  }

  /** 取消链接 */
  cancelLink() {
    this.client.end();
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
  readCoilStatue(address: number, length: any): Promise<any> {
    const cmd = this.getCmd(1, address, length);
    return this.sendRequest(cmd);
  }
  FC1(address: any, length: any): Promise<any> {
    return this.readCoilStatue(address, length);
  }
  // FC2 "Read Input Status" 读取输入状态
  readInputStatue(address: number, quantity: any, next: any) {
    const cmd = this.getCmd(2, address, quantity);
    // 00 00 00 00 00 06 01 03 00 00 00 0A
    this.sendRequest(cmd);
  }
  // FC3 "Read Holding Registers" 读取16位寄存器数据 : 01 03 0C 0064 0065 0066 0067 0068 0069 89
  readRegisters16(address: number, quantity: any) {
    const cmd = this.getCmd(3, address, quantity);
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
  sendRequest(cmdStr: string): Promise<{success: boolean, data?: any}> {
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
  reSend() {
    clearTimeout(this.callbackT);
    this.callbackT = null;
    this.writeState = false;
  }
}
