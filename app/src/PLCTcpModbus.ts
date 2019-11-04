// import ModbusRTU from 'modbus-serial';
import { app, BrowserWindow, ipcMain } from 'electron';
import { bf } from './bufferToNumber';
import { ModbusRTU } from 'modbus-serial/ModbusRTU';
const Modbus = require('modbus-serial');

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
  hz: number;
  /** 心跳链接地址 */
  heartbeatAddress: number;
}

export class PLCTcpModbus {
  protected connectionStr: ConnectionStr;
  protected connectionFunc: any;
  /** 正在链接状态 */
  protected cs = false;
  protected win: BrowserWindow;
  protected heartbeatT: any;
  protected heartbeatState = true;
  protected closeState = false;


  public heartbeatRate = 10;
  public client: ModbusRTU = null;
  overtimeT: any;
  constructor(connectionStr: ConnectionStr, win: BrowserWindow, heartbeatState = true) {
    this.connectionStr = connectionStr;
    this.win = win;
    this.heartbeatState = heartbeatState;
    this.connection();
  }
  /**
   * Modbus 链接
   *
   * @returns
   * @memberof ModbusTCP
   */
  public async connection(): Promise<boolean> {
    const backIPC = `${this.connectionStr.uid}connection`;
    if (this.closeState) {
      this.IPCSendSys(backIPC, {state: 'success', msg: '链接中', connectionStr: this.connectionStr});
      this.client = null;
      console.log('close');
      return;
    }
    if (!this.cs && this.connectionState()) {
      this.IPCSendSys(backIPC, {state: 'success', msg: '链接中', connectionStr: this.connectionStr});
      this.heartbeat();
      return;
    }
    this.cs = true;
    this.IPCSendSys(backIPC, {state: 'error', msg: '尝试链接', connectionStr: this.connectionStr});

    this.client = new Modbus();
    this.client.setTimeout(Number(this.connectionStr.setTimeout)); // 设置链接超时

    let state = false;
    // 链接
    await this.client.connectTCP(this.connectionStr.ip, { port: Number(this.connectionStr.port) })
    // await this.client.connectTCP('192.168.12.12', { port: Number(this.connectionStr.port) })
    /** 链接成功 */
    .then(() => {
      this.cs = false;
      state = true;
      this.client.setID(Number(this.connectionStr.address));
      this.IPCSendSys(backIPC, {state: 'success', msg: '链接中', connectionStr: this.connectionStr});
      console.log('success = true');

      this.heartbeat();
      /** 链接失败 */
    }).catch((err) => {
      this.cs = false;
      this.IPCSendSys(backIPC, {state: 'error', msg: '5s后重试', connectionStr: this.connectionStr});
      setTimeout(() => {
        console.log('erroe--86');
        this.connection();
      }, 5000);
      console.log('success = false');
    });
    return state;
  }

  /** 心跳包 */
  heartbeat() {
    setTimeout(async () => {
      if (this.ifClient('heartbeat') && this.heartbeatState) {
        const d = new Date().getSeconds();
        this.client.readHoldingRegisters(this.connectionStr.heartbeatAddress || 0, 1).then((data) => {
          this.IPCSend(`${this.connectionStr.uid}heartbeat`, { uint16: data.data });
          this.heartbeat();
        }).catch((err) => {
          console.log('heartbeat--102');

          this.connection();
        });
      }
    }, this.connectionStr.hz || 1000);
  };
  heartbeatStateFunc(state: boolean) {
    this.heartbeatState = state;
    if (state) {
      this.heartbeat();
    }
  }
  /** 关闭链接 */
  close(callback: Function) {
    this.client.close((r) => {
      this.closeState = true;
      callback();
    });
  }

  /**
   * 发送数据到UI
   *
   * @protected
   * @param {string} channel 发送名称
   * @param {*} message 发送数据
   * @param {string} channel 通知UI名称
   * @memberof ModbusTCP
   */
  protected IPCSend(channel: string, message: any) {
    try {
      if (this.connectionState()) {
        this.win.webContents.send(channel, message);
      }
    } catch (error) {
    }
  }
  protected IPCSendSys(channel: string, data: any) {
    try {
        this.win.webContents.send(channel, data);
    } catch (error) {
    }
  }

  /**
   * 读取多个线圈
   *
   * @param {number} address 首地址
   * @param {number} length 读取数据量
   * @param {string} channel 通知UI名称
   * @memberof ModbusTCP
   */
  public F01(address: number, length: number, channel: string): void {
    if (this.ifClient('F01')) {
      this.client.readCoils(address, length).then((data) => {
        this.IPCSend(channel, { data: data.data });
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
  public F03(address: number, length: number, channel: string): void {
    if (this.ifClient('F03')) {
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
    if (this.ifClient('F03ASCII')) {
      this.client.readHoldingRegisters(address, length).then((data) => {
        const float = bf.bufferToFloat(data.buffer);
        const dint16 = bf.bufferTo16int(data.buffer);
        // const str0 = data.buffer.swap16().toString('ascii');
        const str = data.buffer.toString('ascii');

        this.IPCSend(channel, { uint16: data.data, str, buffer: data.buffer, float, dint16 });
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
    if (this.ifClient('F03_float')) {
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
    if (this.ifClient('F05')) {
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
    if (this.ifClient('F15')) {
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
    if (this.ifClient('F06')) {
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
    if (this.ifClient('F016_float')) {
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
    if (this.ifClient('F016')) {
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
  public ifClient(FC: string = null) {
    // console.log(this.dev, '---1111', this.connectionState());
    if (this.connectionState()) {
      return true;
    } else {
      console.log('heartbeat--324', FC);
      this.connection();
    }
    return false;
  }
  /** 获取当前链接状态 */
  protected connectionState() {
    return this.client && this.client.isOpen;
  }

}
