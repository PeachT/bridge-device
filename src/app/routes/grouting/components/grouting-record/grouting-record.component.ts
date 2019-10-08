import { Component, Input, OnInit, ChangeDetectorRef, ViewChild, Output, EventEmitter, SimpleChanges, OnChanges } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';
import { DbService } from 'src/app/services/db.service';
import { NzMessageService } from 'ng-zorro-antd';
import { AppService } from 'src/app/services/app.service';
import { ElectronService } from 'ngx-electron';
import { nameRepetition } from 'src/app/Validator/async.validator';
import { AddOtherComponent } from 'src/app/shared/add-other/add-other.component';
import { Subscription } from 'rxjs';
import { GroutingInfo, GroutingTask } from 'src/app/models/grouting';
import { GroutingRecordItemComponent } from '../grouting-record-item/grouting-record-item.component';

@Component({
  // tslint:disable-next-line: component-selector
  selector: 'grouting-record',
  templateUrl: './grouting-record.component.html',
  styleUrls: ['./grouting-record.component.less']
})
export class GroutingRecordComponent implements OnInit, OnChanges {
  @ViewChild('otherInfo', { read: AddOtherComponent, static: true }) otherIngoDom: AddOtherComponent;
  @ViewChild('groutingrecorditem', { read: GroutingRecordItemComponent, static: true }) griDom: GroutingRecordItemComponent;

  @Input() show = false;
  @Input() edit = true;

  @Input() groutingTask: GroutingTask;
  @Input() formData: FormGroup;
  bid = null;
  get groutingInfoForm(): FormArray {
    return this.formData.controls.groutingInfo as FormArray;
  }
  get groutingInfo(): Array<GroutingInfo> {
    if (this.groutingTask) {
      return this.groutingTask.groutingInfo;
    }
    return null;
  }


  otherKey = [];
  chsub: Subscription = null;
  groupItem: GroutingInfo;

  @Output() updateHole = new EventEmitter();

  constructor(
    private fb: FormBuilder,
    public odb: DbService,
    private message: NzMessageService,
    public appS: AppService,
    private e: ElectronService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
  }
  ngOnChanges(changes: SimpleChanges) {
    console.log('切换梁', changes);
    if (changes.formData.currentValue.value.id !== this.bid) {
      this.groupItem = null;
    }
  }

  createFormData(data: GroutingInfo) {
    return this.fb.group({
      /** 孔号 */
      name: [data.name],
      /** 压浆孔道采集数据 */
      // groups: Array<GroutingHoleItem>;
      /** 孔道内径 */
      holeDiameter: [data.holeDiameter],
      /** 孔道长度 */
      holeLength: [data.holeLength],
      /** 钢绞线数量 */
      steelStrandNum: [data.steelStrandNum],
      /** 上传状态 */
      uploading: [data.uploading],
      /** 压浆状态 */
      state: [data.state],
      /** 其他数据 */
      otherInfo: this.fb.array(this.otherIngoDom.createForm([])),
    });
  }
  /** 切换孔 */
  switchHole(item: GroutingInfo) {
    console.log(item);
    this.groupItem = item;
  }

}
