export interface HMIModel {
  /** 梁号 */
  name: string;
  /** 压浆孔数据 */
  groups: Array<HMIHole>
}

export interface HMIHole {
  /** 孔号 */
  name: string;
  /** 完成时间 */
  endDate: Date | string;
  /** 启动时间 */
  startDate: Date | string;
  /** 水饺比 */
  proportion: number;
  /** 设置压力 */
  setMpa: number;
  /** 保压压力 */
  steadyMpa: number
  /** 保压时间 */
  steadyTime: number
}
