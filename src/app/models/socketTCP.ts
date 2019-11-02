export interface ConnectionStr {
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

// FC2“读取输入状态”
// FC4“读取输入寄存器”
export enum FC {
  /** FC1“读取线圈状态” */
  F01 = 'F01',
  /** FC3“读保持寄存器” */
  F03 = 'F03',
  /** FC3“读保持寄存器” 返回浮点数 */
  F03_float = 'F03_float',
  /** FC3“读保持寄存器” 返回string */
  F03ASCII = 'F03ASCII',
  /** FC5“力单线圈” */
  F05 = 'F05',
  /** FC15“力多线圈” */
  F15 = 'F15',
  /** FC6“预置单寄存器” */
  F06 = 'F06',
  /** FC16“预置多寄存器” */
  F016 = 'F016',
  /** FC16“预置多寄存器” */
  F016_float = 'F016_float',
  /** 停止心跳链接 */
  heartbeatStateFunc = 'heartbeatStateFunc'
}

export enum deviceName {
  tension = 'tension',
  grouting = 'grouting'
}
