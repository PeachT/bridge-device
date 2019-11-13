import { Component, OnInit, ViewChild, ChangeDetectorRef, OnChanges } from '@angular/core';
import { DbService } from 'src/app/services/db.service';
import { NzMessageService } from 'ng-zorro-antd';
import { AppService } from 'src/app/services/app.service';
import { Project } from 'src/app/models/project';
import { LeftMenuComponent } from 'src/app/shared/left-menu/left-menu.component';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { nameRepetition } from 'src/app/Validator/async.validator';
import { AddOtherComponent } from 'src/app/shared/add-other/add-other.component';
import { uploadingData } from 'src/app/Function/uploading';
import { upFormData } from 'src/app/Function/uploadingOther';
import { otherInfoForm } from 'src/app/shared/add-other/createFrom';


@Component({
  // tslint:disable-next-line:component-selector
  selector: 'project',
  templateUrl: './project.component.html',
  styleUrls: ['./project.component.less']
})
export class ProjectComponent implements OnInit, OnChanges {
  dbName = 'project';
  @ViewChild('leftMenu', null) leftMenu: LeftMenuComponent;
  @ViewChild('other', null) otherDom: AddOtherComponent;

  formData: FormGroup;
  data: Project = {
    id: null,
    name: '模拟数据',
    /** 监理 */
    supervisions: [{
      /** 名字 */
      name: '监理',
      /** 联系方式 */
      phone: '监理',
      /** 监理公司 */
      unit: '监理',
      /** 头像 */
      imgBase64: null
    }],
    /** 质检员信息 */
    qualityInspectors: [{
      /** 名字 */
      name: '自检员',
      /** 联系方式 */
      phone: '自检员',
      /** 监理公司 */
      unit: '自检员',
      /** 头像 */
      imgBase64: null
    }],
    /** 项目权限 */
    jurisdiction: 0,
    /** 其他信息 */
    otherInfo: [
      { key: '其他数据', value: '其他数据'}
    ],
    /** 上传服务器名称 */
    uploadingName: 'lzlq',
    /** 上传方式 */
    uploadingMode: false,
    /** 链接服务器数据 */
    uploadingLinkData: {
      url: 'lingqiao',
      user: 'lingqiao',
      password: 'lingqiao',
    }
  };
  deleteShow = false;
  unDel = [];


  menuFilter = (o1: Project) => o1.jurisdiction !== 8;

  constructor(
    private message: NzMessageService,
    private db: DbService,
    public appS: AppService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.menuFilter = (o1: Project) => o1.jurisdiction !== 8 || this.appS.userInfo.jurisdiction > 1;
    this.formInit(this.data);
  }

  ngOnChanges() {
  }
  /** 初始化数据 */
  formInit(data: Project) {
    const fb = new FormBuilder();
    this.formData = fb.group({
      id: [data.id],
      /** 名称 */
      name: [data.name, [Validators.required]],
      /** 监理 */
      supervisions: fb.array([]),
      /** 质检员 */
      qualityInspectors: fb.array([]),
      /** 项目权限 */
      jurisdiction: [data.jurisdiction],
      /** 其他信息 */
      otherInfo: otherInfoForm(data.otherInfo),
      /** 上传服务器名称 */
      uploadingName: [data.uploadingName],
      /** 上传方式 */
      uploadingMode: [data.uploadingMode],
      /** 上传服务器数据 */
      uploadingLinkData: fb.group([])
    });

    // this.formData.setValue(data);
    console.log('初始化数据', data, !data.id && data.name);
    this.formData.controls.name.setAsyncValidators([nameRepetition(this.db, this.dbName)]);
    setTimeout(() => {
      this.formData.controls.name.updateValueAndValidity();
    }, 1);
    this.selectUPloading(true);
  }

  onMneu(data: Project) {
    console.log('一条数据', data);
    this.data = data;
    this.formInit(data);
  }

  /**
   * *编辑
   */
  edit(data) {
    /** 复制一条数据 */
    if (!data) {
      this.data.id = null;
    /** 添加一条数据 */
    } else {
      this.data = data;
    }
    this.formInit(data);
    console.log(this.data, data);
  }
  /**
   * *编辑完成
   */
  editOk(id) {
    console.log(id);
    if (id) {
      this.leftMenu.getMenuData(id);
    } else {
      this.leftMenu.onClick();
    }
  }
  /** 删除 */
  async delete() {
    const id = this.appS.leftMenu;
    const count = await this.db.db.tension.filter(t => t.project === id).count();
    if (count === 0) {
      this.deleteShow = true;
      this.cdr.markForCheck();
      console.log('删除', id, '任务', count, this.deleteShow);
    } else {
      this.message.error(`有 ${count} 条任务在该项目下，不允许删除！`);
    }
  }
  async deleteOk(state = false) {
    if (state) {
      const msg = await this.db.db.project.delete(this.appS.leftMenu);
      console.log('删除了', msg);
      this.appS.leftMenu = null;
      this.leftMenu.getMenuData();
    }
    this.deleteShow = false;
  }
  /** 选择服务器创建必要项目数据 */
  selectUPloading(state = false) {
    try {
      const name = this.formData.get('uploadingName').value;
      console.log(name, upFormData.keys);
      this.unDel = upFormData.keys[name].project;

      if (state) {
        return;
      }
      if (name === 'hzxf') {
        const os = this.otherDom.otherInfoFormArr.value;
        const r = upFormData.hzxfOther(os, 'project')
        this.otherDom.initForm(r.other);
      }
    } catch (error) {
      console.warn('获取项目其他添加值有误！')
    }
  }
}
