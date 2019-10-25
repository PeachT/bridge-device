import { Component, OnInit, Input, OnChanges, SimpleChanges, ChangeDetectionStrategy } from '@angular/core';
import { FormGroup, FormBuilder, FormArray } from '@angular/forms';
import { TensionHoleTask, OnceRecord, RecordCompute } from 'src/app/models/tension';
import { holeNameShow, getModeStr, recordCompute } from 'src/app/Function/tension';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'tension-record',
  templateUrl: './tension-record.component.html',
  styleUrls: ['./tension-record.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TensionRecordComponent implements OnInit, OnChanges {
  @Input() formData: FormGroup;
  @Input() data: TensionHoleTask;
  @Input() holeName: string;
  holeNames: any;
  recordCalculate: RecordCompute;
  worker: any;

  get groupsFormArray(): FormArray {
    return this.formData.get('groups') as FormArray;
  }
  get twice(): boolean {
    return this.data.twice;
  }
  get superState(): boolean {
    return this.data.super;
  }

  /** 张拉顶模式字符串 */
  strMode: Array<string>;

  constructor(
    private fb: FormBuilder,
  ) { }


  ngOnInit() {
    console.log('123456789');

  }

  ngOnChanges(changes: SimpleChanges) {
    console.log('记录记录记录记录记录记录记录记录记录记录记录', this.data);
    const indata = {data: this.data, holeName: this.holeName };

    if (this.data && this.data.record) {
      // const worker = new Worker(`./wws`, { type: `module` });
      // worker.onmessage = ({ data }) => {
      //   console.log(`page got message:`, data);
      //   this.strMode =  data.strMode;
      //   this.holeNames =  data.holeNames;
      //   this.recordCalculate =  data.recordCalculate;
      //   console.log(this.strMode, this.holeNames, this.recordCalculate);
      // };
      // worker.postMessage(indata);

      this.strMode = getModeStr(this.data.mode);
      this.holeNames = holeNameShow(this.holeName, this.data.mode);
      this.recordCalculate = recordCompute(this.data);
      // this.createForm(this.data.record.groups).map(si => {
      //   this.groupsFormArray.push(si);
      // })
    }


  }
  createForm(arrData: Array<OnceRecord> = []): FormGroup[] {
    return arrData.map((d, i) => {
      return this.corateFormGroup(d, i);
    })
  }
  corateFormGroup(data: OnceRecord, index: number) {
    const items: any = {}
    this.strMode.map((key) => {
      // this.recordCalculate[key] = RecordCompute(this.data, key, index);

      items[key] = this.fb.group({
        mpa: this.fb.array(data[key].mpa),
        mm: this.fb.array(data[key].mm),
        initMpa: [data[key].initMpa],
        initMm: [data[key].initMm],
      })
    })
    // this.DRCompote(this.data.mode);
    return this.fb.group({
      ...items,
      /** 卸荷比例 */
      knPercentage: this.fb.array(data.knPercentage),
      /** 张拉阶段 */
      msg: this.fb.array(data.msg),
      /** 保压时间 */
      time: this.fb.array(data.time),
      /** 卸荷延时 */
      uploadPercentage: this.fb.control(data.uploadPercentage),
      /** 阶段比例 */
      uploadDelay: this.fb.control(data.uploadDelay),
      /** 张拉过程记录 */
      datas: this.fb.control(data.datas),
    });
  }
}
