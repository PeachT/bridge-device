import { GroutingTask, GroutingInfo, GroutingHoleItem, MixingInfo } from './grouting';


export const groutingTaskBase: GroutingTask = {
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
  tensionDate: null,
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
  otherInfo: [],
  /** 施工员 */
  operator: null,
  /** 监理员 */
  supervisors: null,
  /** 自检员 */
  qualityInspector: null,
  /** 配比信息 */
  proportionInfo: {
    waterBinderRatio: 0.28,
    proportions: [
      { name: '水', type: '水', value: 30 },
      { name: '水泥', type: '水泥', value: 100 },
      { name: '压浆剂', type: '压浆剂', value: 10 }
    ],
  },
};
/** 压浆数据 */
export const groutingInfoBase: GroutingInfo = {
  /** 孔号 */
  name: '',
  /** 压浆孔道采集数据 */
  groups: [
    {
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
      /** 稳压时间 */
      steadyTime: null,
      /** 通过情况 */
      passMsg: null,
      /** 冒浆情况 */
      slurryEmittingMsg: null,
      /** 其他说明 */
      remarks: null,
    }
  ],
  /** 孔道内径 */
  holeDiameter: null,
  /** 孔道长度 */
  holeLength: null,
  /** 钢绞线数量 */
  steelStrandNum: null,
  /** 上传状态 */
  uploading: false,
  /** 压浆状态 */
  state: 0,
};
export const groutingHoleitemBase: GroutingHoleItem = {
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
  /** 稳压时间 */
  steadyTime: null,
  /** 通过情况 */
  passMsg: null,
  /** 冒浆情况 */
  slurryEmittingMsg: null,
  /** 其他说明 */
  remarks: null,
};
/** 搅拌数据 */
export const mixingInfoBase: MixingInfo =
{
  /** 用量 */
  dosage: [0, 0, 0],
  /** 开始时间 */
  startDate: null,
  /** 开始时间 */
  endDate: null,
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
};
