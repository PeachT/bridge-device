import { groutingInfoBase, groutingHoleitemBase, mixingInfoBase, groutingTaskBase } from './groutingBase';
import { projectBase } from './projectBase';
import { OtherInfo } from './common';

export interface IBase {
  /** Id */
  id?: any;
  /** 名称 */
  name: string;
  /** 创建日期 */
  createdDate?: any;
  /** 修改日期 */
  modificationDate?: any;
  /** 创建用户 */
  user?: any;
}
export interface TaskBase extends IBase {
  project: number;
  component: any;
  /** 开始时间 */
  startDate: any;
  /** 结束时间 */
  endDate: any;
  otherInfo?: Array<OtherInfo>;
}

const base = {
  project: projectBase,
  comp: {
    name: null,
    hole: [
      {
        name: null,
        holes: []
      }
    ],
  },
  jack: {
    id: null,
    createdDate: null,
    modificationDate: null,
    user: null,
    name: null,
    jackMode: 2,
    equation: false,
    jackModel: null,
    pumpModel: null,
    saveGroup: null,
    state: true,
    link: true,
    zA: {
      jackNumber: 'zA',
      pumpNumber: 'Z',
      upper: 180,
      floot: 105,
      a: 1,
      b: 0,
      date: null,
      mm: [1, 1, 1, 1, 1, 1],
    },
    zB: {
      jackNumber: 'zB',
      pumpNumber: 'Z',
      upper: 180,
      floot: 105,
      a: 1,
      b: 0,
      date: null,
      mm: [1, 1, 1, 1, 1, 1],
    },
    zC: {
      jackNumber: 'zC',
      pumpNumber: 'Z',
      upper: 180,
      floot: 105,
      a: 1,
      b: 0,
      date: null,
      mm: [1, 1, 1, 1, 1, 1],
    },
    zD: {
      jackNumber: 'zD',
      pumpNumber: 'Z',
      upper: 180,
      floot: 105,
      a: 1,
      b: 0,
      date: null,
      mm: [1, 1, 1, 1, 1, 1],
    },
    cA: {
      jackNumber: 'cA',
      pumpNumber: 'C',
      upper: 180,
      floot: 105,
      a: 1,
      b: 0,
      date: null,
      mm: [1, 1, 1, 1, 1, 1],
    },
    cB: {
      jackNumber: 'cB',
      pumpNumber: 'C',
      upper: 180,
      floot: 105,
      a: 1,
      b: 0,
      date: null,
      mm: [1, 1, 1, 1, 1, 1],
    },
    cC: {
      jackNumber: 'cC',
      pumpNumber: 'C',
      upper: 180,
      floot: 105,
      a: 1,
      b: 0,
      date: null,
      mm: [1, 1, 1, 1, 1, 1],
    },
    cD: {
      jackNumber: 'cD',
      pumpNumber: 'C',
      upper: 180,
      floot: 105,
      a: 1,
      b: 0,
      date: null,
      mm: [1, 1, 1, 1, 1, 1],
    },
  },
  users: {
    name: null,
    password: null,
    jurisdiction: 0,
    operation: []
  },
  task: {
    id: null,
    createdDate: null,
    modificationDate: null,
    user: null,
    name: null,
    project: null,
    device: null,
    component: null,
    steelStrand: null,
    otherInfo: [{ key: '浇筑日期', value: null }],
    holeRadio: null,
    startDate: null,
    endDate: null,
    groups: [],
  },
  groutingTask: groutingTaskBase,
  groutingInfo: groutingInfoBase,
  groutingHoleitem: groutingHoleitemBase,
  mixingInfo: mixingInfoBase,
};

export enum baseEnum {
  project = 'project',
  comp = 'comp',
  jack = 'jack',
  users = 'users',
  task = 'task',
  groutingTask = 'groutingTask',
  groutingInfo = 'groutingInfo',
  groutingHoleitem = 'groutingHoleitem',
  mixingInfo = 'mixingInfo',
}

export function getModelBase(name: string) {
  // return Object.assign(JSON.parse(JSON.stringify(base[name])));
  return {...base[name]};
}

export function copyAny(data: any) {
  return Object.assign(JSON.parse(JSON.stringify(data)));
}
