import { GroutingTask, GroutingInfo, GroutingHoleItem, VacuumPumpProcessDatas, ProportionInfo, ProcessData, MixingInfo, ProportionItem } from './grouting';


export const groutingBase: GroutingTask = {
  id: null,
  name: null,
  createdDate: null,
  modificationDate: null,
  user: null,
  project: null,
  component: null,
  /** 梁长度 */
  beamLength: null,
  /** 张拉日期 */
  tensinDate: null,
  /** 浇筑日期 */
  castingDate: null,
  /** 压浆顺序 */
  sort: null,
  /** 压浆开始日期 */
  startDate: null,
  /** 压浆完成日期 */
  endDate: null,
  /** 设备编号 */
  deviceNo: null,
  /** 是否作为模板 */
  template: false,
  /** 其他数据信息 */
  otherInfo: null,
  /** 施工员 */
  operator: null,
  /** 监理员 */
  supervisors: null,
  /** 自检员 */
  qualityInspector: null,
  /** 配比信息 */
  proportionInfo: {
    proportions: [
      {name: '水', type: '水', value: 28},
      {name: '水泥', type: '水泥', value: 100},
      {name: '水泥', type: '水泥', value: 100}
    ],
    waterBinderRatio: null,
  },
  /** 压浆数据 */
  groutingInfo: [],
  /** 搅拌数据 */
  mixingInfo: [],
}

/** 压浆孔数据 */
export const groutingInfoBase: GroutingInfo = {
  /** 孔号 */
  name: null,
  /** 压浆孔道采集数据 */
  groups: [],
  /** 孔道内径 */
  holeDiameter: null,
  /** 孔道长度 */
  holeLength: null,
  /** 钢绞线数量 */
  steelStrandNum: null,
  /** 上传状态 */
  uploading: false,
  /** 状态 */
  state: 0,
}
export const groutingHoleItem: GroutingHoleItem = {
  /** 压浆方向 */
  direction: null,
  /** 设置压浆压力 */
  setGroutingPressure: null,
  /** 环境温度 */
  envTemperature: null,
  /** 浆液温度 */
  slurryTemperature: null,
  /** 开始时间 */
  startDate: null,
  /** 完成时间 */
  endDate: null,
  /** 进浆压力 */
  intoPulpPressure: null,
  /** 回浆压力 */
  outPulpPressure: null,
  /** 进浆量 (L) */
  intoPulpvolume: null,
  /** 回浆量 (L) */
  outPulpvolume: null,
  /** 真空泵压力 */
  vacuumPumpPressure: null,
  /** 保压时间 */
  steadyTime: null,
  /** 通过情况 */
  passMsg: null,
  /** 冒浆情况 */
  slurryEmittingMsg: null,
  /** 其他说明 */
  remarks: null,
  /** 压浆过程数据 */
  processDatas: null,
  /** 真空过程数据 */
  vacuumPumpProcessDatas: [],
  /** 其他数据信息 */
  otherInfo: [],
}

/** 压浆过程数据 */
export function InitProcessData(
  date,
  intoPulpPressure = null,
  outPulpPressure = null,
  intoPulpvolume = null,
  outPulpvolume = null,
  msg = null
  ): ProcessData {
  return {
    /** 时间戳 */
    date,
    /** 进浆压力 */
    intoPulpPressure,
    /** 回浆压力 */
    outPulpPressure,
    /** 进浆量(L) */
    intoPulpvolume,
    /** 回浆量(L) */
    outPulpvolume,
    /** 说明 */
    msg,
  }
}
/** 压浆过程数据 */
export function initVacuumPumpProcessDatas(date, vacuumPumpPressure, msg = null): VacuumPumpProcessDatas {
  return {
    /** 时间戳 */
    date,
    /** 真空压力 */
    vacuumPumpPressure,
    /** 说明 */
    msg,
  }
}

/** 配比数据 */
export const initProportionInfo: ProportionInfo = {
    /** 配比项数据 */
    proportions: [],
    /** 水胶比 */
    waterBinderRatio: null,
}
/** 配比项数据 */
export const  initproportionItem: ProportionItem = {
  /** 料名称 */
  name: null,
  /** 型号 */
  type: null,
  /** 配比量 */
  value: null,
}

/** 搅拌数据 */
export function createMixingInfo(dosage): MixingInfo {
  return {
    /** 用量 */
    dosage,
    /** 开始时间 */
    startTime: null,
    /** 搅拌时间 */
    mixingTime: null,
    /** 泌水率 */
    bleedingRate: null,
    /** 流动度 */
    fluidity: null,
    /** 黏稠度 */
    viscosity: null,
    /** 水胶比 */
    waterBinderRatio: null,
    /** 水温 */
    waterTemperature: null,
    /** 环境温度 */
    envTemperature: null,
  }
}

