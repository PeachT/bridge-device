import { OtherInfo } from './common';
import { TaskBase } from './base';

export interface GroutingTask extends TaskBase {
  // /** 项目ID */
  // project: number;
  // /** 构建名称（T梁/20米5孔） */
  // component: any;
  // /** 开始时间 */
  // startDate: any;
  // /** 结束时间 */
  // endDate: any;
  // /** 其他数据信息 */
  // otherInfo?: Array<OtherInfo>;
  /** 梁长度 */
  beamLength: number;
  /** 张拉日期 */
  tensionDate: Date | string | number;
  /** 浇筑日期 */
  castingDate: Date | string | number;
  /** 压浆顺序 */
  sort: string;
  /** 设备编号 */
  deviceNo: number;
  /** 是否作为模板 */
  template: boolean;
  /** 施工员 */
  operator: string;
  /** 监理员 */
  supervisors: string;
  /** 自检员 */
  qualityInspector: string;
  /** 配比信息 */
  proportionInfo: ProportionInfo;
  /** 压浆数据 */
  groutingInfo?: Array<GroutingInfo>;
  /** 搅拌数据 */
  mixingInfo?: Array<MixingInfo>;
}

/** 压浆孔数据 */
export interface GroutingInfo {
  /** 孔号 */
  name: string;
  /** 压浆孔道采集数据 */
  groups: Array<GroutingHoleItem>;
  /** 孔道内径 */
  holeDiameter: number;
  /** 孔道长度 */
  holeLength: number;
  /** 钢绞线数量 */
  steelStrandNum: number;
  /** 上传状态 */
  uploading: boolean;
  /** 压浆状态 */
  state: number;
  otherInfo?: Array<OtherInfo>;
}
/** 压浆孔道采集数据 */
export interface GroutingHoleItem {
  /** 压浆方向 */
  direction: string;
  /** 环境温度 */
  envTemperature?: number;
  /** 浆液温度 */
  slurryTemperature?: number;
  /** 开始时间 */
  startDate: Date | string | number;
  /** 完成时间 */
  endDate: Date | string | number;
  /** 设置压浆压力 */
  setGroutingPressure: number;
  /** 进浆压力 */
  intoPulpPressure?: number;
  /** 回浆压力 */
  outPulpPressure?: number;
  /** 稳压时间 */
  steadyTime: number;
  /** 设计浆量 */
  setPulpvolume?:number;
  /** 进浆量 (L) */
  intoPulpvolume?: number;
  /** 回浆量 (L) */
  outPulpvolume?: number;
  /** 设置真空压力 */
  setVacuumPumpPressure?: number;
  /** 真空压力 */
  vacuumPumpPressure?: number;
  /** 真空循环时间 */
  cycletime?: number;
  /** 通过情况 */
  passMsg?: string;
  /** 冒浆情况 */
  slurryEmittingMsg?: string;
  /** 其他说明 */
  remarks?: string;
  /** 压浆过程数据 */
  processDatas?: ProcessData;
  /** 真空过程数据 */
  vacuumPumpProcessDatas?: Array<VacuumPumpProcessDatas>;
  /** 其他数据信息 */
  otherInfo?: Array<OtherInfo>;
}

/** 压浆过程数据 */
export interface ProcessData {
  /** 时间戳 */
  // date: Array<number | string>;
  /** 采集频率 */
  hz: number,
  /** 进浆压力 */
  intoPulpPressure: Array<number>;
  /** 回浆压力 */
  outPulpPressure: Array<number>;
  /** 进浆量(L) */
  intoPulpvolume: Array<number>;
  /** 回浆量(L) */
  outPulpvolume: Array<number>;
  /** 说明 */
  msg?: string;

}
/** 压浆过程数据 */
export interface VacuumPumpProcessDatas {
  /** 时间戳 */
  date: string | number;
  /** 真空压力 */
  vacuumPumpPressure: number;
  /** 说明 */
  msg: string;

}

/** 配比数据 */
export interface ProportionInfo {
  /** 配比项数据 */
  proportions: Array<ProportionItem>;
  /** 水胶比 */
  waterBinderRatio: number;

}
/** 配比项数据 */
export interface ProportionItem {
  /** 料名称 */
  name: string;
  /** 型号 */
  type: string;
  /** 配比量 */
  value: number;
}

/** 搅拌数据 */
export interface MixingInfo {
  /** 用量 */
  dosage: Array<number>;
  /** 开始时间 */
  startDate: Date | string | number;
  /** 开始时间 */
  endDate: Date | string | number;
  /** 搅拌时间 */
  mixingTime: number;
  /** 泌水率 */
  bleedingRate: number;
  /** 泌水率 */
  fluidity: number;
  /** 初始流动度 */
  initFluidity?: number;
  /** 黏稠度 */
  viscosity: number;
  /** 水胶比 */
  waterBinderRatio: number;
  /** 水温 */
  waterTemperature: number;
  /** 环境温度 */
  envTemperature: number;
}
/** 索引 */
export const GroutingIndex = '++id, name, component, project';
