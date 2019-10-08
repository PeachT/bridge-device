import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, FormArray, FormBuilder, Validators } from '@angular/forms';
import { AppService } from 'src/app/services/app.service';
import { arrayValidator } from 'src/app/Validator/repetition.validator';
import { ProportionItem } from 'src/app/models/grouting';
import { createProportionFormItem } from '../../createForm';

@Component({
  // tslint:disable-next-line: component-selector
  selector: 'grouting-proportion',
  templateUrl: './proportion.component.html',
  styleUrls: ['./proportion.component.less']
})
export class ProportionComponent implements OnInit {
  @Input() formGroup: FormGroup;
  @Input() keys = null;
  @Input() iselect = null;
  @Input() edit = true;

  get proportionrFormArr(): FormArray {
    const pi = this.formGroup.controls.proportionInfo as FormGroup;
    return pi.controls.proportions as FormArray;
  }
  get piFormGroup(): FormGroup {
    return this.formGroup.controls.proportionInfo as FormGroup;
  }

  constructor(
    public appS: AppService,
    private fb: FormBuilder,
  ) {
    console.log(this.formGroup);
  }

  ngOnInit() {
    console.log(this.formGroup);
    console.log(this.proportionrFormArr);
  }

  /** 其他信息 */
  createForm(data: Array<ProportionItem> = []) {
    const rarr = data.map((item, i) => {
      console.log(item);
      return this.proportionVisionsForm(i, item);
    });
    return rarr;
  }
  /** 其他form */
  proportionVisionsForm(index: number, item: ProportionItem = {name: null, type: null, value: null}) {
    return this.fb.group({
      name: [item.name, [Validators.required, arrayValidator(index, 'proportions', 'name')]],
      type: [item.type],
      value: [item.value, [Validators.required]],
    });
  }
  /** 添加其他数据 */
  add() {
    // tslint:disable-next-line:no-angle-bracket-type-assertion
    const control = <FormArray> this.piFormGroup.controls.proportions;
    const length = this.piFormGroup.value.proportions.length;
    control.push(createProportionFormItem({ name: `外加剂${length - 2}`, type: 'xx外加剂', value: 0 }, length));
  }
  /** 删除其他数据 */
  del(index) {
    // tslint:disable-next-line:no-angle-bracket-type-assertion
    const control = <FormArray> this.piFormGroup.controls.proportions;
    control.removeAt(index);
  }

  bridgeOtherKeySelect() {
    const arr = this.proportionrFormArr.value.map(v => v.key);
    return this.keys.filter(v =>  arr.indexOf(v) === -1 );
  }
  /** 计算水浆比 */
  proportionCalculate() {
    const ps: Array<ProportionItem> = this.piFormGroup.value.proportions as Array<ProportionItem>;
    let count = 0;
    ps.map((item, i) => {
      console.log(item.value);
      if (i > 0) {
        count += item.value || 0;
      }
    });
    const proportion = (ps[0].value / count).toFixed(2);
    console.log(proportion, count);
    this.piFormGroup.controls.waterBinderRatio.setValue(proportion);
  }
}
