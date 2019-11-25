import { ValidatorFn, AbstractControl } from '@angular/forms';
import { copyAny } from '../models/baseInit';

export function reperitionValidator(value: string, key: string = 'name'): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    if (control.dirty && control.root.value) {
      for (const item of control.root.value[value]) {
        console.log(item[key], control.value);
        if (!control.value || item[key] === control.value) {
          return { reperition: `${control.value} 已存在!!` };
        }
      }
    }
    return null;
  };
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
export function arrayValidator(index: number, arrKey: string | Array<string>, key: string): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    const rootvalue = control.root.value;

    if (control.dirty && rootvalue) {
      let values = copyAny(rootvalue);
      if (typeof(arrKey) === 'string' ) {
        values = values[arrKey];
      } else {
        arrKey.map(k => {
          values = values[k];
        });
      }
      console.log(values);

      values.splice(index, 1);
      for (const item of values) {
        if (!control.value || item[key] === control.value) {
          console.log(rootvalue, arrKey, control.value);
          return { reperition: `${control.value} 已存在!!` };
        }
      }
    }
    return null;
  };
}
