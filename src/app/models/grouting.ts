import { IBase } from './base';
import { OtherInfo } from './common';
import { TaskBase } from './task.models';

export interface GroutingTask extends TaskBase {
  holeRadio: string;
  /** 气温 */
  airTemperature: number;
  /** 水温 */
  waterTemperature: number;
  /** 压浆温度 */
  groutingTemperature: number;
  /** 泌水率 */
  bleedingRate: number;
  /** 流动度 */
  mobility: number;
  /** 黏稠度 */
  viscosity: number;
  /** 压浆量 */
  groutingDosage: number;
  /** 浆液水浆比 */
  proportion: number;
  /** 材料信息 */
  proportions: Array<Proportion>;
  /** 压浆组信息 */
  groups?: Array<GroutingItem>;
  any?: any;
  /** 设置为模板 */
  template: boolean;
}
export interface GroutingItem {
  /** 孔号 */
  name: string;
  /** 试验日期 */
  testDate: Date;
  /** 压浆方向 */
  direction: string;
  /** 张拉开始时间 */
  startDate: Date;
  /** 张拉结束时间 */
  endDate: Date;
  /** 设置压浆压力 */
  setMpa: number;
  /** 通过 */
  pass: string;
  /** 冒浆情况 */
  msg: string;
  /** 停留时间 */
  stayTime: number;
  /** 稳压时间 */
  steadyTime: number;
  /** 搅拌时间 */
  stirTime: number;
  /** 稳压压浆压力 */
  steadyMpa: number;
  /** 材料 */
  materialsTotal: number;
  /** 水量 */
  waterTotal: number;
  /** 浆液水浆比 */
  proportion: number;
  /** 二次压浆 */
  tow?: GroutingItem2;
  /** 压浆状态 */
  state: number;
  /** 上传状态 */
  upState: number;
  any?: any;
}
export interface GroutingItem2 extends GroutingItem {
  directionDispose: string;
  stayTimeDispose: string;
  mpaDispose: string;
  passDispose: string;
  msgDispose: string;
}
/** 配比 */
export interface Proportion {
  /** ming从 */
  name: string;
  /** 型号 */
  type: string;
  /** 配比量 */
  value: number;
  /** 使用总量 */
  total: number;
}
/** 用户索引 */
export const GroutingIndex = '++id, name, component, project';
