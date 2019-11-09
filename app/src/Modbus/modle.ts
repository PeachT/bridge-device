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

export interface RequestModel {
  /** 操作首地址 */
  address: number;
  /** 操作数据 */
  value: Array<number | boolean> | number;
  /** 请求名称 */
  request: string;
  /** 返回名称 */
  callpack: string;
}
export enum FC {
  FC1 = 1,
  FC2 = 2,
  FC3 = 3,
  FC5 = 5,
  FC6 = 6,
  FC15 = 15,
  FC16 = 16,
}

export interface CallpackData{
  success: boolean;
  data?: any;
}
