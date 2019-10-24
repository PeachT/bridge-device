import { Component, OnInit, OnChanges, SimpleChanges, Input } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { uploadingData } from 'src/app/Function/uploading';
import { HttpService } from 'src/app/services/http.service';
import { NzMessageService } from 'ng-zorro-antd';

interface Mode {
  url: string;
  user: string;
  password: string;
  deviceNo: string;
}

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'project-xalj-up',
  templateUrl: './xalj-up.component.html',
  styleUrls: ['./xalj-up.component.less']
})

export class XaljUpComponent implements OnInit, OnChanges {
  @Input() formData: FormGroup;
  @Input() data: Mode;
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
        url: 'http://117.34.70.71:8092/DataService/YJDataUpload?',
        user: null, // lzqm
        password: null, // qm123456
        deviceNo: null, // test01
      };
    }
    console.log(this.formGroup.controls);
    console.log(this.data, !this.data);

    ['url', 'user', 'password', 'deviceNo'].map(k => {
      this.formGroup.addControl(k, this.fb.control(this.data[k], Validators.required))
    })
  }

  /** 上传链接测试 */
  funcUploadingTask() {
    if (!this.formGroup.valid) {
      return;
    }
    this.uploadingState = true;
    const url = uploadingData.xalj(this.formGroup.value);
    this.uploadingState = true;
    this.http.post(url, '').subscribe(r => {
    }, err => {
      this.uploadingState = false;
      if (err.status === 200) {
        this.serviceRetrun = decodeURI(err.error.text);
        this.message.success(`测试成功${this.serviceRetrun}`);
      }
      console.log(err)
    });
  }
}
