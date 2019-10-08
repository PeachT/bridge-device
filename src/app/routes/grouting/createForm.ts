import { FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';
import { ProportionItem, MixingInfo, GroutingInfo, GroutingHoleItem, GroutingTask } from 'src/app/models/grouting';
import { arrayValidator } from 'src/app/Validator/repetition.validator';
import { OtherInfo } from 'src/app/models/common';

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
export const groutingHoleitemBase = {
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
};
const fb = new FormBuilder();
export function createForm(data: GroutingTask): FormGroup {
  return fb.group({
    id: [data.id],
    project: [data.project],
    /** 梁号 */
    name: [data.name, [Validators.required]],
    /** 构建 */
    component: [data.component, [Validators.required]],
    /** 梁长度 */
    beamLength: [data.beamLength, [Validators.required]],
    /** 张拉日期 */
    tensinDate: [data.tensinDate, [Validators.required]],
    /** 浇筑日期 */
    castingDate: [data.castingDate, [Validators.required]],
    /** 压浆顺序 */
    sort: [data.sort],
    /** 设备编号 */
    deviceNo: [data.deviceNo],
    /** 是否作为模板 */
    template: [data.template],
    /** 其他数据信息 */
    otherInfo: otherInfoForm([]),
    /** 施工员 */
    operator: [data.operator],
    /** 监理员 */
    supervisors: [data.supervisors],
    /** 自检员 */
    qualityInspector: [data.qualityInspector],
    /** 配比信息 */
    proportionInfo: fb.group({
      waterBinderRatio: [0.28],
      proportions: createProportionForm([
        { name: '水', type: '水', value: 30 },
        { name: '水泥', type: '水泥', value: 100 },
        { name: '压浆剂', type: '压浆剂', value: 10 },
      ])
    }),
    /** 搅拌数据 */
    // mixingInfo: createMixingInfoForm([]),
    // groutingInfo: createGroutingInfoForm([])
  });
}

function createProportionForm(datas: Array<ProportionItem>): FormArray {
  return createFormArray(datas, createProportionFormItem);
}
export function createProportionFormItem(item: ProportionItem = null, i: number) {
  return fb.group({
    name: [null, [Validators.required, arrayValidator(i, ['proportionInfo', 'proportions'], 'name')]],
    type: [],
    value: [null, [Validators.required]],
  });
}

export function createMixingInfoForm(datas: Array<MixingInfo>): FormArray {
  return createFormArray(datas, createMixingInfoFormItem, true);
}
export function createMixingInfoFormItem(data: MixingInfo) {
  return fb.group({
    /** 用量 */
    dosage: fb.array(data.dosage || [null, null, null, null, null, null]),
    /** 开始时间 */
    startTime: [data.startTime],
    /** 搅拌时间s */
    mixingTime: [data.mixingTime],
    /** 泌水率 */
    bleedingRate: [data.bleedingRate],
    /** 流动度 */
    fluidity: [data.fluidity],
    /** 黏稠度 */
    viscosity: [data.viscosity],
    /** 水胶比 */
    waterBinderRatio: [data.waterBinderRatio],
    /** 水温 */
    waterTemperature: [data.waterTemperature],
    /** 环境温度 */
    envTemperature: [data.envTemperature],
  });
}


export function createGroutingInfoForm(datas: Array<GroutingInfo>) {
  return createFormArray(datas, createGroutingInfo, true);
}
function createGroutingInfo(data: GroutingInfo) {
  const fg = fb.group({
    /** 孔号 */
    name: [data.name],
    /** 压浆孔道采集数据 */
    groups: groutingHoleItemForm(data.groups || []),
    /** 孔道内径 */
    holeDiameter: [data.holeDiameter],
    /** 孔道长度 */
    holeLength: [data.holeLength],
    /** 钢绞线数量 */
    steelStrandNum: [data.steelStrandNum],
    /** 上传状态 */
    uploading: [data.uploading],
    /** 压浆状态 */
    state: [data.state],
    /** 其他数据 */
    otherInfo: groutingInfoOtherInfoForm(data.otherInfo || []),
  });
  // const arr = fg.controls.groups as FormArray;
  fg.controls.groups = groutingHoleItemForm(data.groups);
  // fg.setValue(data);
  return fg;
}
export function groutingHoleItemForm(datas: Array<GroutingHoleItem>) {
  return createFormArray(datas, groutingHoleItemFormGroupItem, true);
}
export function groutingHoleItemFormGroupItem(data: GroutingHoleItem) {
  return fb.group({
    /** 压浆方向 */
    direction: [data.direction],
    /** 设置压浆压力 */
    setGroutingPressure: [data.setGroutingPressure],
    /** 环境温度 */
    envTemperature: [data.envTemperature],
    /** 浆液温度 */
    slurryTemperature: [data.slurryTemperature],
    /** 开始时间 */
    startDate: [data.startDate],
    /** 完成时间 */
    endDate: [data.endDate],
    /** 进浆压力 */
    intoPulpPressure: [data.intoPulpPressure],
    /** 回浆压力 */
    outPulpPressure: [data.outPulpPressure],
    /** 进浆量 (L) */
    intoPulpvolume: [data.intoPulpvolume],
    /** 回浆量 (L) */
    outPulpvolume: [data.outPulpvolume],
    /** 真空泵压力 */
    vacuumPumpPressure: [data.vacuumPumpPressure],
    /** 稳压时间 */
    steadyTime: [data.steadyTime],
    /** 通过情况 */
    passMsg: [data.passMsg],
    /** 冒浆情况 */
    slurryEmittingMsg: [data.slurryEmittingMsg],
    /** 其他说明 */
    remarks: [data.remarks],
    // otherInfo: this.fb.array(this.otherIngoDom.createForm([])),
  });
  // fg.setValue(gh);
}
/** 其他form */
function groutingInfoOtherInfoForm(datas: Array<OtherInfo>) {
  return createFormArray(datas, groutingInfoOtherInfoFormItem);
}
export function groutingInfoOtherInfoFormItem(item: OtherInfo = { key: null, value: null }, index: number): FormGroup {
  return fb.group({
    /** 名字 */
    key: [item.key, [Validators.required, arrayValidator(index, ['groutingInfo', 'otherInfo'], 'key')]],
    /** 内容 */
    value: [item.value, [Validators.required]],
  });
}
/** 其他form */
function otherInfoForm(datas: Array<OtherInfo>) {
  return createFormArray(datas, otherInfoFormItem);
}
export function otherInfoFormItem(item: OtherInfo = { key: null, value: null }, index: number): FormGroup {
  return fb.group({
    /** 名字 */
    key: [item.key, [Validators.required, arrayValidator(index, 'otherInfo', 'key')]],
    /** 内容 */
    value: [item.value, [Validators.required]],
  });
}

/** 其他form */

function createFormArray<T>(
  datas: Array<T>,
  createFormItem: ((data: T, index: number, ) => FormGroup) | ((data: T) => FormGroup),
  state: boolean = false
): FormArray {
  const af = new FormArray([]);
  datas.map((item, i) => {
    if (state) {
      af.push(createFormItem(item, i));
    } else {
      const c = createFormItem as (data: T) => FormGroup;
      af.push(c(item));
    }
  })
  return af;
}

