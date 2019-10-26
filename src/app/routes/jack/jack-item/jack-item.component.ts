import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { JackItem } from 'src/app/models/jack';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'jack-item',
  templateUrl: './jack-item.component.html',
  styleUrls: ['./jack-item.component.less']
})
export class JackItemComponent implements OnInit, OnChanges {
  @Input() formGroup: FormGroup;
  @Input() jackName: string;
  @Input() data: JackItem;

  get jackItemForm(): FormGroup {
    return this.formGroup.get(this.jackName) as FormGroup;
  }
  constructor(
    private fb: FormBuilder,
  ) { }

  ngOnInit() {
    this.createControl();
  }
  ngOnChanges(changes: SimpleChanges) {
    console.log(this.jackName, this.formGroup, this.jackItemForm);

    this.createControl();
  }

  /** 其他form */
  createControl() {
    this.jackItemForm.addControl('jackNo', this.fb.control(this.data.jackNo));
    this.jackItemForm.addControl('pumpNo', this.fb.control(this.data.pumpNo));
    this.jackItemForm.addControl('a', this.fb.control(this.data.a, Validators.required));
    this.jackItemForm.addControl('b', this.fb.control(this.data.b, Validators.required));
    this.jackItemForm.addControl('date', this.fb.control(this.data.date, Validators.required));
  }

  /** 设置事件 */
  selectDate(date) {
    if (this.jackName === 'A1') {
      (this.formGroup.get('A2') as FormGroup).get('date').setValue(date);
      (this.formGroup.get('B1') as FormGroup).get('date').setValue(date);
      (this.formGroup.get('B2') as FormGroup).get('date').setValue(date);
    }
  }
}
