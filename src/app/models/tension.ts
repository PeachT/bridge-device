import { TaskBase } from './base';
import { JackItem, TensionDevice } from './jack';
import { OtherInfo } from './common';

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
  tensionDate: Date | string | number;
  /** 浇筑日期 */
  castingDate: Date | string | number;
  /** 张拉顺序 */
  sort?: string;
  /** 设备编号 */
  deviceNo?: number;
  /** 是否作为模板 */
  template: boolean;
  /** 施工员 */
  operator: string;
  /** 监理 */
  supervisors: string;
  /** 自检员 */
  qualityInspector: string;
  /** 张拉孔数据 */
  tensionHoleInfos?: Array<TensionHoleInfo>;
}
export interface TensionHoleInfo {
  /** 孔号 */
  name: string;
  /** 张拉工艺(先张，后张，分级张拉第一级，分级张拉第二级等) */
  stretchDrawProcess: string;
  /** 张拉长度 */
  length: number;
  /** 钢绞线数量 */
  steelStrandNum: number;
  /** 张拉状态   =0 未张拉    =1一次张拉完成   =2 已张拉 */
  state: number;
  /** 上传状态 */
  uploading?: boolean;
  /** 其它数据 */
  otherInfo?: Array<OtherInfo>;
  /** task */
  tasks: Array<TensionHoleTask>;
}
/** 张拉任务 */
export interface TensionHoleTask {
  /** 二次张拉 */
  twice: boolean;
  /** 超张拉 */
  super: boolean;
  /** 补张拉 */
  mend: boolean;
  /** 设置张拉应力 */
  tensionKn: number;
  /** 张拉阶段 */
  stage: TensionStage;
  /** 张拉设备 */
  device: TensionDevice;
  /** 张拉模式  =42为4顶两端 =41为4顶单端  =21为2顶A1A2单端 =22为2顶A1B1单端 =23为2顶A1A2两端  =24为2顶B1B2两端 =25为2顶A1B1两端  =11为1顶A1单端  =12为1顶B1单端 =13为A1A2B1单端 */
  mode: number;
  /** 其它数据 */
  otherInfo?: Array<OtherInfo>;
  /** 张拉记录 */
  record?: TensionRecord;
}
/** 张拉阶段 */
export interface TensionStage {
  /** 张拉阶段应力百分比 */
  knPercentage: Array<number>;
  /** 阶段说明（初张拉 阶段一 超张拉 补张拉...） */
  msg: Array<string>;
  /** 阶段保压时间 */
  time: Array<number>;
  /** 卸荷比例 */
  uploadPercentage: number;
  /** 卸荷延时 */
  uploadDelay: number;
  A1?: CalculateInfo;
  A2?: CalculateInfo;
  B1?: CalculateInfo;
  B2?: CalculateInfo;
}

/** 计算数据 */
export interface CalculateInfo {
  /** 回缩量 */
  reboundMm: number;
  /** 工作长度 */
  wordMm: number;
  /** 理论申长量 */
  theoryMm: number;
}
/** 记录 */
export interface TensionRecord {
  /** 张拉状态 =1一次张拉完成   =2 已张拉 */
  state: number;
  /** 过程记录 */
  groups: Array<OnceRecord>
}
/** 每次张拉记录 */
export interface OnceRecord {
  /** 张拉阶段应力百分比 */
  knPercentage: Array<number>;
  /** 阶段名称 */
  msg: Array<string>;
  /** 阶段保压时间 */
  time: Array<number>;
  /** 卸荷比例 */
  uploadPercentage: number;
  /** 卸荷延时 */
  uploadDelay: number;
  /** 阶段记录 */
  A1: TensionRecordStage;
  A2: TensionRecordStage;
  B1: TensionRecordStage;
  B2: TensionRecordStage;
  /** 张拉过程数据 */
  datas: Process;
}
/** 张拉阶段记录 */
export interface TensionRecordStage {
  /** 阶段压力 */
  mpa: Array<number>;
  /** 阶段位移 */
  mm: Array<number>;
  /** 回油压力 */
  initMpa: number;
  /** 回油位移 */
  initMm: number;
}
/** 张拉过程数据 */
export interface Process {
  /** 采集频率 */
  hz: number;
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
export const TensionTaskIndex = '++id, name, component, project';


/** 张拉记录结果计算 */
export interface RecordCompute {
  stage?: Array<{
    A1?: {
      LZ: number;
      DR: number;
      Sn: number;
    },
    A2?: {
      LZ: number;
      DR: number;
      Sn: number;
    },
    B1?: {
      LZ: number;
      DR: number;
      Sn: number;
    },
    B2?: {
      LZ: number;
      DR: number;
      Sn: number;
    },
  }>;
  A1LZ?: number;
  A1DR?: number;
  B1LZ?: number;
  B1DR?: number;
}

export interface ManualGroup {
  deviceId: number;
  mode: number;
  hole: Array<string>;
}
