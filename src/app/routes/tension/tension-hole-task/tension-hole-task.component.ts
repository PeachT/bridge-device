import { Component, OnInit, OnChanges, Input, Output, EventEmitter, SimpleChanges, ViewChild, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { FormGroup, FormArray, FormBuilder } from '@angular/forms';
import { TensionHoleTask, TensionHoleInfo } from 'src/app/models/tension';
import { Subscription, Observable, from } from 'rxjs';
import { TensionHoleTaskStageComponent } from '../tension-hole-task-stage/tension-hole-task-stage.component';
import { DbService } from 'src/app/services/db.service';
import { map } from 'rxjs/operators';
import { TensionDevice } from 'src/app/models/jack';
import { AppService } from 'src/app/services/app.service';
import { Menu$ } from 'src/app/models/app';
import { MenuItem } from 'electron';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'tension-hole-task',
  templateUrl: './tension-hole-task.component.html',
  styleUrls: ['./tension-hole-task.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TensionHoleTaskComponent implements OnInit, OnChanges {
  @ViewChild('stage', null) stageDom: TensionHoleTaskStageComponent;
  @Input() formData: FormGroup;
  // @Input() index: number;
  @Input() data: TensionHoleInfo;
  holeNameLength: number;
  /** 选择设备 */
  tensionDeviceId: Array<number> = [];

  get tasks(): Array<TensionHoleTask> {
    if (this.data) {
      return this.data.tasks;
    }
    return null;
  }

  get TaskFormArray(): FormArray {
    return this.formData.controls.tasks as FormArray;
  }

  otherKey = [];
  chsub: Subscription = null;

  @Output() updateHole = new EventEmitter();

  constructor(
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef,
    private db: DbService,
    public appS: AppService
  ) { }

  async ngOnInit() {
  }

  ngOnChanges(changes: SimpleChanges) {
    if (this.data && this.data.name) {
      this.holeNameLength = this.data.name.split('/').length;
    }
    this.cdr.detectChanges();
  }

  createForm(arrData: Array<TensionHoleTask> = []): FormGroup[] {
    this.tensionDeviceId = [];
    return arrData.map(d => {
      this.tensionDeviceId.push(d.device.id);
      return this.corateFormGroup(d);
    })
  }
  corateFormGroup(data: TensionHoleTask) {
    return this.fb.group({
      /** 二次张拉 */
      twice: [data.twice],
      /** 超张拉 */
      super: [data.super],
      /** 补张拉 */
      mend: [data.mend],
      /** 设置张拉应力 */
      tensionKn: [data.tensionKn],
      /** 张拉设备 */
      device: [data.device],
      deviceId: [data.device.id],
      mode: [data.mode],
      /** 张拉阶段 */
      stage: this.fb.group([]),
      otherInfo: this.fb.array([]),
      /** 张拉记录 */
      record: this.fb.group({
        state: [],
        groups: this.fb.array([])
      }),
    });
  }
  /** 切换设备 */
  async selectTensionDevice(id, i) {
    const device: TensionDevice = await this.db.db.jack.filter(f => f.id === id).first();
    console.log(id, device);
    (this.TaskFormArray.at(i) as FormGroup).get('device').setValue(device);
    this.stageDom.onCdr();
  }
  /** ifDevice */
  deviceExist(device: TensionDevice) {
    return this.appS.jackMneu.find(f => f.label === device.name && f.value === device.id) === undefined;
  }
}

