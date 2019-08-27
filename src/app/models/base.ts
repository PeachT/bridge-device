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

const base = {
  project: {
    id: null,
    createdDate: null,
    modificationDate: null,
    jurisdiction: 0,
    user: null,
    name: null,
    uploadingName: null,
    uploadingMode: false,
    uploadingLinkData: null,
    uploadingBackData: null,
    otherInfo: [],
    supervisions: [
      {
        name: null,
        phone: null,
        unit: null,
        ImgBase64: null,
      }
    ],
  },
  comp: {
    id: null,
    createdDate: null,
    modificationDate: null,
    user: null,
    name: null,
    hole: [
      {
        name: null,
        ImgBase64: null,
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
    id: null,
    createdDate: null,
    modificationDate: null,
    user: null,
    name: null,
    password: null,
    jurisdiction: 0,
    operation: ['see']
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
    entDate: null,
    groups: [],
  },
  grouting: {
    id: null,
    createdDate: null,
    modificationDate: null,
    user: null,
    project: null,
    /** 构建名称与梁名称 */
    component: null,
    holeRadio: null,
    /** 气温 */
    airTemperature: null,
    /** 水温 */
    waterTemperature: null,
    /** 压浆温度 */
    groutingTemperature: null,
    /** 泌水率 */
    bleedingRate: null,
    /** 流动度 */
    mobility: null,
    /** 黏稠度 */
    viscosity: null,
    /** 压浆量 */
    groutingDosage: null,
    /** 浆液水浆比 */
    proportion: null,
    proportions: [
      {name: '水', type: '水', value: 28, total: null},
      {name: '水泥', type: '水泥', value: 100, total: null},
    ],
    /** 第一个孔完成开始时间 */
    startDate: null,
    /** 最后一个孔完成时间 */
    entDate: null,
    /** 其他信息 */
    otherInfo: [{ key: '浇筑日期', value: null }],
    /** 压浆组信息 */
    groups: null,
  }
};

export function getModelBase(name: string) {
  return Object.assign(JSON.parse(JSON.stringify(base[name])));
}

export function copyAny(data: any) {
  return Object.assign(JSON.parse(JSON.stringify(data)));
}
