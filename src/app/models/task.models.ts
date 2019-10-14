import { TaskBase } from './base';
import { JackItem, Jack } from './jack';

export interface TensionTask extends TaskBase {
  //   /** Id */
  //   id?: any;
  //   /** 名称 */
  //   name: string;
  //   /** 创建日期 */
  //   createdDate?: any;
  //   /** 修改日期 */
  //   modificationDate?: any;
  //   /** 创建用户 */
  //   user?: any;
  //   project: number;
  //   component: any;
  //   /** 开始时间 */
  //   startDate: any;
  //   /** 结束时间 */
  //   endDate: any;
  //   otherInfo?: Array<OtherInfo>;
  /** 梁长度 */
  beamLength: number;
  /** 张拉日期 */
  tensinDate: Date | string;
  /** 浇筑日期 */
  castingDate: Date | string;
  /** 张拉顺序 */
  sort?: string;
  /** 设备编号 */
  deviceNo?: number;
  /** 是否作为模板 */
  template: boolean;
  /** 张拉孔数据 */
  tensionHoleInfos: Array<TensionHoleInfo>;
}
export interface TensionHoleInfo {
  /** 孔号 */
  name: string;
  /** 张拉模式  =42为4顶两端 =41为4顶单端  =21为2顶A1A2单端 =22为2顶A1B1单端 =23为2顶A1A2两端  =24为2顶B1B2两端 =25为2顶A1B1两端  =11为1顶A1单端  =12为1顶B1单端 =13为A1A2B1单端 */
  mode: string;
  /** 张拉工艺(先张，后张，分级张拉第一级，分级张拉第二级等) */
  stretchDrawProcess: string;
  /** 张拉长度 */
  length: number;
  /** 钢绞线数据 */
  steelStrandNumber: number;
  /** 设置张拉应力 */
  tensionKn: number;
  /** 张拉阶段 */
  stage: TensionStage;
  /** 二次张拉 */
  twice: boolean;
  /** 超张拉 */
  super: boolean;
  /** 补张拉 */
  mend: boolean;
  /** 张拉状态   =0 未张拉    =1一次张拉完成   =2 已张拉 */
  state: number;
  /** 张拉设备 */
  devices: Array<DeviceInfo>;
  /** 张拉记录 */
  record?: Record;
}
/** 张拉阶段 */
export interface TensionStage {
  /** 张拉阶段应力百分比 */
  knPercentage: Array<number>;
  /** 阶段说明（初张拉 阶段一 超张拉 补张拉...） */
  msg: Array<string>;
  /** 阶段保压时间 */
  time: Array<string>;
}

/** 设备信息 */
export interface DeviceInfo {
  /** 方程类型 */
  equation: boolean;
  /** 千斤顶型号 */
  jackModel: string;
  /** 油泵型号 */
  pumpModel: string;
  A1?: DeviceInfo;
  A2?: DeviceInfo;
  B1?: DeviceInfo;
  B2?: DeviceInfo;
}
export interface DeviceItem {
  /** 千斤顶编号 */
  jackNo: string;
  /** 油泵编号 */
  pumpNo: string;
  /** 标定系数a */
  a: number;
  /** 标定系数b */
  b: number;
  /** 标定日期 */
  date: Date | string;
}
/** 记录 */
export interface Record {
  /** 记录阶段 */
  stage: TensionRecordStage;
  /** 二次张拉 */
  twice: boolean;
  /** 超张拉 */
  super: boolean;
  /** 补张拉 */
  mend: boolean;
  /** 张拉状态 =1一次张拉完成   =2 已张拉 */
  state: number;
  /** 张拉过程数据 */
  datas: Process;
}
/** 张拉记录阶段 */
export interface TensionRecordStage {
  /** 阶段压力 */
  mpa: Array<string>;
  /** 阶段保压时间 */
  time: Array<string>;
}
/** 张拉过程数据 */
export interface Process {
  /** 时间戳 */
  date: Array<number | string>;
  A1?: JackProcess;
  A2?: JackProcess;
  B1?: JackProcess;
  B2?: JackProcess;
  /** 说明 */
  msg?: Array<Make>;
}
/** 过程信息记录 */
export interface Make {
  /** 说明 */
  msg?: any;
  /** 过程index */
  index?: number;
}
/** 顶过程记录 */
export interface JackProcess {
  /** 压力记录 */
  mpa: Array<number>;
  /** 位移记录 */
  mm: Array<number>;
}

/** 用户索引 */
export const TaskIndex = '++id, name, component, project';
