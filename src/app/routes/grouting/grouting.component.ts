import { Component, OnInit, ViewChild, Input, ChangeDetectorRef } from '@angular/core';
import { AddOtherComponent } from 'src/app/shared/add-other/add-other.component';
import { GroutingTask, GroutingItem } from 'src/app/models/grouting';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { DbService } from 'src/app/services/db.service';
import { NzMessageService } from 'ng-zorro-antd';
import { AppService } from 'src/app/services/app.service';
import { PLCService } from 'src/app/services/PLC.service';
import { ElectronService } from 'ngx-electron';
import { nameRepetition } from 'src/app/Validator/async.validator';
import { Comp } from 'src/app/models/component';
import { copyAny } from 'src/app/models/base';
import { GroutingRecordComponent } from './components/grouting-record/grouting-record.component';
import { ProportionComponent } from './components/proportion/proportion.component';
import { TaskMenuComponent } from 'src/app/shared/task-menu/task-menu.component';

@Component({
  selector: 'app-grouting',
  templateUrl: './grouting.component.html',
  styleUrls: ['./grouting.component.less']
})
export class GroutingComponent implements OnInit {
  dbName = 'grouting';
  @ViewChild('taskmenu', null) taskMenuDom: TaskMenuComponent;
  @ViewChild('groutingRecord', null) groutingRecordDom: GroutingRecordComponent;
  @ViewChild('proportions', null) proportionDom: ProportionComponent;
  @ViewChild('otherInfo', null) otherIngoDom: AddOtherComponent;

  // @Input() taskMenu: TaskMenuComponent;

  data: GroutingTask;
  formData: FormGroup;

  /** 构建选择菜单c */
  componentOptions = {
    menu: [],
    holes: null
  };
  /** 孔数据 */
  holes: Array<string> = [];
  /** 选择孔数据 */
  holeMneu = {
    /** 孔分组数据 */
    names: [],
    /** 选择的孔名称 */
    name: null,
    /** 选择的孔index */
    index: null,
    /** 数据 */
    data: null,
  };
  /** 其他数据名称现在列表 */
  otherKey = [];
  propertionKey = [];
  /** 删除对话框 */
  deleteShow = false;
  /** 选项卡显示index */
  tabsetShow = 0;

  addFilterFun = (o1: any, o2: any) => o1.name === o2.name
    && o1.component === o2.component && o1.project === o2.project
  updateFilterFun = (o1: GroutingTask, o2: GroutingTask) => o1.name === o2.name
    && o1.component === o2.component && o1.project === o2.project && o1.id !== o2.id

  constructor(
    private fb: FormBuilder,
    public odb: DbService,
    private message: NzMessageService,
    public appS: AppService,
    public PLCS: PLCService,
    private e: ElectronService,
    private cdr: ChangeDetectorRef
  ) {

  }

  ngOnInit() {
    this.formData = this.fb.group({
      id: [],
      name: [null, [Validators.required], [nameRepetition(this.odb, 'grouting', this.updateFilterFun)]],
      project: [],
      component: [null, [Validators.required]],
      holeRadio: [null],
      otherInfo: this.fb.array(this.otherIngoDom.createForm([{ key: '浇筑日期', value: null }])),
      groups: [null, [Validators.required]],
      /** 气温 */
      airTemperature: [],
      /** 水温 */
      waterTemperature: [],
      /** 压浆温度 */
      groutingTemperature: [],
      /** 泌水率 */
      bleedingRate: [],
      /** 流动度 */
      mobility: [],
      /** 黏稠度 */
      viscosity: [],
      /** 压浆量 */
      groutingDosage: [],
      /** 浆液水胶比 */
      proportion: [],
      proportions: this.fb.array(this.proportionDom.createForm([
        { name: '水', type: '水', value: null, total: null },
        { name: '水泥', type: '水泥', value: null, total: null },
      ])),
      /** 第一个孔完成开始时间 */
      startDate: [],
      /** 最后一个孔完成时间 */
      entDate: [],
    });
    /** 获取构建菜单数据 */
    this.odb.db.comp.toArray().then((d) => {
      console.log(d);
      this.componentOptions.menu = [];
      d.map((item: Comp) => {
        item.hole.map((h) => {
          const value = `${item.name}/${h.name}`;
          this.componentOptions.menu.push({ name: value, holes: h.holes });
        });
      });
      console.log(this.componentOptions);
    }).catch(() => {
      this.message.error('获取构建数据错误!!');
    });
  }
  /** 切换显示项 */
  changeTabs(value) {
    console.log(value.index);
    this.tabsetShow = value.index;
  }
  /** 重新赋值 */
  reset() {
    // this.validateForm.setControl('otherInfo', this.fb.array(this.otherInfoForm()));
    this.formData.setControl('otherInfo', this.fb.array(this.otherIngoDom.createForm(this.data.otherInfo)));
    // 不刷新两次异步验证有问题
    this.formData.reset(this.data);
    // tslint:disable-next-line:forin
    for (const i in this.formData.controls) {
      this.formData.controls[i].markAsDirty();
      this.formData.controls[i].updateValueAndValidity();
    }
    // this.validateForm.reset(this.data);
  }

