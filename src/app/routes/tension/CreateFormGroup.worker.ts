import { TensionTask, TensionHoleInfo, TensionHoleTask, TensionStage, OnceRecord } from "src/app/models/tension";
import { FormBuilder, Validators, AbstractControl, ValidatorFn, FormGroup, FormArray } from '@angular/forms';
import { OtherInfo } from 'src/app/models/common';
import { getModeStr } from 'src/app/Function/tension';
import { otherInfoForm } from 'src/app/shared/add-other/createFrom';

const fb = new FormBuilder();

export function createForm(data: TensionTask): Promise<FormGroup> {
  return new Promise((r, j) => {
    r(
      fb.group({
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
        otherInfo: otherInfoForm(data.otherInfo),
        /** 施工员 */
        operator: [data.operator],
        /** 监理员 */
        supervisors: [data.supervisors],
        /** 自检员 */
        qualityInspector: [data.qualityInspector],
        tensionHoleInfos: holeForm(data.tensionHoleInfos),
      })
    );
  })
}

export function holeForm(datas: Array<TensionHoleInfo>): FormArray {
  const form = fb.array([], [Validators.required]);
  datas.map(data => {
    form.push(holeForm_item(data))
  });
  return form;
}
export function holeForm_item(data: TensionHoleInfo) {
  return fb.group({
    /** 孔号 */
    name: [data.name],
    /** 张拉工艺(先张，后张，分级张拉第一级，分级张拉第二级等) */
    stretchDrawProcess: [data.stretchDrawProcess],
    /** 张拉长度 */
    length: [data.length],
    /** 钢绞线数据 */
    steelStrandNum: [data.steelStrandNum],
    /** 张拉状态 */
    state: [data.state],
    /** 上传状态 */
    uploading: [data.uploading],
    /** 其他数据 */
    otherInfo: otherInfoForm(data.otherInfo),
    tasks: holeGroupForm(data.tasks),
  })
}

export function holeGroupForm(datas: Array<TensionHoleTask>) {
  const form = fb.array([]);
  datas.map(data => {
    form.push(holeGroupForm_item(data))
  });
  return form;
}
export function holeGroupForm_item(data: TensionHoleTask) {
  return fb.group({
    /** 二次张拉 */
    twice: [data.twice],
    /** 超张拉 */
    super: [data.super],
    /** 补张拉 */
    mend: [data.mend],
    /** 设置张拉应力 */
    tensionKn: [data.tensionKn],
    /** 张拉设备 */
    device: [data.device],
    deviceId: [data.device.id],
    mode: [data.mode],
    /** 张拉阶段 */
    stage: stageForm(data.stage, data.mode),
    otherInfo: otherInfoForm(data.otherInfo),
    /** 张拉记录 */
    record: fb.group({
      state: [data.record.state || null],
      groups: recordForm(data.record.groups, data.mode)
    }),
  })
}

export function stageForm(data: TensionStage, mode: number) {
  const strMode = getModeStr(mode);
  const fg = fb.group({
    uploadPercentage: [data.uploadPercentage, Validators.required],
    uploadDelay: [data.uploadDelay, Validators.required],
    knPercentage: stageJackForm(data.knPercentage, true),
    msg: stageJackForm(data.msg),
    time: stageJackForm(data.time)
  })

  strMode.map(key => {
    fg.addControl(key,
      fb.group(
        {
          reboundMm: [data[key].reboundMm, Validators.required],
          wordMm: [data[key].wordMm, Validators.required],
          theoryMm: [data[key].theoryMm, Validators.required]
        }
      )
    );
  });
  return fg;
}
function stageJackForm(data: Array<any>, validator = null) {
  const arrForm = fb.array([]);
  data.map((item, index) => {
    if (validator === 'knPercentageValidator') {
      arrForm.push(fb.control(item, [Validators.required, knPercentageValidator(index)]));
    } else {
      arrForm.push(fb.control(item, [Validators.required]));
    }
  })
  return arrForm;
}
/** 阶段百分比验证 */
export function knPercentageValidator(index: number): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    if (control.value && control.root.get('knPercentage')) {
      const values: Array<OtherInfo> = control.root.get('knPercentage').value;
      for (let i = 0; i < values.length; i++) {
        if (i !== index && ((index === 0 && i !== 1) || index !== 0)) {
          if (
            !((index > i && control.value >= values[i]) ||
              (index < i && control.value <= values[i]))
          ) {
            // console.log(i, index, control.value, values[i]);
            return { stage: `设置有误！` };
          }
        }
      }
    }
    return null;
  };
}

export function recordForm(datas: Array<OnceRecord>, mode: number): FormArray {
  const strMode = getModeStr(mode);
  const arrForm = fb.array([]);
  datas.map((data: OnceRecord, index) => {
    const items: any = {}
    strMode.map((key) => {
      items[key] = fb.group({
        mpa: fb.array(data[key].mpa),
        mm: fb.array(data[key].mm),
        initMpa: [data[key].initMpa],
        initMm: [data[key].initMm],
      })
    })
    // DRCompote(data.mode);
    arrForm.push(fb.group({
      ...items,
      /** 卸荷比例 */
      knPercentage: fb.array(data.knPercentage),
      /** 张拉阶段 */
      msg: fb.array(data.msg),
      /** 保压时间 */
      time: fb.array(data.time),
      /** 卸荷延时 */
      uploadPercentage: [data.uploadPercentage],
      /** 阶段比例 */
      uploadDelay: [data.uploadDelay],
      /** 张拉过程记录 */
      datas: [data.datas],
      /** 开始时间 */
      startDate: [data.startDate],
      /** 完成时间 */
      endDate: [data.endDate]
    }));
  })
  return arrForm;
}
