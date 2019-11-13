import { OtherInfo } from 'src/app/models/common';

import { Validators, ValidatorFn, AbstractControl, FormBuilder } from '@angular/forms';

const fb = new FormBuilder();
export function otherInfoForm(data: Array<OtherInfo>) {
  const formArr = fb.array([]);
  data.map((item, i) => {
    formArr.push(otherInfoForm_item(item, i))
  });
  return formArr;
}
export function otherInfoForm_item(item: OtherInfo, i: number) {
  return fb.group({
    /** 名字 */
    key: [item.key, [Validators.required, otherValidator(i)]],
    /** 内容 */
    value: [item.value, [Validators.required]],
  })
}
function otherValidator(index: number): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    if (control.value && control.root.get('otherInfo')) {
      const values: Array<OtherInfo> = control.root.get('otherInfo').value;
      for (let i = 0; i < values.length; i++) {
        if (i !== index && values[i].key === control.value) {
          return { reperition: `${control.value} 已存在!!` };
        }
      }
    }
    return null;
  };
}
