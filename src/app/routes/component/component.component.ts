import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { DbService } from 'src/app/services/db.service';
import { AppService } from 'src/app/services/app.service';
import { Comp } from 'src/app/models/component';
import { LeftMenuComponent } from 'src/app/shared/left-menu/left-menu.component';
import { nameRepetition } from 'src/app/Validator/async.validator';

@Component({
  selector: 'app-component',
  templateUrl: './component.component.html',
  styleUrls: ['./component.component.less'],
  // changeDetection: ChangeDetectionStrategy.OnPush
})
export class ComponentComponent implements OnInit {
  dbName = 'comp';
  @ViewChild('leftMenu', null) leftMenu: LeftMenuComponent;

  formData: FormGroup;
  data: Comp = {
    name: '模拟',
    hole: [
      {
        name: '空号',
        holes: ['N1', 'N2']
      }
    ]
  };
  deleteShow = false;

  constructor(
    private db: DbService,
    public appS: AppService,
  ) {
  }

  ngOnInit() {
    this.formInit();
  }
  /** 初始化数据 */
  formInit() {
    const data = this.data;
    const fb = new FormBuilder();
    this.formData = fb.group({
      id: [data.id],
      /** 名称 */
      name: [data.name, [Validators.required]],
      hole: fb.array([])
    });

    // this.formData.setValue(data);
    console.log('初始化数据', data, !data.id && data.name);
    this.formData.controls.name.setAsyncValidators([nameRepetition(this.db, this.dbName)]);
    setTimeout(() => this.formData.controls.name.updateValueAndValidity(), 1);
  }
  /** 预设构建名称 */
  bridgeOtherKeySelect() {
    const arr = this.leftMenu.menus.map(v => v.name);
    return ['T梁', '预制箱梁', '盖梁', '空心板梁'].filter(v => arr.indexOf(v) === -1);
  }

  onMneu(data: Comp) {
    console.log('一条数据', data);
    this.data = data;
    this.formInit();
  }
  /**
   * * 编辑
   */
  edit(data) {
    console.log(data);
    if (!data) {
      this.data.id = null;
    } else {
      this.data = data;
      console.log(this.data, data);
    }
    this.formInit();
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
    this.deleteOk();
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
}
