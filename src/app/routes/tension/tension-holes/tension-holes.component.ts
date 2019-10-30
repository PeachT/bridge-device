import { Component, OnInit, OnChanges, Input, Output, EventEmitter, SimpleChanges, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { TensionHoleInfo, TensionTask } from 'src/app/models/tension';
import { FormGroup, FormArray, FormBuilder } from '@angular/forms';
import { Subscription } from 'rxjs';
import { AppService } from 'src/app/services/app.service';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'tension-holes',
  templateUrl: './tension-holes.component.html',
  styleUrls: ['./tension-holes.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TensionHolesComponent implements OnInit, OnChanges {
  @Input() show = false;
  @Input() edit = true;

  @Input() data: TensionTask;
  @Input() formData: FormGroup;
  @Input() upDataState = false;

  @Output() outSelectHole = new EventEmitter();
  /** 上一次数据id */
  bid = null;

  get tensionHoleInfosFormArray(): FormArray {
    return this.formData.controls.tensionHoleInfos as FormArray;
  }
  get tensionHoleInfos(): Array<TensionHoleInfo> {
    if (this.data) {
      return this.data.tensionHoleInfos;
    }
    return null;
  }
  otherKey = [];
  chsub: Subscription = null;
  groupItem: TensionHoleInfo;

  @Output() updateHole = new EventEmitter();

  constructor(
    public appS: AppService,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef,
  ) { }

  ngOnInit() {
  }
  ngOnChanges(changes: SimpleChanges) {
    console.log('12345789数据变更', changes, this.data.id, this.bid);
    if (this.data.id !== this.bid) {
      this.bid = this.data.id;
      this.groupItem = null;
    }
    this.initForm();
  }
  initForm() {

    console.log(this.data);
    console.log(this.tensionHoleInfos);
    this.tensionHoleInfosFormArray.clear();
    this.createForm(this.tensionHoleInfos).map(si => {
      this.tensionHoleInfosFormArray.push(si);
    })
    this.cdr.detectChanges();
  }
  createForm(arrData: Array<TensionHoleInfo> = []): FormGroup[] {
    return arrData.map(d => {
      return this.corateFormGroup(d);
    })
  }
  corateFormGroup(data: TensionHoleInfo) {
    return this.fb.group({
      /** 孔号 */
      name: [data.name],
      /** 张拉工艺(先张，后张，分级张拉第一级，分级张拉第二级等) */
      stretchDrawProcess: [data.stretchDrawProcess],
      /** 张拉长度 */
      length: [data.length],
      /** 钢绞线数据 */
      steelStrandNum: [data.steelStrandNum],
      /** 张拉状态 */
      state: [data.state],
      /** 上传状态 */
      uploading: [data.uploading],
      /** 其他数据 */
      otherInfo: this.fb.array([]),
      tasks: this.fb.array([]),
    });
  }
  /** 切换孔 */
  switchHole(index: number, item: TensionHoleInfo) {
    console.log(index);
    if (!this.appS.edit) {
      this.outSelectHole.emit(index);
    }
    this.groupItem = item;
  }

}
