import { Component, Input, OnInit, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { FormGroup, FormBuilder, FormArray } from '@angular/forms';
import { DbService } from 'src/app/services/db.service';
import { AppService } from 'src/app/services/app.service';
import { Subscription } from 'rxjs';
import { MixingInfo, GroutingTask } from 'src/app/models/grouting';

@Component({
  // tslint:disable-next-line: component-selector
  selector: 'mixing-info',
  templateUrl: './mixing-info.component.html',
  styleUrls: ['./mixing-info.component.less']
})
export class MixingInfoComponent implements OnInit, OnChanges {
  @Input() formData: FormGroup;
  @Input() data: GroutingTask;

  get mixingInfoForm(): FormArray {
    return this.formData.controls.mixingInfo as FormArray;
  }

  constructor(
    private fb: FormBuilder,
  ) { }

  ngOnInit() {
    console.log('搅拌数据', this.data, this.formData);
  }
  ngOnChanges(changes: SimpleChanges) {
    console.log('配比数据更新', changes, this.data);
    this.createForm(this.data.mixingInfo).map(si => {
      this.mixingInfoForm.push(si);
    })
  }
  createForm(mixingInfos: Array<MixingInfo> = []): FormGroup[] {
    return mixingInfos.map(d => {
      return this.corateFormGroup(d);
    })
  }
  corateFormGroup(mixingInfo: MixingInfo) {
    return this.fb.group({
      /** 用量 */
      dosage: this.fb.array(mixingInfo.dosage),
      /** 开始时间 */
      startTime: [mixingInfo.startTime],
      /** 搅拌时间s */
      mixingTime: [mixingInfo.mixingTime],
      /** 泌水率 */
      bleedingRate: [mixingInfo.bleedingRate],
      /** 流动度 */
      fluidity: [mixingInfo.fluidity],
      /** 流动度 */
      initFluidity: [mixingInfo.initFluidity],
      /** 黏稠度 */
      viscosity: [mixingInfo.viscosity],
      /** 水胶比 */
      waterBinderRatio: [mixingInfo.waterBinderRatio],
      /** 水温 */
      waterTemperature: [mixingInfo.waterTemperature],
      /** 环境温度 */
      envTemperature: [mixingInfo.envTemperature],
    });
  }
  add() {
  }

}
