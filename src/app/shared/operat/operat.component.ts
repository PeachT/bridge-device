import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectionStrategy, ChangeDetectorRef, SimpleChanges, OnChanges } from '@angular/core';
import { DbService } from 'src/app/services/db.service';
import { Project } from 'src/app/models/project';
import { NzMessageService, NzModalService } from 'ng-zorro-antd';
import { AppService } from 'src/app/services/app.service';
import { FormGroup } from '@angular/forms';
import { getModelBase } from 'src/app/models/base';

@Component({
  selector: 'app-operat',
  templateUrl: './operat.component.html',
  styleUrls: ['./operat.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OperatComponent implements OnInit, OnChanges {
  @Input() dbName: string;
  @Input() formData: FormGroup;
  // @Input() saveState = true;
  @Input() coprState = false;
  @Input() addState = true;
  @Input() valid = false;

  @Output() outEditOk = new EventEmitter();
  @Output() outEdit = new EventEmitter();
  @Output() outModification = new EventEmitter();
  @Output() outDelete = new EventEmitter();


  @Input() addFilterFun: (o1: any, o2: any) => boolean = (o1: any, o2: any) => o1.name === o2.name;
  @Input() updateFilterFun: (o1: any, o2: any) => boolean = (o1: any, o2: any) => o1.name === o2.name && o1.id !== o2.id;


  constructor(
    private message: NzMessageService,
    private db: DbService,
    public appS: AppService,
    private modalService: NzModalService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
  }
  ngOnChanges(changes: SimpleChanges) {
    this.cdr.detectChanges();
  }
  /** 保存数据 */
  async save() {
    if (!this.formData.valid) {
      return ;
    }
    const data = this.formData.getRawValue();
    console.log('保存数据', data, this.formData.valid);
    let r = null;
    const msg = !data.id ? '添加' : '修改';
    // let state = true;
    // 添加
    if (!data.id) {
      delete data.id;
      // r = await this.db.addAsync(this.dbName, data, (p: Project) => p.name === data.name);
      r = await this.db.addAsync(this.dbName, data, (o: any) => this.addFilterFun(o, data));
    } else {
      r = await this.db.updateAsync(this.dbName, data, (o: any) => this.updateFilterFun(o, data));
    }

    console.log(data, r);
    if (r.success) {
      this.message.success(`${msg}成功🙂`);
      this.appS.edit = false;
      this.outEditOk.emit(
        {
          projectId: data.project,
          componentName: data.component,
          bridgeId: r.id
        }
      );
    } else {
      this.message.error(`${msg}失败😔`);
      console.log(`${msg}失败😔`, r.msg);
    }
    this.cdr.detectChanges();
  }
  /** 取消编辑 */
  cancelEdit() {
    const m = this.modalService.warning({
      nzTitle: '确定取消编辑吗？',
      nzContent: '放弃本次数据编辑，数据不会更改！',
      nzCancelText: '继续编辑',
      nzOnOk: () => {
        this.appS.edit = false;
        this.outEditOk.emit();
      },
      nzOnCancel: () => { console.log('取消'); }
    });
  }
  /**
   * *true:添加 | false:复制
   */
  edit(state: boolean) {
    this.appS.editId = null;
    this.appS.leftMenu = null;
    const data = state ? getModelBase(this.dbName) : null;
    this.outEdit.emit(data);
    this.appS.edit = true;
  }
  /** 修改 */
  modification() {
    this.appS.edit = true;
    this.outModification.emit();
  }
  /** 删除 */
  delete() {
    this.outDelete.emit();
  }
  op(event) {
    console.warn(this.appS.leftMenu);
    if (this.appS.userInfo) {
      if (this.appS.userInfo.jurisdiction > 0) {
        return true;
      }
      return this.appS.userInfo.operation.indexOf(event) > - 1;
    }
    return false;
  }
}
