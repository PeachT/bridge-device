import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { DbService } from 'src/app/services/db.service';
import { NzMessageService } from 'ng-zorro-antd';
import { AppService } from 'src/app/services/app.service';
import { User } from 'src/app/models/user.models';
import { LeftMenuComponent } from 'src/app/shared/left-menu/left-menu.component';
import { nameRepetition } from 'src/app/Validator/async.validator';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.less'],
  // changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserComponent implements OnInit {
  dbName = 'users';
  @ViewChild('leftMenu', null) leftMenu: LeftMenuComponent;
  formData: FormGroup;
  data: User = {
    name: '用户',
    password: '123',
    jurisdiction: 0,
    operation: []
  };
  deleteShow = false;
  menuFilter = (f) => false;

  constructor(
    private db: DbService,
    private message: NzMessageService,
    public appS: AppService,
    private cdr: ChangeDetectorRef,
  ) {
  }

  ngOnInit() {
    this.menuFilter = (f) => f.jurisdiction < 9 && (this.appS.userInfo.jurisdiction > f.jurisdiction || this.appS.userInfo.id === f.id);
    this.formInit();
  }

  /** 初始化数据 */
  formInit() {
    const data = this.data;
    const fb = new FormBuilder();
    this.formData = fb.group({
      id: [data.id],
      name: [data.name, [Validators.required]],
      password: [data.password, [Validators.required]],
      jurisdiction: [data.jurisdiction || 0],
      operation: [data.operation]
    });

    console.log('初始化数据', data, !data.id && data.name);
    this.formData.controls.name.setAsyncValidators([nameRepetition(this.db, this.dbName)]);
    if (!data.id && data.name) {
      setTimeout(() => {
        this.formData.controls.name.updateValueAndValidity();
      }, 1);
    }
  }

  onMneu(data: User) {
    console.log('一条数据', data);
    this.data = data;
    this.formInit();
  }

  /**
   * *编辑
   */
  edit(data) {
    if (!data) {
      this.data.id = null;
    } else {
      this.data = data;
      console.log(this.data, data);
    }
    this.formInit();
    this.leftMenu.markForCheck();
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
    const count = await this.db.db.task.filter(t => t.device[0] === id).count();
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
      const msg = await this.db.db.jack.delete(this.appS.leftMenu);
      console.log('删除了', msg);
      this.appS.leftMenu = null;
      this.leftMenu.getMenuData();
    }
    this.deleteShow = false;
  }
  selectOperation(event) {
    // const o = ['see', ...event];
    this.formData.controls.operation.setValue(event);
    console.log(event, this.formData.value.operation);
  }
}
