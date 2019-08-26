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
}
