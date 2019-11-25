import { Hole, Comp } from "src/app/models/component";

import { FormGroup, Validators, FormBuilder, ValidatorFn, AbstractControl, FormArray } from "@angular/forms";
import { nameRepetition } from 'src/app/Validator/async.validator';

const fb = new FormBuilder();
/** 初始化数据 */
export function createFrom(data: Comp): FormGroup {
  return fb.group({
    id: [data.id],
    /** 名称 */
    name: [data.name, [Validators.required]],
    hole: bridgeForm(data.hole)
  });
}

/** 其他信息 */
export function bridgeForm(data: Array<Hole> = []): FormArray {
  const arr = fb.array([]);
  data.map((item, i) => {
    arr.push(bridgeControl(i, item));
  });
  return arr;
}
/** 其他form */
export function bridgeControl(index: number, item: Hole = { name: null, holes: [], imgBase64: null }): FormGroup {
  return fb.group({
    /** 名字 */
    name: [item.name, [Validators.required, arrayValidator(index)]],
    holes: [item.holes, [Validators.required]],
    imgBase64: [item.imgBase64]
  });
}

/**
 * 数组判断某个key重复
 *
 * @export
 * @param {number} index 下标
 * @param {string} arrKey 数组key
 * @param {string} [key='name'] 比较key
 * @returns {ValidatorFn}
 */
export function arrayValidator(index: number): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    if (control.value && control.root.get('hole')) {
      const values: Array<Hole> = control.root.get('hole').value;
      for (let i = 0; i < values.length; i++) {
        if (i !== index && values[i].name === control.value) {
          return { reperition: `${control.value} 已存在!!` };
        }
      }
    }
    return null;
  };
}
