import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { FormGroup, FormArray, Validators, FormBuilder, ValidatorFn, AbstractControl } from '@angular/forms';
import { AppService } from 'src/app/services/app.service';
import { OtherInfo } from 'src/app/models/common';
import { PersonInfo } from 'src/app/models/project';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'project-person-info',
  templateUrl: './person-info.component.html',
  styleUrls: ['./person-info.component.less']
})
export class PersonInfoComponent implements OnInit, OnChanges {
  @Input() formGroup: FormGroup;
  /** 候选的KEY */
  @Input() keys = [];
  @Input() iselect = null;
  @Input() edit = false;
  @Input() data: Array<PersonInfo> = [];
  @Input() formArrayName: 'supervisions' | 'qualityInspectors' = 'supervisions';
  @Input() dividerText: string = null;

  get forFormArr(): FormArray {
    return this.formGroup.get(this.formArrayName) as FormArray;
  }

  constructor(
    public appS: AppService,
    private fb: FormBuilder,
  ) { }

  ngOnInit() {
  }

  ngOnChanges(changes: SimpleChanges) {
    this.createForm(this.data).map(si => {
      this.forFormArr.push(si)
    })
  }

  /** 其他信息 */
  createForm(data: Array<PersonInfo> = []) {
    return data.map((item, i) => {
      return this.createControl(i, item);
    });
  }
  /** 其他form */
  createControl(index: number, item: PersonInfo = { name: null, phone: null, unit: null }): FormGroup {
    return this.fb.group({
      /** 名字 */
      name: [item.name, [Validators.required, this.arrayValidator(index)]],
      phone: [item.phone],
      unit: [item.unit],
      imgBase64: [item.imgBase64]
    });
  }
  /** 添加其他数据 */
  add() {
    const length = this.forFormArr.value.length;
    this.forFormArr.push(this.createControl(length));
  }
  /** 删除其他数据 */
  remove(index: number) {
    this.forFormArr.removeAt(index);
  }
  /** key过滤 */
  bridgeOtherKeySelect() {
    const arr = this.forFormArr.value.map(v => v.key);
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
        const values: Array<PersonInfo> = this.forFormArr.getRawValue();
        for (let i = 0; i < values.length; i++) {
          if (i !== index && values[i].name === control.value) {
            return { reperition: `${control.value} 已存在!!` };
          }
        }
      }
      return null;
    };
  }
}
