import { Component, OnInit, ViewChild } from '@angular/core';
import { LeftMenuComponent } from 'src/app/shared/left-menu/left-menu.component';
import { TensionDevice } from 'src/app/models/jack';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { DbService } from 'src/app/services/db.service';
import { AppService } from 'src/app/services/app.service';
import { nameRepetition } from 'src/app/Validator/async.validator';

@Component({
  selector: 'app-jack',
  templateUrl: './jack.component.html',
  styleUrls: ['./jack.component.less']
})
export class JackComponent implements OnInit {
  dbName = 'jack';
  @ViewChild('leftMenu', null) leftMenu: LeftMenuComponent;

  formData: FormGroup;
  data: TensionDevice = {
    name: '模拟',
    equation: false,
    jackModel: '240Q',
    pumpModel: 'CZB2X3-500',
    A1: {
      /** 千斤顶编号 */
      jackNo: '00A1',
      /** 油泵编号 */
      pumpNo: 'LQ0001',
      /** 标定系数a */
      a: 1,
      /** 标定系数b */
      b: 0,
      /** 标定日期 */
      date: new Date()
    },
    A2: {
      /** 千斤顶编号 */
      jackNo: '00A2',
      /** 油泵编号 */
      pumpNo: 'LQ0002',
      /** 标定系数a */
      a: 1,
      /** 标定系数b */
      b: 0,
      /** 标定日期 */
      date: new Date()
    },
    B1: {
      /** 千斤顶编号 */
      jackNo: '00B1',
      /** 油泵编号 */
      pumpNo: 'LQ0001',
      /** 标定系数a */
      a: 1,
      /** 标定系数b */
      b: 0,
      /** 标定日期 */
      date: new Date()
    },
    B2: {
      /** 千斤顶编号 */
      jackNo: '00B2',
      /** 油泵编号 */
      pumpNo: 'LQ0002',
      /** 标定系数a */
      a: 1,
      /** 标定系数b */
      b: 0,
      /** 标定日期 */
      date: new Date()
    }
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
      equation: [data.equation],
      jackModel: [data.jackModel],
      pumpModel: [data.pumpModel],
      A1: fb.group([]),
      A2: fb.group([]),
      B1: fb.group([]),
      B2: fb.group([]),
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

  onMneu(data: TensionDevice) {
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
