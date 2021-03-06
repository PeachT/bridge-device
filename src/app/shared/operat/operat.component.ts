import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { DbService } from 'src/app/services/db.service';
import { Project } from 'src/app/models/project';
import { NzMessageService, NzModalService } from 'ng-zorro-antd';
import { AppService } from 'src/app/services/app.service';
import { FormGroup } from '@angular/forms';
import { getModelBase } from 'src/app/models/base';
import { PLCService } from 'src/app/services/PLC.service';

@Component({
  selector: 'app-operat',
  templateUrl: './operat.component.html',
  styleUrls: ['./operat.component.less']
})
export class OperatComponent implements OnInit {
  @Input() dbName: string;
  @Input() formData: FormGroup;
  @Input() saveState = true;
  @Input() coprState = false;

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
    public PLCS: PLCService,
    private modalService: NzModalService,
  ) { }

  ngOnInit() {
  }
  /** 保存数据 */
  async save() {
    const data = this.formData.value;
    console.log('保存数据', data);
    let r = null;
    const msg = !data.id ? '添加' : '修改';
    // let state = true;
    // 添加
    if (!data.id) {
      // if (this.dbName === 'jack') {
      //   state = await this.PLCS.setPLCMm(data);
      // }
      // if (!state) {
      //   this.message.error('添加失败PLC设置错误无法保存');
      //   return;
      // }
      delete data.id;
      // r = await this.db.addAsync(this.dbName, data, (p: Project) => p.name === data.name);
      r = await this.db.addAsync(this.dbName, data, (o: any) => this.addFilterFun(o, data));
    } else {
      r = await this.db.updateAsync(this.dbName, data, (o: any) => this.updateFilterFun(o, data));
    }

    console.log(r);
    if (r.success) {
      this.message.success(`${msg}成功🙂`);
      this.appS.edit = false;
      this.outEditOk.emit(r.id);
    } else {
      this.message.error(`${msg}失败😔`);
      console.log(`${msg}失败😔`, r.msg);
    }

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
    this.outModification.emit();
  }
  /** 删除 */
  delete() {
    this.outDelete.emit();
  }
  op(event) {
    if (this.appS.userInfo) {
      if (this.appS.userInfo.jurisdiction > 0) {
        return true;
      }
      return this.appS.userInfo.operation.indexOf(event) > - 1;
    }
    return false;
  }
}
