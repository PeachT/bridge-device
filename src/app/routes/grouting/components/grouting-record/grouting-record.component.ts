import { Component, Input, OnInit, ChangeDetectorRef, ViewChild, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { GroutingItem } from 'src/app/models/grouting';
import { DbService } from 'src/app/services/db.service';
import { NzMessageService } from 'ng-zorro-antd';
import { AppService } from 'src/app/services/app.service';
import { PLCService } from 'src/app/services/PLC.service';
import { ElectronService } from 'ngx-electron';
import { nameRepetition } from 'src/app/Validator/async.validator';
import { AddOtherComponent } from 'src/app/shared/add-other/add-other.component';
import { Subscription } from 'rxjs';

@Component({
  // tslint:disable-next-line: component-selector
  selector: 'grouting-record',
  templateUrl: './grouting-record.component.html',
  styleUrls: ['./grouting-record.component.less']
})
export class GroutingRecordComponent implements OnInit {
  @ViewChild('otherInfo', null) otherIngoDom: AddOtherComponent;

  @Input() show = false;

  otherKey = [];
  formData: FormGroup;
  chsub: Subscription = null;

  @Output() updateHole = new EventEmitter();

  constructor(
    private fb: FormBuilder,
    public odb: DbService,
    private message: NzMessageService,
    public appS: AppService,
    public PLCS: PLCService,
    private e: ElectronService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.formData = this.fb.group({
      /** 孔号 */
      name: [],
      otherInfo: this.fb.array(this.otherIngoDom.createForm([])),
      /** 试验日期 */
      testDate: [],
      /** 压浆方向 */
      direction: [],
      /** 张拉开始时间 */
      startDate: [],
      /** 张拉结束时间 */
      endDate: [],
      /** 压浆压力 */
      setMpa: [],
      /** 通过 */
      pass: [],
      /** 冒浆情况 */
      msg: [],
      /** 停留时间 */
      stayTime: [],
      /** 稳压时间 */
      steadyTime: [],
      /** 稳压压力 */
      steadyMpa: [],
      /** 二次压浆 */
      tow: [],
      /** 压浆状态 */
      state: [],
      /** 上传状态 */
      upState: [],
      materialsTotal: [],
      waterTotal: []
    });
    this.chsub = this.formData.valueChanges.subscribe((e) => {
      // console.log(e, this.holeForm.value);
      this.updateHole.emit(this.formData.value);
    });
  }

  createFormData(data: GroutingItem) {
    this.formData.reset(data);
  }

}
