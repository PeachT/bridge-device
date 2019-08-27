// import ModbusRTU from 'modbus-serial';
import { app, BrowserWindow, ipcMain } from 'electron';
const ModbusRTU = require('modbus-serial');
import { bf } from './bufferToNumber';

interface ConnectionStr {
  /** ip */
  ip: string;
  /** 端口号 */
  port: number;
  /** PLC地址 */
  address: number;
  /** 设备名称 */
  uid: string;
  /** 通信延时 */
  setTimeout: number;
}

export class PLCTcpModbus {
  private connectionStr: ConnectionStr;
  private connectionFunc: any;
  /** 正在链接状态 */
  private cs = false;
  private win: BrowserWindow;
  private heartbeatT: any;


  public heartbeatRate = 10;
  public client: any = null;
  overtimeT: any;
  constructor(connectionStr: ConnectionStr, win: BrowserWindow) {
    this.connectionStr = connectionStr;
    this.win = win;

    this.connection();
  }
  /**
   * Modbus 链接
   *
   * @returns
   * @memberof ModbusTCP
   */
  public async connection(): Promise<boolean> {
    if (!this.cs && this.connectionState()) {
      this.IPCSendSys(`${this.connectionStr.uid}connection`, '设备链接正常');
      return;
    }
    this.cs = true;
    this.IPCSendSys(`${this.connectionStr.uid}connection`, {success: false, msg: '正在链接', connectionStr: this.connectionStr});

    this.client = new ModbusRTU();
    this.client.setTimeout(Number(this.connectionStr.setTimeout)); // 设置链接超时

    let state = false;
    // 链接
    await this.client.connectTCP(this.connectionStr.ip, { port: Number(this.connectionStr.port) })
    /** 链接成功 */
    .then(() => {
      this.cs = false;
      state = true;
      this.client.setID(Number(this.connectionStr.address));
      this.IPCSendSys(`${this.connectionStr.uid}connection`, {success: true, msg: '正在成功', connectionStr: this.connectionStr});
      console.log('success = true');

      this.heartbeat();
      /** 链接失败 */
    }).catch((err) => {
      this.cs = false;
      this.IPCSendSys(`${this.connectionStr.uid}connection`, {success: false, msg: '正在失败，5s后重新链接', connectionStr: this.connectionStr});
      setTimeout(() => {
        this.connection();
      }, 5000);
      console.log('success = false');
    });
    return state;
  }

  /** 心跳包 */
  private heartbeat() {
    setTimeout(() => {
      if (this.ifClient()) {
        const d = new Date().getSeconds();
        // this.F06(4195, d)
        // this.client.readHoldingRegisters(0, 1).then((data) => {
        this.client.readHoldingRegisters(4548, 1).then((data) => {
          // const float = bf.bufferToFloat(data.buffer);
          // const dint16 = bf.bufferTo16int(data.buffer);
          this.IPCSend(`${this.connectionStr.uid}heartbeat`, { uint16: data.data });
          this.heartbeat();
        }).catch((err) => {
          this.connection();
        });
      }
    // tslint:disable-next-line:no-string-literal
    }, 10);
  }

  /**
   * 发送数据到UI
   *
   * @private
   * @param {string} channel 发送名称
   * @param {*} message 发送数据
   * @param {string} channel 通知UI名称
   * @memberof ModbusTCP
   */
  private IPCSend(channel: string, message: any) {
    try {
      if (this.connectionState()) {
        this.win.webContents.send(channel, message);
      }
    } catch (error) {
    }
  }
  private IPCSendSys(channel: string, data: any) {
    try {
        this.win.webContents.send(channel, data);
    } catch (error) {
    }
  }

