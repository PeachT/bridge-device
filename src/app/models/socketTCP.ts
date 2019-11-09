export interface ConnectionStr {
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
  heartbeatAddress: number;
  /** 重连延时toLinkTime */
  toLinkTime: number;
  /** uid */
  uid: string;
}

// FC2“读取输入状态”
// FC4“读取输入寄存器”
// export enum FC {
//   /** FC1“读取线圈状态” */
//   F01 = 'F01',
//   /** FC3“读保持寄存器” */
//   F03 = 'F03',
//   /** FC3“读保持寄存器” 返回浮点数 */
//   F03_float = 'F03_float',
//   /** FC3“读保持寄存器” 返回string */
//   F03ASCII = 'F03ASCII',
//   /** FC5“力单线圈” */
//   F05 = 'F05',
//   /** FC15“力多线圈” */
//   F15 = 'F15',
//   /** FC6“预置单寄存器” */
//   F06 = 'F06',
//   /** FC16“预置多寄存器” */
//   F016 = 'F016',
//   /** FC16“预置多寄存器” */
//   F016_float = 'F016_float',
//   /** 停止心跳链接 */
//   heartbeatStateFunc = 'heartbeatStateFunc'
// }
/** socketAPI */
export enum FC {
  // cancelLink = 'cancelLink',
  FC1 = 'FC1',
  FC2 = 'FC2',
  FC3 = 'FC3',
  FC5 = 'FC5',
  FC6 = 'FC6',
  FC15 = 'FC15',
  FC16_int16 = 'FC16_int16',
  FC16_int32 = 'FC16_int32',
  FC16_float = 'FC16_float',
}
/** socket 请求需要数据 */
export interface RequestModel {
  /** 操作首地址 */
  address: number;
  /** 操作数据 */
  value: Array<number | boolean> | number;
  /** 请求名称 */
  request?: string;
  /** 返回名称 */
  callpack?: string;
}

export enum deviceName {
  tension = 'tension',
  grouting = 'grouting'
}
