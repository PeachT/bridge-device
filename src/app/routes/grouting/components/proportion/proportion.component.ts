import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { FormGroup, FormArray, FormBuilder, Validators, ValidatorFn, AbstractControl } from '@angular/forms';
import { AppService } from 'src/app/services/app.service';
import { arrayValidator } from 'src/app/Validator/repetition.validator';
import { ProportionItem, ProportionInfo } from 'src/app/models/grouting';
import { waterBinderRatio } from 'src/app/Function/unit';

@Component({
  // tslint:disable-next-line: component-selector
  selector: 'grouting-proportion',
  templateUrl: './proportion.component.html',
  styleUrls: ['./proportion.component.less']
})
export class ProportionComponent implements OnInit, OnChanges {
  @Input() formGroup: FormGroup;
  @Input() keys = null;
  @Input() iselect = null;
  @Input() edit = true;
  @Input() data: ProportionInfo;

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
  ngOnChanges(changes: SimpleChanges) {
    console.log('配比数据更新', changes, this.data);
    this.piFormGroup.controls.waterBinderRatio.setValue(this.data.waterBinderRatio);
    this.createForm(this.data.proportions).map(si => {
      this.proportionrFormArr.push(si)
    })
  }
  /** 初始化Form */
  createForm(data: Array<ProportionItem>) {
    const rarr = data.map((item, i) => {
      return this.proportionControl(i, item);
    });
    return rarr;
  }
  /** 创建FromGroup */
  proportionControl(index: number, item: ProportionItem = { name: null, type: null, value: null }) {
    return this.fb.group({
      name: [item.name, [Validators.required, this.arrayValidator(index)]],
      type: [item.type],
      value: [item.value, [Validators.required]],
    });
  }
  /** 添加其他数据 */
  add() {
    const length = this.proportionrFormArr.value.length;
    this.proportionrFormArr.push(this.proportionControl(length, { name: `外加剂${length - 2}`, type: 'xx外加剂', value: 0 }));
  }
  /** 删除其他数据 */
  del(index) {
    this.proportionrFormArr.removeAt(index);
  }

  bridgeOtherKeySelect() {
    const arr = this.proportionrFormArr.value.map(v => v.key);
    return this.keys.filter(v => arr.indexOf(v) === -1);
  }
  /** 计算水浆比 */
  proportionCalculate() {
    const ps: Array<ProportionItem> = this.proportionrFormArr.value as Array<ProportionItem>;
    const proportion = waterBinderRatio(ps.map(p => p.value));
    this.piFormGroup.controls.waterBinderRatio.setValue(proportion);
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
  arrayValidator(index: number): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      if (control.value) {
        const values: Array<ProportionItem> = this.proportionrFormArr.getRawValue();
        for (let i = 0; i < values.length; i++) {
          if (i !== index && values[i].type === control.value) {
            return { reperition: `${control.value} 已存在!!` };
          }
        }
      }
      return null;
    };
  }
}
