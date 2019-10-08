import { Component, Input, OnInit, ChangeDetectorRef, ViewChild, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';
import { DbService } from 'src/app/services/db.service';
import { NzMessageService } from 'ng-zorro-antd';
import { AppService } from 'src/app/services/app.service';
import { ElectronService } from 'ngx-electron';
import { nameRepetition } from 'src/app/Validator/async.validator';
import { AddOtherComponent } from 'src/app/shared/add-other/add-other.component';
import { Subscription } from 'rxjs';
import { GroutingInfo, GroutingHoleItem, ProcessData } from 'src/app/models/grouting';

@Component({
  // tslint:disable-next-line: component-selector
  selector: 'grouting-record-item',
  templateUrl: './grouting-record-item.component.html',
  styleUrls: ['./grouting-record-item.component.less']
})
export class GroutingRecordItemComponent implements OnInit {
  @Input() formData: FormGroup;
  @Input() index: number;
  @Input() GroutingHoleItem: GroutingHoleItem;
  get groutingInfoHoleForm(): FormArray {
    return ((this.formData.controls.groutingInfo as FormArray).at(this.index) as FormGroup).controls.groups as FormArray;
  }


  otherKey = [];
  chsub: Subscription = null;

  @Output() updateHole = new EventEmitter();

  constructor(
    private fb: FormBuilder,
    public odb: DbService,
    public appS: AppService,
  ) { }

  ngOnInit() {
    console.log('123456789', this.formData, document.getElementById('form').offsetWidth);
  }

  resetValue(data: Array<GroutingHoleItem>) {
    // console.log(data);
    // this.formData = new FormArray([]);
    // data.map(g => {
    //   this.formData.controls.push(this.corateFormGroup());
    // });
    // this.formData.reset(data);
  }
  corateFormGroup() {
    return this.fb.group({
      /** 压浆方向 */
      direction: [],
      /** 设置压浆压力 */
      setGroutingPressure: [],
      /** 环境温度 */
      envTemperature: [],
      /** 浆液温度 */
      slurryTemperature: [],
      /** 开始时间 */
      startDate: [],
      /** 完成时间 */
      endDate: [],
      /** 进浆压力 */
      intoPulpPressure: [],
      /** 回浆压力 */
      outPulpPressure: [],
      /** 进浆量 (L) */
      intoPulpvolume: [],
      /** 回浆量 (L) */
      outPulpvolume: [],
      /** 真空泵压力 */
      vacuumPumpPressure: [],
      /** 稳压时间 */
      steadyTime: [],
      /** 通过情况 */
      passMsg: [],
      /** 冒浆情况 */
      slurryEmittingMsg: [],
      /** 其他说明 */
      remarks: [],
      // otherInfo: this.fb.array(this.otherIngoDom.createForm([])),
    });
  }
}