  /** 构建选择 */
  componentChange(event) {
    console.log(event);
    if (event && this.appS.edit) {
      /** 获取孔数据 */
      this.holes = this.componentOptions.menu.filter(f => f.name === event)[0].holes;
      this.autoGroup();
    }
  }
  autoGroup() {
    if (this.holes.length > 0) {
      const gs = [];
      this.holes.map((name, index) => {
        gs[index] = this.creationGroutingItem(name);
      });
      this.data.groups = gs;
      this.holeMneuNames();
      console.log(this.data, this.holeMneu);
      // this.holeMneu.names = this.holes.slice();
    }
  }
  creationGroutingItem(name: string): GroutingItem {
    return {
      /** 孔号 */
      name,
      /** 试验日期 */
      testDate: null,
      /** 压浆方向 */
      direction: null,
      /** 张拉开始时间 */
      startDate: null,
      /** 张拉结束时间 */
      endDate: null,
      /** 压浆压力 */
      setMpa: null,
      /** 通过 */
      pass: null,
      /** 冒浆情况 */
      msg: null,
      /** 停留时间 */
      stayTime: null,
      /** 稳压时间 */
      steadyTime: null,
      /** 稳压压力 */
      steadyMpa: null,
      /** 压浆状态 */
      state: 0,
      /** 上传状态 */
      upState: 0,
      /** 二次压浆 */
      tow: null,
      materialsTotal: null,
      waterTotal: null,
    };
  }
  /** 选择梁 */
  async onBridge(data: GroutingTask) {
    console.log('选择梁', data);
    if (!data) {
      return;
    }
    this.data = data;

    this.holeMneu = {
      name: null,
      names: [],
      index: null,
      data: null,
    };
    this.holeMneuNames();
    console.log('梁梁梁梁', this.data);
    this.reset();
    this.onHoleRadio(this.data.groups[0].name, 0);
  }
  /**
   * *切换分组
   */
  async onHoleRadio(name, i) {
    if (this.appS.edit && !this.groutingRecordDom.formData.valid) {
      this.message.error('数据填写有误！！');
    } else {
      /** 获取编辑数据 */
      this.holeMneu.index = i;
      this.holeMneu.name = name;
      this.holeMneu.data = this.data.groups[i];

      this.groutingRecordDom.createFormData(this.holeMneu.data);
      console.log('切换张拉组', this.data, name, i);
      console.log(this.holeMneu.data);
    }
    console.log(this.holeMneu.index, this.holeMneu.data, this.holeMneu.data.record);
  }
  /** 构造孔菜单 */
  holeMneuNames(state = true) {
    this.holeMneu.names = [];
    this.data.groups.map(g => {
      let cls = 0;
      if (g.state > 0) {
        if (state) {
          cls = g.state;
        }
      }
      // this.holeMneuData.names.push({ name: g.name, cls });
      this.holeMneu.names.push({ name: g.name, cls });
    });
  }

  /**
   * *编辑
   */
  onEdit(data: GroutingTask) {
    /** 复制 */
    if (!data) {
      data = copyAny(this.data);
      data.id = null;
      data.id = null;
      data.otherInfo[0].value = null;
      data.groups = data.groups.map(item => {
        return this.creationGroutingItem(item.name);
      });
      this.holeMneuNames(false);
      /** 添加 */
    } else {
      data.project = this.taskMenuDom.project.select.id;
      this.holeMneu.names = [];
    }
    this.data = data;
    this.holeMneu.name = null,
      this.holeMneu.index = null,
      this.holeMneu.data = null,
      this.groutingRecordDom.show = null;
    console.log('编辑', this.data);
    this.reset();
    console.log('编辑', this.data, this.appS.editId, this.appS.edit);
    this.taskMenuDom.markForCheck();
    // this.groutingRecordDom.markForCheck();
  }
  /**
   * *编辑完成
   */
  editOk(id) {
    console.log();
    if (id) {
      // this.leftMenu.getMenuData(id);
      this.taskMenuDom.res({ component: this.data.component, selectBridge: id });
      console.log('保存数据', this.holeMneu.index, this.formData.value);
    } else {
      // this.leftMenu.onClick();
      this.taskMenuDom.onMneu();
    }
  }

  /** 删除 */
  async delete() {
    const id = this.appS.leftMenu;
    const count = this.holeMneu.names.filter(h => h.cls > 0).length;
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
      const msg = await this.odb.db.grouting.delete(this.appS.leftMenu);
      console.log('删除了', msg);
      this.appS.leftMenu = null;
      this.taskMenuDom.getBridge();
    }
    this.deleteShow = false;
  }
  /** 更新孔数据 */
  updateGroupItem() {
    console.log('更新孔数据');
    const g = this.groutingRecordDom.formData.value;
    this.data.groups[this.holeMneu.index] = g;
    this.formData.controls.groups.setValue(this.data.groups);
  }

  link() {
    this.e.ipcRenderer.send('groutingRun', { ip: '127.0.0.1', port: 502, address: 1, uid: 'grouting', setTimeout: 3000 });

    this.e.ipcRenderer.on(`groutingconnection`, async (event, data) => {
      console.log(data);
    });
    this.e.ipcRenderer.on(`groutingheartbeat`, async (event, data) => {
      console.log(data);
    });
  }
}
