import { TensionTask } from "src/app/models/tension";
import { FormBuilder, Validators } from '@angular/forms';
import { OtherInfo } from 'src/app/models/common';

const fb = new FormBuilder();

function createForm(data: TensionTask) {
  const formGroup = fb.group({
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
    /** 张拉顺序 */
    sort: [data.sort],
    /** 设备编号 */
    deviceNo: [data.deviceNo],
    /** 是否作为模板 */
    template: [data.template],
    /** 其他数据信息 */
    otherInfo: createOhterInfoForm(data.otherInfo),
    /** 施工员 */
    operator: [data.operator],
    /** 监理员 */
    supervisors: [data.supervisors],
    /** 自检员 */
    qualityInspector: [data.qualityInspector],
    tensionHoleInfos: fb.array([], [Validators.required]),
  });
}

function createOhterInfoForm(data: Array<OtherInfo> = []) {
  const formArr = fb.array([]);
  data.map((item, i) => {
    formArr.push(fb.group({
      /** 名字 */
      key: [item.key, [Validators.required, this.arrayValidator(i)]],
      /** 内容 */
      value: [item.value, [Validators.required]],
    }))
  });
  return formArr;
}
