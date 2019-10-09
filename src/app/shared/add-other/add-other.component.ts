import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { FormGroup, FormArray, Validators, FormBuilder, ValidatorFn, AbstractControl } from '@angular/forms';
import { AppService } from 'src/app/services/app.service';
import { OtherInfo } from 'src/app/models/common';

@Component({
  selector: 'app-add-other',
  templateUrl: './add-other.component.html',
  styleUrls: ['./add-other.component.less']
})
export class AddOtherComponent implements OnInit, OnChanges {
  @Input() formGroup: FormGroup;
  /** 候选的KEY */
  @Input() keys = [];
  @Input() iselect = null;
  @Input() edit = false;
  @Input() data: Array<OtherInfo> = [];
  @Input() nameKey = null;

  get otherInfoFormArr(): FormArray {
    return this.formGroup.controls.otherInfo as FormArray;
  }
  set otherInfoFormArr(formArray: FormArray) {
    this.formGroup.controls.otherInfo = formArray;
  }

  constructor(
    public appS: AppService,
    private fb: FormBuilder,
  ) { }

  ngOnInit() {
  }

  ngOnChanges(changes: SimpleChanges) {
    this.createForm(this.data).map(si => {
      this.otherInfoFormArr.push(si)
    })
  }

  /** 其他信息 */
  createForm(data: Array<OtherInfo> = []) {
    return data.map((item, i) => {
      return this.otherInfoVisionsForm(i, item);
    });
  }
  /** 其他form */
  otherInfoVisionsForm(index: number, item = { key: null, value: null }): FormGroup {
    return this.fb.group({
      /** 名字 */
      key: [item.key, [Validators.required, this.arrayValidator(index)]],
      /** 内容 */
      value: [item.value, [Validators.required]],
    });
  }
  /** 添加其他数据 */
  add() {
    const length = this.otherInfoFormArr.value.length;
    this.otherInfoFormArr.push(this.otherInfoVisionsForm(length));
  }
  /** 删除其他数据 */
  remove(index: number) {
    this.otherInfoFormArr.removeAt(index);
  }

  bridgeOtherKeySelect() {
    const arr = this.otherInfoFormArr.value.map(v => v.key);
    return this.keys.filter(v => arr.indexOf(v) === -1);
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
        const values: Array<OtherInfo> = this.otherInfoFormArr.getRawValue();
        for (let i = 0; i < values.length; i++) {
          if (i !== index && values[i].key === control.value) {
            return { reperition: `${control.value} 已存在!!` };
          }
        }
      }
      return null;
    };
  }
}
