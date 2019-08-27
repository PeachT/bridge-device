import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, FormArray, FormBuilder, Validators } from '@angular/forms';
import { AppService } from 'src/app/services/app.service';
import { arrayValidator } from 'src/app/Validator/repetition.validator';
import { Proportion } from 'src/app/models/grouting';

@Component({
  // tslint:disable-next-line: component-selector
  selector: 'grouting-proportion',
  templateUrl: './proportion.component.html',
  styleUrls: ['./proportion.component.less']
})
export class ProportionComponent implements OnInit {
  @Input() validateForm: FormGroup;
  @Input() keys = null;
  @Input() iselect = null;

  get proportionrFormArr(): FormArray {
    return this.validateForm.controls.proportions as FormArray;
  }

  constructor(
    public appS: AppService,
    private fb: FormBuilder,
  ) {
    console.log(this.validateForm);
  }

  ngOnInit() {
    console.log(this.validateForm);
    console.log(this.proportionrFormArr);
  }

  /** 其他信息 */
  createForm(data: Array<Proportion> = []) {
    const rarr = data.map((item, i) => {
      console.log(item);
      return this.proportionVisionsForm(i, item);
    });
    return rarr;
  }
  /** 其他form */
  proportionVisionsForm(index: number, item: Proportion = {name: null, type: null, value: null, total: null}) {
    return this.fb.group({
      name: [item.name, [Validators.required, arrayValidator(index, 'proportions', 'name')]],
      type: [item.type],
      value: [item.value, [Validators.required]],
      total: [item.total],
    });
  }
  /** 添加其他数据 */
  proportionAdd() {
    // tslint:disable-next-line:no-angle-bracket-type-assertion
    const control = <FormArray> this.validateForm.controls.proportions;
    const length = this.validateForm.value.proportions.length;
    control.push(this.proportionVisionsForm(length));
  }
  /** 删除其他数据 */
  proportionSub(index) {
    // tslint:disable-next-line:no-angle-bracket-type-assertion
    const control = <FormArray> this.validateForm.controls.proportions;
    control.removeAt(index);
  }

  bridgeOtherKeySelect() {
    const arr = this.proportionrFormArr.value.map(v => v.key);
    return this.keys.filter(v =>  arr.indexOf(v) === -1 );
  }
  /** 计算水浆比 */
  proportionCalculate() {
    const ps = this.validateForm.value.proportions as Array<Proportion>;
    let count = 0;
    ps.map((item, i) => {
      console.log(item.value);
      if (i > 0) {
        count += item.value || 0;
      }
    });
    const proportion = (ps[0].value / count).toFixed(2);
    console.log(proportion, count);
    this.validateForm.controls.proportion.setValue(proportion);
  }
}
