import { Component, Input, OnInit, Output, EventEmitter, SimpleChanges, OnChanges, ChangeDetectionStrategy } from '@angular/core';
import { FormGroup, FormBuilder, FormArray } from '@angular/forms';
import { Subscription } from 'rxjs';
import { GroutingInfo, GroutingTask } from 'src/app/models/grouting';
import { AppService } from 'src/app/services/app.service';
import { otherInfoForm } from 'src/app/shared/add-other/createFrom';

@Component({
  // tslint:disable-next-line: component-selector
  selector: 'grouting-record',
  templateUrl: './grouting-record.component.html',
  styleUrls: ['./grouting-record.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GroutingRecordComponent implements OnInit, OnChanges {
  @Input() show = false;
  @Input() edit = true;

  @Input() data: GroutingTask;
  @Input() formData: FormGroup;
  /** 上一次数据id */
  bid = null;

  get groutingInfoFormArray(): FormArray {
    return this.formData.controls.groutingInfo as FormArray;
  }
  get groutingInfo(): Array<GroutingInfo> {
    if (this.data) {
      return this.data.groutingInfo;
    }
    return null;
  }
  otherKey = [];
  chsub: Subscription = null;
  groupItem: GroutingInfo;

  @Output() updateHole = new EventEmitter();

  constructor(
    private fb: FormBuilder,
    public appS: AppService
  ) { }

  ngOnInit() {
  }
  ngOnChanges(changes: SimpleChanges) {
    console.log('压浆记录数据变更', changes, this.data.id, this.bid);
    if (this.data.id !== this.bid) {
      this.bid = this.data.id;
      this.groupItem = null;
    }
    this.createForm(this.groutingInfo).map(si => {
      this.groutingInfoFormArray.push(si);
    })
  }
  createForm(arrData: Array<GroutingInfo> = []): FormGroup[] {
    return arrData.map(d => {
      return this.corateFormGroup(d);
    })
  }
  corateFormGroup(data: GroutingInfo) {
    return this.fb.group({
      /** 孔号 */
      name: [data.name],
      /** 压浆孔道采集数据 */
      groups: this.fb.array([]),
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
      otherInfo: otherInfoForm(data.otherInfo)
    });
  }
  /** 切换孔 */
  switchHole(item: GroutingInfo) {
    console.log(item);
    this.groupItem = item;
  }

}
