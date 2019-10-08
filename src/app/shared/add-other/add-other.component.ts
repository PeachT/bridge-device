import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, FormArray, Validators, FormBuilder } from '@angular/forms';
import { AppService } from 'src/app/services/app.service';
import { OtherInfo } from 'src/app/models/common';
import { arrayValidator } from 'src/app/Validator/repetition.validator';

@Component({
  selector: 'app-add-other',
  templateUrl: './add-other.component.html',
  styleUrls: ['./add-other.component.less']
})
export class AddOtherComponent implements OnInit {
  @Input() formGroup: FormGroup;
  /** 候选的KEY */
  @Input() keys = [];
  @Input() iselect = null;
  @Input() edit = true;

  get otherInforFormArr(): FormArray {
    return this.formGroup.get('otherInfo') as FormArray;
  }

  constructor(
    public appS: AppService,
    private fb: FormBuilder,
  ) { }

  ngOnInit() {
  }

  /** 其他信息 */
  createForm(data: Array<OtherInfo> = []) {
    const rarr = data.map((item, i) => {
      return this.otherInfoVisionsForm(i, item);
    });
    return rarr;
  }
  /** 其他form */
  otherInfoVisionsForm(index: number, item = {key: null, value: null}) {
    return this.fb.group({
      /** 名字 */
      key: [item.key, [Validators.required, arrayValidator(index, 'otherInfo', 'key')]],
      /** 内容 */
      value: [item.value, [Validators.required]],
    });
  }
  /** 添加其他数据 */
  add() {
    // tslint:disable-next-line:no-angle-bracket-type-assertion
    const control = <FormArray> this.formGroup.controls.otherInfo;
    const length = this.formGroup.value.otherInfo.length;
    control.push(this.otherInfoVisionsForm(length));
  }
  /** 删除其他数据 */
  remove(index: number) {
    // tslint:disable-next-line:no-angle-bracket-type-assertion
    (<FormArray> this.formGroup.controls.otherInfo).removeAt(index);
  }

  bridgeOtherKeySelect() {
    const arr = this.otherInforFormArr.value.map(v => v.key);
    return this.keys.filter(v =>  arr.indexOf(v) === -1 );
  }
}
