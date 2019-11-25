import { projectBase } from './projectInit';
import { OtherInfo } from './common';
import { JackItem } from './jack';
import { groutingInfoInit, groutingTaskInit, groutingHoleItemInit, mixingInfoInit } from './groutingInit';

export interface IBase {
  /** 唯一编号 */
  uuid: string;
  /** Id */
  id: any;
  /** 名称 */
  name: string;
  /** 创建日期 */
  createdDate: any;
  /** 修改日期 */
  modificationDate: any;
  /** 创建用户 */
  user: any;
}
export const iBaseInit: IBase = {
  uuid: null,
  id: null,
  name: null,
  createdDate: null,
  modificationDate: null,
  user: null,
}
export interface TaskBase extends IBase {
  project: number;
  component: any;
  /** 开始时间 */
  startDate: any;
  /** 结束时间 */
  endDate: any;
  otherInfo: Array<OtherInfo>;
}


