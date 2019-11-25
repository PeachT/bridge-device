import { IBase } from './base';


export interface TensionDevice extends IBase {
  /** 方程类型 */
  equation: boolean;
  /** 千斤顶型号 */
  jackModel: string;
  /** 油泵型号 */
  pumpModel: string;
  A1?: JackItem;
  A2?: JackItem;
  B1?: JackItem;
  B2?: JackItem;
}


/** 顶数据 */
export interface JackItem {
  /** 千斤顶编号 */
  jackNo: string;
  /** 油泵编号 */
  pumpNo: string;
  /** 标定系数a */
  a: number;
  /** 标定系数b */
  b: number;
  /** 标定日期 */
  date: Date;
}

/** 用户索引 */
export const JackIndex = '++id,&name';


