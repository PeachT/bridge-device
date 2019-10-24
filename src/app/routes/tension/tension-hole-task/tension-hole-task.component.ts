import { Component, OnInit, OnChanges, Input, Output, EventEmitter, SimpleChanges, ViewChild, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { FormGroup, FormArray, FormBuilder } from '@angular/forms';
import { TensionHoleTask, TensionHoleInfo } from 'src/app/models/tension';
import { Subscription } from 'rxjs';
import { TensionHoleTaskStageComponent } from '../tension-hole-task-stage/tension-hole-task-stage.component';

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
  @Input() index: number;
  @Input() data: TensionHoleInfo;
  holeNameLength: number;

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
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    console.log(this.formData, this.data, this.TaskFormArray, this.tasks);
    if (this.data && this.data.name) {
      this.holeNameLength = this.data.name.split('/').length;
    }
  }
  ngOnChanges(changes: SimpleChanges) {
    console.log('sdfsdaaasdfsdd', this.formData, this.TaskFormArray, this.tasks);
    if (this.tasks) {
      this.createForm(this.tasks).map(si => {
        this.TaskFormArray.push(si);
      });
      this.cdr.detectChanges();
    }
  }
  createForm(arrData: Array<TensionHoleTask> = []): FormGroup[] {
    return arrData.map(d => {
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

}