  /**
   * 读取多个寄存器值
   *
   * @param {number} address 首地址
   * @param {number} length 读取数据量
   * @param {string} channel 通知UI名称
   * @memberof ModbusTCP
   */
  public F03(address: number, length: number, channel: string): void {
    if (this.ifClient()) {
      this.client.readHoldingRegisters(address, length).then((data) => {
        const float = bf.bufferToFloat(data.buffer);
        const dint16 = bf.bufferTo16int(data.buffer);
        this.IPCSend(channel, { uint16: data.data, float, dint16 });
      }).catch((err) => {
        this.IPCSend(channel, err);
      });
    }
  }
  public F03ASCII(address: number, length: number, channel: string): void {
    if (this.ifClient()) {
      this.client.readHoldingRegisters(address, length).then((data) => {
        const str = data.buffer.toString();
        console.log('buffer', data.buffer);
        // const dint16 = bf.bufferTo16int(data.buffer);
        this.IPCSend(channel, { uint16: data.data, str, buffer: data.buffer });
      }).catch((err) => {
        this.IPCSend(channel, err);
      });
    }
  }
  /**
   * 读取多个寄存器值
   *
   * @param {number} address 首地址
   * @param {number} length 读取数据量
   * @param {string} channel 通知UI名称
   * @memberof ModbusTCP
   */
  public F03_float(address: number, length: number, channel: string): void {
    if (this.ifClient()) {
      this.client.readHoldingRegisters(address, length).then((data) => {
        const float = bf.bufferToFloat(data.buffer);
        // const dint16 = bf.bufferTo16int(data.buffer);
        this.IPCSend(channel, { float });
      }).catch((err) => {
        this.IPCSend(channel, err);
      });
    }
  }
  /**
   * 设置单个线圈
   *
   * @param {number} address 装置地址
   * @param {boolean} [state=false] 设置状态
   * @returns
   * @memberof ModbusTCP
   */
  public F05(address: number, state: boolean = false, channel: string): void {
    if (this.ifClient()) {
      this.client.writeCoil(address, state).then((data) => {
        this.IPCSend(channel, data);
      }).catch((err) => {
        console.log(err, this.client);
        this.IPCSend(channel, err);
      });
    }
  }
  /**
   * 预设多个线圈
   *
   * @param {number} address 装置首地址
   * @param {Array<boolean>} array 预设数据
   * @param {string} channel 返回UI名称
   * @returns {void}
   * @memberof ModbusTCP
   */
  public F15(address: number, array: Array<boolean>, channel: string): void {
    if (this.ifClient()) {
      this.client.writeCoils(address, array).then((data) => {
        this.IPCSend(channel, data);
      }).catch((err) => {
        console.log(err, this.client);
        this.IPCSend(channel, err);
      });
    }
  }
  /**
   * 预设单个寄存器
   *
   * @param {number} address 寄存器地址
   * @param {number} [value=0] 预设值
   * @param {string} channel 通知UI名称
   * @returns
   * @memberof ModbusTCP
   */
  public F06(address: number, value: number = 0, channel: string): void {
    if (this.ifClient()) {
      this.client.writeRegister(address, value).then((data) => {
        this.IPCSend(channel, data);
      }).catch((err) => {
        console.log(err, this.client);
        this.IPCSend(channel, err);
      });
    }
  }
  /**
   * 预设浮点数多个寄存器
   *
   * @param {number} address 寄存器首地址
   * @param {Array<number>} array 预设值
   * @param {string} channel 通知UI名称
   * @returns
   * @memberof ModbusTCP
   */
  public F016_float(address: number, array: Array<number>, channel: string): void {
    if (this.ifClient()) {
      const ints = bf.floatToBuffer(array);
      this.client.writeRegisters(address, ints).then((data) => {
        console.log(data);
        this.IPCSend(channel, { success: true, data });
      }).catch((err) => {
        console.log(err);
        this.IPCSend(channel, { success: false, err });
      });
    }
  }
  /**
   * 预设多个寄存器
   *
   * @param {number} address 寄存器首地址
   * @param {Array<number>} array 预设值
   * @param {string} channel 通知UI名称
   * @returns
   * @memberof ModbusTCP
   */
  public F016(address: number, array: Array<number>, channel: string): void {
    if (this.ifClient()) {
      this.client.writeRegisters(address, array).then((data) => {
        this.IPCSend(channel, data);
      }).catch((err) => {
        console.log(err, this.client);
        this.IPCSend(channel, err);
      });
    }
  }
  /**
   * 判断Modbus链接状态
   *
   * @returns 正常返回 true 异常返回 false
   * @memberof ModbusTCP
   */
  public ifClient() {
    // console.log(this.dev, '---1111', this.connectionState());
    if (this.connectionState()) {
      return true;
    } else {
      this.connection();
    }
  }
  /** 获取当前链接状态 */
  private connectionState() {
    return this.client && this.client._port.isOpen;
  }
}
