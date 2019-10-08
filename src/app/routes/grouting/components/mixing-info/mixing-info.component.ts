import { Component, Input, OnInit, ChangeDetectorRef, ViewChild, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';
import { DbService } from 'src/app/services/db.service';
import { NzMessageService } from 'ng-zorro-antd';
import { AppService } from 'src/app/services/app.service';
import { ElectronService } from 'ngx-electron';
import { nameRepetition } from 'src/app/Validator/async.validator';
import { AddOtherComponent } from 'src/app/shared/add-other/add-other.component';
import { Subscription } from 'rxjs';
import { GroutingInfo, GroutingHoleItem, MixingInfo, GroutingTask } from 'src/app/models/grouting';

@Component({
  // tslint:disable-next-line: component-selector
  selector: 'mixing-info',
  templateUrl: './mixing-info.component.html',
  styleUrls: ['./mixing-info.component.less']
})
export class MixingInfoComponent implements OnInit {
  @Input() groutingTask: GroutingTask;
  @Input() formData: FormGroup;

  get mixingInfoForm(): FormArray {
    return this.formData.controls.mixingInfo as FormArray;
  }
  otherKey = [];
  // formData: FormArray = new FormArray([]);
  chsub: Subscription = null;


  @Output() updateHole = new EventEmitter();

  constructor(
    private fb: FormBuilder,
    public odb: DbService,
    public appS: AppService,
  ) { }

  ngOnInit() {
    console.log('搅拌数据', this.groutingTask, this.formData);
    this.formData.valueChanges.subscribe(() => {
      console.log('搅拌数据跟新');
    });
  }
  initFormData(mixingInfos) {
    const af = new FormArray([]);
    mixingInfos.map(d => {
      af.push(this.corateFormGroup(d));
    })
    return af;
  }
  add() {
    // const af =this.corateFormGroup({
    //   /** 用量 */
    //   dosage: [33, 111, 11],
    //   /** 开始时间 */
    //   startTime: new Date(),
    //   /** 搅拌时间 */
    //   mixingTime: 20,
    //   /** 泌水率 */
    //   bleedingRate: 1,
    //   /** 流动度 */
    //   fluidity: 28,
    //   /** 黏稠度 */
    //   viscosity: 0.5,
    //   /** 水胶比 */
    //   waterBinderRatio: 0.28,
    //   /** 水温 */
    //   waterTemperature: 22,
    //   /** 环境温度 */
    //   envTemperature: 35,
    // });
    // this.formData.push(af);
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

}
