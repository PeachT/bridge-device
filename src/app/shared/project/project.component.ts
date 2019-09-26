import { Component, OnInit, Output, EventEmitter, ChangeDetectionStrategy, Input, ChangeDetectorRef, ViewChild, OnChanges } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormArray, AsyncValidatorFn, AbstractControl, ValidationErrors } from '@angular/forms';
import { Project } from 'src/app/models/project';
import { NzMessageService } from 'ng-zorro-antd';
import { reperitionValidator } from 'src/app/Validator/repetition.validator';
import { nameRepetition } from 'src/app/Validator/async.validator';
import { DbService } from 'src/app/services/db.service';
import { AppService } from 'src/app/services/app.service';
import { from, Observable } from 'rxjs';
import { map, catchError, every, first } from 'rxjs/operators';
import { AddOtherComponent } from '../add-other/add-other.component';
import { HttpService } from 'src/app/services/http.service';
import { Md5 } from 'ts-md5/dist/md5';
import { getUploadingData } from 'src/app/Function/upService';
import { uploadingData } from 'src/app/Function/uploading';

const uploadingDataInit = {
    url: null,
    user: null,
    password: null,
    deviceNo: null
};
@Component({
  selector: 'app-project',
  templateUrl: './project.component.html',
  styleUrls: ['./project.component.less'],
})
export class ProjectComponent implements OnInit, OnChanges {
  @Input() data: Project = null;
  @ViewChild('otherInfo', null) otherIngoDom: AddOtherComponent;
  validateForm: FormGroup = this.fb.group({});
  otherKeys = [
    '分布工程',
    '施工单位',
    '分项工程',
    '单位工程',
    '工程部位',
    '合同段',
    '桩号范围',
  ];
  uploadingData = uploadingDataInit;
  uploadingState = false;

  get formArr(): FormArray {
    return this.validateForm.get('supervisions') as FormArray;
  }
  get otherInforFormArr(): FormArray {
    return this.validateForm.get('otherInfo') as FormArray;
  }

  constructor(
    private fb: FormBuilder,
    private message: NzMessageService,
    private db: DbService,
    public appS: AppService,
    private changeDetectorRef: ChangeDetectorRef,
    private http: HttpService,
    private cdr: ChangeDetectorRef,
  ) { }

  ngOnInit() {
    this.createForm();
    console.log(this.formArr.controls);
  }
  ngOnChanges() {
    console.log('123132123123123123123123');
  }

  /** 手动更新 */
  markForCheck() {
    this.changeDetectorRef.markForCheck();
  }

  createForm() {
    console.log('000000');
    this.validateForm = this.fb.group({
      id: [],
      name: [null, [Validators.required], [nameRepetition(this.db, 'project')]],
      /** 监理 */
      supervisions: this.fb.array(this.supervisionsForm()),
      uploadingName: [],
      uploadingMode: [],
      uploadingLinkData: [],
      uploadingBackData: [],
      /** 其他信息 */
      otherInfo: this.fb.array(this.otherIngoDom.createForm([{key: null, value: null}]))
    });
  }
  supervisionsForm() {
    if (this.data) {
      return this.data.supervisions.map(() => {
        return this.createSuperVisionsForm();
      });
    }
    return [this.createSuperVisionsForm()];
  }
  /** 监理form */
  createSuperVisionsForm() {
    return this.fb.group({
      /** 名字 */
      name: [null, [Validators.required, reperitionValidator('supervisions')]],
      /** 监理公司 */
      unit: [null, [Validators.required]],
      /** 联系方式 */
      phone: [],
      /** 头像 */
      ImgBase64: [],
    });
  }

  ngSubmit() {
    console.log('13123123123');
  }
  /** 保存数据 */
  save(callpack) {
    if (!this.validateForm.valid) {
      console.log(this.validateForm.valid);
      this.message.error('数据填写有误！！');
      return;
    }
    callpack(this.validateForm.value);
  }
  /** 重置数据 */
  reset(data: Project) {
    this.data = data;
    if (this.data.uploadingName) {
      this.uploadingData = this.data.uploadingLinkData;
    }
    // this.createForm();
    this.validateForm.setControl('supervisions', this.fb.array(this.supervisionsForm()));
    this.validateForm.setControl('otherInfo', this.fb.array(this.otherIngoDom.createForm(this.data.otherInfo)));

    this.validateForm.reset(data);
    // tslint:disable-next-line:forin
    for (const i in this.validateForm.controls) {
      this.validateForm.controls[i].markAsDirty();
      this.validateForm.controls[i].updateValueAndValidity();
    }
    this.markForCheck();
  }
  add() {
    // tslint:disable-next-line:no-angle-bracket-type-assertion
    const control = <FormArray> this.validateForm.controls.supervisions;
    control.push(this.createSuperVisionsForm());
    this.data = this.validateForm.value;
  }
  sub(index) {
    // tslint:disable-next-line:no-angle-bracket-type-assertion
    const control = <FormArray> this.validateForm.controls.supervisions;
    control.removeAt(index);
    this.data = this.validateForm.value;
  }

  ccc() {
    this.validateForm.clearAsyncValidators();
    this.validateForm.clearValidators();
  }
  /** 选择服务器 */
  selectUp() {
    // this.uploadingData = uploadingDataInit;
  }
  /** 上传链接测试 */
  funcUploadingTask() {
    this.uploadingState = true;
    this.validateForm.controls.uploadingLinkData.setValue(this.uploadingData);
    let formData: any = null;
    let url = this.uploadingData.url;
    switch (this.validateForm.value.uploadingName) {
      case 'weepal':
        formData = uploadingData.weepal(this.uploadingData);
        break;
      case 'xalj':
        // tslint:disable-next-line:max-line-length
        url = uploadingData.xalj(this.uploadingData);
        break;
      default:
        break;
    }

    this.uploadingState = true;
    this.validateForm.controls.uploadingLinkData.setValue(this.uploadingData);

    this.http.post(url, formData).subscribe(r => {
      this.uploadingState = false;
      if (r.success) {
        switch (this.validateForm.value.uploadingName) {
          case 'weepal':
            this.validateForm.controls.uploadingBackData.setValue(r);
            break;
          case 'xalj':
            const br = decodeURI(r);
            this.validateForm.controls.uploadingBackData.setValue(br);
            break;
          default:
            break;
        }
        this.message.success('服务器链接成功');
      } else {
        this.message.error('服务器链接失败');
        console.log(r);
      }
      this.cdr.markForCheck();
    }, err => {
      this.uploadingState = false;
      this.message.error(`${err.status} : 服务器链接失败`);
      if (err.status === 200) {
        const br = decodeURI(err.error.text);
        this.validateForm.controls.uploadingBackData.setValue(br);
      }
      console.log(err)
    });
  }
}
