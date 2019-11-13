import { Component, Input, OnInit, Output, EventEmitter, OnChanges, SimpleChanges, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { FormGroup, FormBuilder, FormArray } from '@angular/forms';
import { Subscription, Observable, fromEvent } from 'rxjs';
import { GroutingHoleItem } from 'src/app/models/grouting';
import { AppService } from 'src/app/services/app.service';
import { debounceTime } from 'rxjs/operators';
import { otherInfoForm } from 'src/app/shared/add-other/createFrom';

@Component({
  // tslint:disable-next-line: component-selector
  selector: 'grouting-record-item',
  templateUrl: './grouting-record-item.component.html',
  styleUrls: ['./grouting-record-item.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GroutingRecordItemComponent implements OnInit, OnChanges {
  @Input() formData: FormGroup;
  @Input() index: number;
  @Input() data: Array<GroutingHoleItem>;

  get groutingInfoHoleFormArray(): FormArray {
    return ((this.formData.controls.groutingInfo as FormArray).at(this.index) as FormGroup).controls.groups as FormArray;
  }

  otherKey = [];
  chsub: Subscription = null;

  @Output() updateHole = new EventEmitter();

  constructor(
    public appS: AppService,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {

  }
  ngOnChanges(changes: SimpleChanges) {
    this.createForm(this.data).map(si => {
      this.groutingInfoHoleFormArray.push(si);
    })
  }
  createForm(arrData: Array<GroutingHoleItem> = []): FormGroup[] {
    return arrData.map(d => {
      return this.corateFormGroup(d);
    })
  }
  corateFormGroup(data: GroutingHoleItem) {
    return this.fb.group({
      /** 压浆方向 */
      direction: [data.direction],
      /** 环境温度 */
      envTemperature: [data.envTemperature],
      /** 浆液温度 */
      slurryTemperature: [data.slurryTemperature],
      /** 开始时间 */
      startDate: [data.startDate],
      /** 完成时间 */
      endDate: [data.endDate],

      /** 设置压浆压力 */
      setGroutingPressure: [data.setGroutingPressure],
      /** 进浆压力 */
      intoPulpPressure: [data.intoPulpPressure],
      /** 回浆压力 */
      outPulpPressure: [data.outPulpPressure],
      /** 稳压时间 */
      steadyTime: [data.steadyTime],

      /** 设置浆量 */
      setPulpvolume: [data.setPulpvolume],
      /** 进浆量 (L) */
      intoPulpvolume: [data.intoPulpvolume],
      /** 回浆量 (L) */
      outPulpvolume: [data.outPulpvolume],

      /** 设置真空泵压力 */
      setVacuumPumpPressure: [data.setVacuumPumpPressure],
      /** 真空泵压力 */
      vacuumPumpPressure: [data.vacuumPumpPressure],
      /** 真空循环时间 */
      cycletime: [data.cycletime],


      /** 通过情况 */
      passMsg: [data.passMsg],
      /** 冒浆情况 */
      slurryEmittingMsg: [data.slurryEmittingMsg],
      /** 其他说明 */
      remarks: [data.remarks],
      /** 压浆过程数据 */
      processDatas: [data.processDatas],
      otherInfo: otherInfoForm(data.otherInfo)
    });
  }
}
