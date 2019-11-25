import { FormGroup, FormBuilder, Validators, FormArray, ValidatorFn, AbstractControl } from '@angular/forms';
import { GroutingTask, ProportionItem, ProportionInfo, MixingInfo, GroutingInfo, GroutingHoleItem } from 'src/app/models/grouting';
import { otherInfoForm } from 'src/app/shared/add-other/createFrom';
import { createFormGroup } from 'src/app/Function/createForm';


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
    tensionDate: [data.tensionDate, [Validators.required]],
    /** 浇筑日期 */
    castingDate: [data.castingDate, [Validators.required]],
    /** 压浆顺序 */
    sort: [data.sort],
    /** 设备编号 */
    deviceNo: [data.deviceNo],
    /** 是否作为模板 */
    template: [data.template],
    /** 其他数据信息 */
    otherInfo: otherInfoForm(data.otherInfo),
    /** 施工员 */
    operator: [data.operator],
    /** 监理员 */
    supervisors: [data.supervisors],
    /** 自检员 */
    qualityInspector: [data.qualityInspector],
    /** 配比信息 */
    proportionInfo: proportionInfoForm(data.proportionInfo),
    /** 搅拌数据 */
    mixingInfo: mixingForm(data.mixingInfo),
    groutingInfo: groutingInfoForm(data.groutingInfo)
  });
}


/** 初始化Form */
function proportionInfoForm(data: ProportionInfo): FormGroup {
  return fb.group({
    waterBinderRatio: [data.waterBinderRatio],
    proportions: proportionFormArray(data.proportions)
  });
}

function proportionFormArray(data: Array<ProportionItem>): FormArray {
  const arr = fb.array([]);
  data.map((item, i) => {
    arr.push(proportionControl(i, item));
  });
  return arr;
}
/** 创建FromGroup */
export function proportionControl(index: number, item: ProportionItem = { name: null, type: null, value: null }) {
  return fb.group({
    name: [item.name, [Validators.required, proportionControlValidator(index)]],
    type: [item.type],
    value: [item.value, [Validators.required]],
  });
}
/**
 * 配比数组判断某个key重复
 *
 * @export
 * @param {number} index 下标
 * @param {string} arrKey 数组key
 * @param {string} [key='name'] 比较key
 * @returns {ValidatorFn}
 */
export function proportionControlValidator(index: number): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    if (control.value && control.root.get('proportions')) {
      const values: Array<ProportionItem> = control.root.get('proportions').value;
      for (let i = 0; i < values.length; i++) {
        if (i !== index && values[i].type === control.value) {
          return { reperition: `${control.value} 已存在!!` };
        }
      }
    }
    return null;
  };
}

function mixingForm(mixingInfos: Array<MixingInfo> = []): FormArray {
  const arr = fb.array([]);
  mixingInfos.map(d => {
    arr.push(mixingFormGroup(d));
  })
  return arr;
}
function mixingFormGroup(mixingInfo: MixingInfo): FormGroup {
  return fb.group({
    /** 用量 */
    dosage: fb.array(mixingInfo.dosage),
    /** 搅拌开始时间 */
    startDate: [mixingInfo.startDate],
    /** 搅拌完成时间 */
    endDate: [mixingInfo.startDate],
    /** 搅拌时间s */
    mixingTime: [mixingInfo.mixingTime],
    /** 泌水率 */
    bleedingRate: [mixingInfo.bleedingRate],
    /** 流动度 */
    fluidity: [mixingInfo.fluidity],
    /** 流动度 */
    initFluidity: [mixingInfo.initFluidity],
    /** 黏稠度 */
    viscosity: [mixingInfo.viscosity],
    /** 水胶比 */
    waterBinderRatio: [mixingInfo.waterBinderRatio],
    /** 水温 */
    waterTemperature: [mixingInfo.waterTemperature],
    /** 环境温度 */
    envTemperature: [mixingInfo.envTemperature],
  });
}


function groutingInfoForm(arrData: Array<GroutingInfo> = []): FormArray {
  const arr = fb.array([]);
  arrData.map(d => {
    arr.push(groutingInfoFormGroup(d));
  })
  return arr;
}
function groutingInfoFormGroup(data: GroutingInfo) {
  return fb.group({
    /** 孔号 */
    name: [data.name],
    /** 压浆孔道采集数据 */
    groups: recordForm(data.groups),
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
    otherInfo: otherInfoForm(data.otherInfo)
  });
}

function recordForm(arrData: Array<GroutingHoleItem> = []): FormArray {
  const arr = fb.array([]);
  arrData.map(d => {
    arr.push(recordFormGroup(d));
  })
  return arr;
}
function recordFormGroup(data: GroutingHoleItem): FormGroup {
  const fg = createFormGroup(data);
  fg.setControl('otherInfo', otherInfoForm(data.otherInfo))
  return fg;
}
