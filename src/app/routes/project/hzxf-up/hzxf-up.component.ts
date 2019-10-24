import { Component, OnInit, OnChanges, Input, SimpleChanges } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { HttpService } from 'src/app/services/http.service';
import { uploadingData } from 'src/app/Function/uploading';
import { NzMessageService } from 'ng-zorro-antd';
import { uuid } from 'src/app/Function/unit';
import { HZXF } from 'src/app/models/uploading';


@Component({
  // tslint:disable-next-line:component-selector
  selector: 'hzxf-up',
  templateUrl: './hzxf-up.component.html',
  styleUrls: ['./hzxf-up.component.less']
})
export class HzxfUpComponent implements OnInit, OnChanges {
  @Input() formData: FormGroup;
  @Input() data: HZXF;
  get formGroup(): FormGroup {
    return this.formData.controls.uploadingLinkData as FormGroup;
  }
  /** 测试状态 */
  uploadingState = false;
  serviceRetrun = null;

  constructor(
    private http: HttpService,
    private fb: FormBuilder,
    private message: NzMessageService,
  ) { }

  ngOnInit() {
    this.createControl();
  }
  ngOnChanges(changes: SimpleChanges) {

    this.createControl();
  }

  createControl() {
    // tslint:disable-next-line:forin
    for (const i in this.formGroup.controls) {
      this.formGroup.removeControl(i);
    }
    if (!this.data) {
      this.data  = {
        url: 'http://47.98.39.16:8988/receive',
        VENDORNO: 'LZLQ',
        DEVICENOZL: 'zltest014',
        DEVICENOYJ: 'yjtest014',
      };
    }
    console.log(this.formGroup.controls);
    console.log(this.data, !this.data);

    ['url', 'VENDORNO', 'DEVICENOZL', 'DEVICENOYJ'].map(k => {
      this.formGroup.addControl(k, this.fb.control(this.data[k], Validators.required))
    });
    ['serviceData', 'debug'].map(k => {
      this.formGroup.addControl(k, this.fb.control(this.data[k]))
    })
    this.formGroup.reset(this.data);
    setTimeout(() => {
      this.formData.controls.name.updateValueAndValidity();
    }, 1);
  }

  uploadingTeat() {
    if (!this.formGroup.valid) {
      return;
    }
    const data: HZXF = this.formGroup.value;
    this.uploadingState = true;
    // tslint:disable-next-line:max-line-length
    const url = `${data.url}/zlyjaction!devicetoken.action?VENDORNO=${data.VENDORNO}&DEVICENO=${name === 'ZL' ? data.DEVICENOZL : data.DEVICENOYJ}`
    this.uploadingState = true;
    this.http.post(url, '').subscribe(r => {
      console.log('测试成功返回', r, 'TOKEN' in r);
      if ('TOKEN' in r) {
        this.data.serviceData.TOKEN = r.TOKEN;
        this.data.serviceData.PROJECTID = r.PROJECTID;
        this.data.serviceData.PLATFORMDEVICEID = r.PLATFORMDEVICEID;
        this.data.serviceData.VENDORNO = r.VENDORNO;
        this.data.serviceData.DEVICENO = r.DEVICENO;
        this.formGroup.get(name).setValue(this.data.serviceData);
      }
      this.message.success(`测试成功${JSON.stringify(r)}`);
      this.uploadingState = false;
    }, err => {
      this.uploadingState = false;
      this.message.error(`测试失败`);
      console.log(err)
    });
  }
  /** 设置为测试模式 */
  onDebug(state) {
    if (state) {
      const rd = {
        TOKEN: 'testiqabng85723dioan',
        PROJECTID: uuid(),
        PLATFORMDEVICEID: uuid(),
        VENDORNO: 'test-VENDORNO',
        DEVICENO: 'test-DEVICENO',
      }
      this.formGroup.get('serviceData').setValue(rd);
    } else {
      this.formGroup.get('serviceData').setValue(null);
    }
  }
}

