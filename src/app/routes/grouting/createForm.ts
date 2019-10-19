import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { GroutingTask } from 'src/app/models/grouting';


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
    tensinDate: [data.tensionDate, [Validators.required]],
    /** 浇筑日期 */
    castingDate: [data.castingDate, [Validators.required]],
    /** 压浆顺序 */
    sort: [data.sort],
    /** 设备编号 */
    deviceNo: [data.deviceNo],
    /** 是否作为模板 */
    template: [data.template],
    /** 其他数据信息 */
    otherInfo: fb.array([]),
    /** 施工员 */
    operator: [data.operator],
    /** 监理员 */
    supervisors: [data.supervisors],
    /** 自检员 */
    qualityInspector: [data.qualityInspector],
    /** 配比信息 */
    proportionInfo: fb.group({
      waterBinderRatio: [0.28],
      proportions: fb.array([])
    }),
    /** 搅拌数据 */
    mixingInfo: fb.array([]),
    groutingInfo: fb.array([]),
  });
}
