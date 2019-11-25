import { TaskBase, iBaseInit } from './base';
import { projectBase } from './projectInit';
import { JackItem } from './jack';

export const taskBaseInit: TaskBase = {
  ...iBaseInit,
  project: null,
  component: null,
  startDate: null,
  endDate: null,
  otherInfo: []
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
    name: '150T',
    equation: false,
    jackModel: '150T',
    pumpModel: 'CZB2X3-500',
    ...jackItem()
  },
  users: {
    name: null,
    password: null,
    jurisdiction: 0,
    operation: []
  },
  tension: {
    /** Id */
    id: null,
    /** 名称 */
    name: null,
    /** 创建日期 */
    // createdDate: any;
    /** 修改日期 */
    // modificationDate: any;
    /** 创建用户 */
    // user: any;
    project: null,
    /** 构建 */
    component: null,
    /** 开始时间 */
    startDate: null,
    /** 结束时间 */
    endDate: null,
    otherInfo: [],
    /** 梁长度 */
    beamLength: null,
    /** 张拉日期 */
    tensionDate: null,
    /** 浇筑日期 */
    castingDate: null,
    /** 张拉顺序 */
    sort: null,
    /** 设备编号 */
    deviceNo: null,
    /** 是否作为模板 */
    template: false,
    /** 施工员 */
    operator: null,
    /** 监理 */
    supervisors: null,
    /** 自检员 */
    qualityInspector: null,
    /** 张拉孔数据 */
    tensionHoleInfos: []
  }
};

function jackItem(): {[props: string]: JackItem} {
  const jackitems: any = {}
  const arr = ['A1','A2', 'B1','B2']
  arr.map(key => {
    jackitems[key] = {
      jackNo: key,
      pumpNo: 'LQ0001',
      a: 1,
      b: 0,
      date: null,
    }
  })
  return jackitems;
}


export enum baseEnum {
  project = 'project',
  comp = 'comp',
  jack = 'jack',
  users = 'users',
  tension = 'tension',
  groutingTask = 'groutingTask',
  groutingInfo = 'groutingInfo',
  groutingHoleitem = 'groutingHoleitem',
  mixingInfo = 'mixingInfo',
}

export function getModelBase(name: string) {
  return {...base[name]};
}

export function copyAny(data: any) {
  return Object.assign(JSON.parse(JSON.stringify(data)));
}
