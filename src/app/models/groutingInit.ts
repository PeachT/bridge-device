import { GroutingTask, GroutingInfo, GroutingHoleItem, MixingInfo, VacuumPumpProcessDatas, ProcessData, ProportionInfo, ProportionItem, ProcessDataMsg } from './grouting';
import { taskBaseInit } from './baseInit';


export const processDataMsg: ProcessDataMsg = {
  length: null,
  info: null,
}

/** 压浆过程数据 */
export const processDataInit: ProcessData = {
  /** 时间戳 */
  // date: Array<number | string>,
  /** 采集频率 */
  hz: 1,
  /** 进浆压力 */
  intoPulpPressure: [],
  /** 回浆压力 */
  outPulpPressure: [],
  /** 进浆量(L) */
  intoPulpvolume: [],
  /** 回浆量(L) */
  outPulpvolume: [],
  /** 说明 */
  msg: [],
}
/** 压浆过程数据 */
export const  vacuumPumpProcessDatas: VacuumPumpProcessDatas = {
  /** 时间戳 */
  date: 0,
  /** 真空压力 */
  vacuumPumpPressure: 0,
  /** 说明 */
  msg: [],

}
/** 压浆孔道采集数据 */
export const  groutingHoleItemInit: GroutingHoleItem = {
  /** 压浆方向 */
  direction: '',
  /** 环境温度 */
  envTemperature: 0,
  /** 浆液温度 */
  slurryTemperature: 0,
  /** 开始时间 */
  startDate: null,
  /** 完成时间 */
  endDate: null,
  /** 设置压浆压力 */
  setGroutingPressure: 0,
  /** 进浆压力 */
  intoPulpPressure: 0,
  /** 回浆压力 */
  outPulpPressure: 0,
  /** 稳压时间 */
  steadyTime: 0,
  /** 设计浆量 */
  setPulpvolume:0,
  /** 进浆量 (L) */
  intoPulpvolume: 0,
  /** 回浆量 (L) */
  outPulpvolume: 0,
  /** 设置真空压力 */
  setVacuumPumpPressure: 0,
  /** 真空压力 */
  vacuumPumpPressure: 0,
  /** 真空循环时间 */
  cycletime: 0,
  /** 通过情况 */
  passMsg: '',
  /** 冒浆情况 */
  slurryEmittingMsg: '',
  /** 其他说明 */
  remarks: '',
  /** 压浆过程数据 */
  processDatas: null,
  /** 真空过程数据 */
  vacuumPumpProcessDatas: [],
  /** 其他数据信息 */
  otherInfo: [],
}
/** 压浆孔数据 */
export const  groutingInfoInit: GroutingInfo = {
  /** 孔号 */
  name: '',
  /** 压浆孔道采集数据 */
  groups: [groutingHoleItemInit],
  /** 孔道内径 */
  holeDiameter: 0,
  /** 孔道长度 */
  holeLength: 0,
  /** 钢绞线数量 */
  steelStrandNum: 0,
  /** 上传状态 */
  uploading: false,
  /** 压浆状态 */
  state: 0,
  otherInfo: [],
}
/**
 * 获取一个压浆孔道的初始化数据
 *
 * @export
 * @param {string} name 孔号
 * @returns {GroutingInfo}
 */
export function getGroutingInfoInit(): GroutingInfo {
  return { ...groutingInfoInit, groups: [groutingHoleItemInit]}
}
/** 配比项数据 */
export const  proportionItemInit: ProportionItem = {
  /** 料名称 */
  name: '',
  /** 型号 */
  type: '',
  /** 配比量 */
  value: 0,
}
function proportionItem(name: string, type: string, value: number): ProportionItem {
  return { name, type, value};
}
/** 配比数据 */
export const  proportionInfoInit: ProportionInfo = {
  /** 配比项数据 */
  proportions: [proportionItem('水', '水', 31), proportionItem('辅料', '添加剂', 100), proportionItem('主料', '水泥', 10)],
  /** 水胶比 */
  waterBinderRatio: 0,

}


/** 搅拌数据 */
export const mixingInfoInit: MixingInfo = {
  /** 用量 */
  dosage: [],
  /** 开始时间 */
  startDate: null,
  /** 开始时间 */
  endDate: null,
  /** 搅拌时间 */
  mixingTime: 0,
  /** 泌水率 */
  bleedingRate: 0,
  /** 泌水率 */
  fluidity: 0,
  /** 初始流动度 */
  initFluidity: 0,
  /** 黏稠度 */
  viscosity: 0,
  /** 水胶比 */
  waterBinderRatio: 0,
  /** 水温 */
  waterTemperature: 0,
  /** 环境温度 */
  envTemperature: 0,
}

export const groutingTaskInit: GroutingTask =  {
  ...taskBaseInit,
  id: null,
  name: null,
  createdDate: null,
  modificationDate: null,
  user: null,
  /** 项目ID */
  project: 0,
  /** 构建名称（T梁/20米5孔） */
  component: null,
  /** 开始时间 */
  startDate: null,
  /** 结束时间 */
  endDate: null,
  /** 其他数据信息 */
  otherInfo: [],
  /** 梁长度 */
  beamLength: 0,
  /** 张拉日期 */
  tensionDate: null,
  /** 浇筑日期 */
  castingDate: null,
  /** 压浆顺序 */
  sort: '',
  /** 设备编号 */
  deviceNo: 0,
  /** 是否作为模板 */
  template: false,
  /** 施工员 */
  operator: '',
  /** 监理员 */
  supervisors: '',
  /** 自检员 */
  qualityInspector: '',
  /** 配比信息 */
  proportionInfo: proportionInfoInit,
  /** 压浆数据 */
  groutingInfo: [],
  /** 搅拌数据 */
  mixingInfo: [],
}
