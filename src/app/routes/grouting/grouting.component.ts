import { Component, OnInit, ViewChild, Input, ChangeDetectorRef, OnDestroy, TemplateRef } from '@angular/core';
import { AddOtherComponent } from 'src/app/shared/add-other/add-other.component';
import { GroutingTask, GroutingItem } from 'src/app/models/grouting';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { DbService } from 'src/app/services/db.service';
import { NzMessageService, NzModalService, NzModalRef } from 'ng-zorro-antd';
import { AppService } from 'src/app/services/app.service';
import { PLCService } from 'src/app/services/PLC.service';
import { ElectronService } from 'ngx-electron';
import { nameRepetition } from 'src/app/Validator/async.validator';
import { Comp } from 'src/app/models/component';
import { copyAny } from 'src/app/models/base';
import { GroutingRecordComponent } from './components/grouting-record/grouting-record.component';
import { ProportionComponent } from './components/proportion/proportion.component';
import { TaskMenuComponent } from 'src/app/shared/task-menu/task-menu.component';
import { Subscription } from 'rxjs';
import { GroutingService } from 'src/app/services/grouting.service';
import { PLC_D } from 'src/app/models/IPCChannel';
import { format } from 'date-fns';
import { Project } from 'src/app/models/project';
import { HttpService } from 'src/app/services/http.service';
import { uploadingData } from 'src/app/Function/uploading';

// tslint:disable-next-line:max-line-length
const ddd = { Data: { beamBoardType: "高山寨 2号桥", holeNum: "0", stepsTimes: "1", dutyPersonnel: "0", beamNO: "Y1-2", holeNO: "N1", groutingModel: "小循环", groutingDate: "2018-10-09", mixingProportion: "197.0:0.0:55.1", waterGlueProportion: "0", mixingTime: "60", startTime: "2018-10-09 17:43:45", endTime: "2018-10-09 17:47:53", intoPulpPressure: "0.6", outPulpPressure: "0.0", pressureHoldingTime: "120", intoPulpvolume: "310.3", Datas: [{ outPulpPressure: "0.0", timeSeconds: "0", state: "压浆", intoPulpPressure: "0.0" }, { outPulpPressure: "0.0", timeSeconds: "1", state: "压浆", intoPulpPressure: "0.0" }, { outPulpPressure: "0.0", timeSeconds: "2", state: "压浆", intoPulpPressure: "0.0" }, { outPulpPressure: "0.0", timeSeconds: "3", state: "压浆", intoPulpPressure: "0.0" }, { outPulpPressure: "0.0", timeSeconds: "4", state: "压浆", intoPulpPressure: "0.0" }, { outPulpPressure: "0.0", timeSeconds: "5", state: "压浆", intoPulpPressure: "0.0" }, { outPulpPressure: "0.0", timeSeconds: "6", state: "压浆", intoPulpPressure: "0.0" }, { outPulpPressure: "0.0", timeSeconds: "7", state: "压浆", intoPulpPressure: "0.0" }, { outPulpPressure: "0.0", timeSeconds: "8", state: "压浆", intoPulpPressure: "0.0" }, { outPulpPressure: "0.0", timeSeconds: "9", state: "压浆", intoPulpPressure: "0.0" }, { outPulpPressure: "0.0", timeSeconds: "10", state: "压浆", intoPulpPressure: "0.0" }, { outPulpPressure: "0.0", timeSeconds: "11", state: "压浆", intoPulpPressure: "0.0" }, { outPulpPressure: "0.0", timeSeconds: "12", state: "压浆", intoPulpPressure: "0.16" }, { outPulpPressure: "0.0", timeSeconds: "13", state: "压浆", intoPulpPressure: "0.34" }, { outPulpPressure: "0.0", timeSeconds: "14", state: "压浆", intoPulpPressure: "0.34" }, { outPulpPressure: "0.0", timeSeconds: "15", state: "压浆", intoPulpPressure: "0.34" }, { outPulpPressure: "0.0", timeSeconds: "16", state: "压浆", intoPulpPressure: "0.36" }, { outPulpPressure: "0.0", timeSeconds: "17", state: "压浆", intoPulpPressure: "0.42" }, { outPulpPressure: "0.0", timeSeconds: "18", state: "压浆", intoPulpPressure: "0.33" }, { outPulpPressure: "0.0", timeSeconds: "19", state: "压浆", intoPulpPressure: "0.9" }, { outPulpPressure: "0.0", timeSeconds: "20", state: "压浆", intoPulpPressure: "0.61" }, { outPulpPressure: "0.0", timeSeconds: "21", state: "压浆", intoPulpPressure: "0.6" }, { outPulpPressure: "0.0", timeSeconds: "22", state: "压浆", intoPulpPressure: "0.6" }, { outPulpPressure: "0.0", timeSeconds: "23", state: "压浆", intoPulpPressure: "0.63" }, { outPulpPressure: "0.0", timeSeconds: "24", state: "压浆", intoPulpPressure: "0.63" }, { outPulpPressure: "0.0", timeSeconds: "25", state: "压浆", intoPulpPressure: "0.18" }, { outPulpPressure: "0.0", timeSeconds: "26", state: "压浆", intoPulpPressure: "0.43" }, { outPulpPressure: "0.0", timeSeconds: "27", state: "压浆", intoPulpPressure: "0.42" }, { outPulpPressure: "0.0", timeSeconds: "28", state: "压浆", intoPulpPressure: "0.43" }, { outPulpPressure: "0.0", timeSeconds: "29", state: "压浆", intoPulpPressure: "0.44" }, { outPulpPressure: "0.0", timeSeconds: "30", state: "压浆", intoPulpPressure: "0.46" }, { outPulpPressure: "0.0", timeSeconds: "31", state: "压浆", intoPulpPressure: "1.05" }, { outPulpPressure: "0.0", timeSeconds: "32", state: "压浆", intoPulpPressure: "0.44" }, { outPulpPressure: "0.0", timeSeconds: "33", state: "压浆", intoPulpPressure: "0.49" }, { outPulpPressure: "0.0", timeSeconds: "34", state: "压浆", intoPulpPressure: "0.61" }, { outPulpPressure: "0.0", timeSeconds: "35", state: "压浆", intoPulpPressure: "0.53" }, { outPulpPressure: "0.0", timeSeconds: "36", state: "压浆", intoPulpPressure: "0.61" }, { outPulpPressure: "0.0", timeSeconds: "37", state: "压浆", intoPulpPressure: "0.0" }, { outPulpPressure: "0.0", timeSeconds: "38", state: "压浆", intoPulpPressure: "0.01" }, { outPulpPressure: "0.0", timeSeconds: "39", state: "压浆", intoPulpPressure: "0.0" }, { outPulpPressure: "0.0", timeSeconds: "40", state: "压浆", intoPulpPressure: "0.0" }, { outPulpPressure: "0.0", timeSeconds: "41", state: "压浆", intoPulpPressure: "0.0" }, { outPulpPressure: "0.0", timeSeconds: "42", state: "压浆", intoPulpPressure: "0.0" }, { outPulpPressure: "0.0", timeSeconds: "43", state: "压浆", intoPulpPressure: "0.0" }, { outPulpPressure: "0.0", timeSeconds: "44", state: "压浆", intoPulpPressure: "0.0" }, { outPulpPressure: "0.0", timeSeconds: "45", state: "压浆", intoPulpPressure: "0.0" }, { outPulpPressure: "0.0", timeSeconds: "46", state: "压浆", intoPulpPressure: "0.0" }, { outPulpPressure: "0.0", timeSeconds: "47", state: "压浆", intoPulpPressure: "0.0" }, { outPulpPressure: "0.0", timeSeconds: "48", state: "压浆", intoPulpPressure: "0.0" }, { outPulpPressure: "0.0", timeSeconds: "49", state: "压浆", intoPulpPressure: "0.0" }, { outPulpPressure: "0.0", timeSeconds: "50", state: "压浆", intoPulpPressure: "0.01" }, { outPulpPressure: "0.0", timeSeconds: "51", state: "压浆", intoPulpPressure: "0.01" }, { outPulpPressure: "0.0", timeSeconds: "52", state: "压浆", intoPulpPressure: "0.01" }, { outPulpPressure: "0.0", timeSeconds: "53", state: "压浆", intoPulpPressure: "0.01" }, { outPulpPressure: "0.0", timeSeconds: "54", state: "压浆", intoPulpPressure: "0.01" }, { outPulpPressure: "0.0", timeSeconds: "55", state: "压浆", intoPulpPressure: "0.01" }, { outPulpPressure: "0.0", timeSeconds: "56", state: "压浆", intoPulpPressure: "0.01" }, { outPulpPressure: "0.0", timeSeconds: "57", state: "压浆", intoPulpPressure: "0.01" }, { outPulpPressure: "0.0", timeSeconds: "58", state: "压浆", intoPulpPressure: "0.01" }, { outPulpPressure: "0.0", timeSeconds: "59", state: "压浆", intoPulpPressure: "0.01" }, { outPulpPressure: "0.0", timeSeconds: "60", state: "压浆", intoPulpPressure: "0.01" }, { outPulpPressure: "0.0", timeSeconds: "61", state: "压浆", intoPulpPressure: "0.01" }, { outPulpPressure: "0.0", timeSeconds: "62", state: "压浆", intoPulpPressure: "0.01" }, { outPulpPressure: "0.0", timeSeconds: "63", state: "压浆", intoPulpPressure: "0.01" }, { outPulpPressure: "0.0", timeSeconds: "64", state: "压浆", intoPulpPressure: "0.01" }, { outPulpPressure: "0.0", timeSeconds: "65", state: "压浆", intoPulpPressure: "0.01" }, { outPulpPressure: "0.0", timeSeconds: "66", state: "压浆", intoPulpPressure: "0.01" }, { outPulpPressure: "0.0", timeSeconds: "67", state: "压浆", intoPulpPressure: "0.01" }, { outPulpPressure: "0.0", timeSeconds: "68", state: "压浆", intoPulpPressure: "0.0" }, { outPulpPressure: "0.0", timeSeconds: "69", state: "压浆", intoPulpPressure: "0.27" }, { outPulpPressure: "0.0", timeSeconds: "70", state: "压浆", intoPulpPressure: "0.28" }, { outPulpPressure: "0.0", timeSeconds: "71", state: "压浆", intoPulpPressure: "0.29" }, { outPulpPressure: "0.0", timeSeconds: "72", state: "压浆", intoPulpPressure: "0.31" }, { outPulpPressure: "0.0", timeSeconds: "73", state: "压浆", intoPulpPressure: "0.35" }, { outPulpPressure: "0.0", timeSeconds: "74", state: "压浆", intoPulpPressure: "0.11" }, { outPulpPressure: "0.0", timeSeconds: "75", state: "压浆", intoPulpPressure: "0.6" }, { outPulpPressure: "0.0", timeSeconds: "76", state: "压浆", intoPulpPressure: "0.74" }, { outPulpPressure: "0.0", timeSeconds: "77", state: "压浆", intoPulpPressure: "0.7" }, { outPulpPressure: "0.0", timeSeconds: "78", state: "压浆", intoPulpPressure: "0.68" }, { outPulpPressure: "0.0", timeSeconds: "79", state: "压浆", intoPulpPressure: "0.66" }, { outPulpPressure: "0.0", timeSeconds: "80", state: "压浆", intoPulpPressure: "0.65" }, { outPulpPressure: "0.0", timeSeconds: "81", state: "压浆", intoPulpPressure: "0.64" }, { outPulpPressure: "0.0", timeSeconds: "82", state: "压浆", intoPulpPressure: "0.63" }, { outPulpPressure: "0.0", timeSeconds: "83", state: "压浆", intoPulpPressure: "0.62" }, { outPulpPressure: "0.0", timeSeconds: "84", state: "压浆", intoPulpPressure: "0.61" }, { outPulpPressure: "0.0", timeSeconds: "85", state: "压浆", intoPulpPressure: "0.1" }, { outPulpPressure: "0.0", timeSeconds: "86", state: "压浆", intoPulpPressure: "0.28" }, { outPulpPressure: "0.0", timeSeconds: "87", state: "压浆", intoPulpPressure: "0.29" }, { outPulpPressure: "0.0", timeSeconds: "88", state: "压浆", intoPulpPressure: "0.3" }, { outPulpPressure: "0.0", timeSeconds: "89", state: "压浆", intoPulpPressure: "0.32" }, { outPulpPressure: "0.0", timeSeconds: "90", state: "压浆", intoPulpPressure: "0.04" }, { outPulpPressure: "0.0", timeSeconds: "91", state: "压浆", intoPulpPressure: "0.64" }, { outPulpPressure: "0.0", timeSeconds: "92", state: "压浆", intoPulpPressure: "0.76" }, { outPulpPressure: "0.0", timeSeconds: "93", state: "压浆", intoPulpPressure: "0.73" }, { outPulpPressure: "0.0", timeSeconds: "94", state: "压浆", intoPulpPressure: "0.71" }, { outPulpPressure: "0.0", timeSeconds: "95", state: "压浆", intoPulpPressure: "0.7" }, { outPulpPressure: "0.0", timeSeconds: "96", state: "压浆", intoPulpPressure: "0.68" }, { outPulpPressure: "0.0", timeSeconds: "97", state: "压浆", intoPulpPressure: "0.67" }, { outPulpPressure: "0.0", timeSeconds: "98", state: "压浆", intoPulpPressure: "0.66" }, { outPulpPressure: "0.0", timeSeconds: "99", state: "压浆", intoPulpPressure: "0.66" }, { outPulpPressure: "0.0", timeSeconds: "100", state: "压浆", intoPulpPressure: "0.65" }] } }
@Component({
  selector: 'app-grouting',
  templateUrl: './grouting.component.html',
  styleUrls: ['./grouting.component.less']
})
export class GroutingComponent implements OnInit, OnDestroy {
  dbName = 'grouting';
  @ViewChild('taskmenu', null) taskMenuDom: TaskMenuComponent;
  @ViewChild('groutingRecord', null) groutingRecordDom: GroutingRecordComponent;
  @ViewChild('proportions', null) proportionDom: ProportionComponent;
  @ViewChild('otherInfo', null) otherIngoDom: AddOtherComponent;
  @ViewChild('tplTitle', null) tplTitle: TemplateRef<{}>;
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
  monitoringMsg = {
    state: false,
    color: '#d42517',
    save: false
  };
  /** 监听PLC */
  plcsub: Subscription;
  plcLink = false;
  /** 模板 */
  saveTpl: { data: GroutingTask, group: GroutingItem } = {
    data: null,
    group: null,
  };
  /** 模板压浆方向 */
  tpmDirection = null;
  /** 选择监控模板 */
  groutingTemplateShow = false;

  addFilterFun = (o1: any, o2: any) => o1.name === o2.name
    && o1.component === o2.component && o1.project === o2.project
  updateFilterFun = (o1: GroutingTask, o2: GroutingTask) => o1.name === o2.name
    && o1.component === o2.component && o1.project === o2.project && o1.id !== o2.id

  constructor(
    private fb: FormBuilder,
    public odb: DbService,
    private message: NzMessageService,
    public appS: AppService,
    public GPLCS: GroutingService,
    private e: ElectronService,
    private cdr: ChangeDetectorRef,
    private modalService: NzModalService,
    private http: HttpService
  ) {

  }

  ngOnInit() {
    this.plcLink = this.GPLCS.linkMsg.link;
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
      /** 浆液水浆比 */
      proportion: [],
      proportions: this.fb.array(this.proportionDom.createForm([
        { name: '水', type: '水', value: null, total: null },
        { name: '水泥', type: '水泥', value: null, total: null },
      ])),
      /** 第一个孔完成开始时间 */
      startDate: [],
      /** 最后一个孔完成时间 */
      entDate: [],
      /** 模板 */
      template: []
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
  ngOnDestroy() {
    console.log('退出');
    if (this.plcsub) {
      this.plcsub.unsubscribe();
    }
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
      stirTime: null,
      proportion: null,
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
  /** 监控压浆 */
  monitoring() {
    this.groutingTemplateShow = true;
    // const t = `<h2>将使用 ${this.data.name} - ${this.data.component} 作为压浆模板。</h2>`;
    // const modal: NzModalRef = this.modalService.create({
    //   nzTitle: '压浆模板确认',
    //   // nzContent: '千斤顶名称模式不一致不能导入',
    //   nzContent: t,
    //   nzClosable: false,
    //   nzMaskClosable: false,
    //   // nzWidth: '60%',
    //   nzFooter: [
    //     {
    //       label: '取消',
    //       shape: 'default',
    //       type: 'danger',
    //       onClick: () => {
    //         modal.destroy();
    //         return;
    //       }
    //     },
    //     {
    //       label: '确定模板',
    //       shape: 'default',
    //       type: 'primary',
    //       onClick: () => {
    //         if (!this.plcsub) {
    //           const gdata: GroutingTask = copyAny(this.data);
    //           this.tpmDirection = gdata.groups[0].direction;
    //           gdata.id = null;
    //           gdata.otherInfo[0].value = null;
    //           gdata.groups = [];
    //           this.saveTpl.data = gdata;
    //           // data.groups.map(item => {
    //           //   return this.creationGroutingItem(item.name);
    //           // });
    //           this.plcsub = this.GPLCS.plcSubject.subscribe((data: any) => {
    //             console.warn(data.data[0]);
    //             if (data.data[0]) {
    //               console.error(data);
    //             }
    //             if (data.state) {
    //               this.monitoringMsg.color = '#20a162';
    //               if (data.data[0] && !this.monitoringMsg.save) {
    //                 this.groutingSave();
    //                 this.monitoringMsg.save = true;
    //               } else if (!data.data[0] && this.monitoringMsg.save) {
    //                 this.monitoringMsg.save = false;
    //               }
    //             } else {
    //               this.monitoringMsg.color = '#d42517';
    //             }
    //             this.cdr.detectChanges();
    //             this.cdr.markForCheck();
    //           });
    //         }
    //         modal.destroy();
    //         return;
    //       }
    //     },
    //   ]
    // });
  }
  /** 确认模板监控 */
  async selectGroutingTemp(id) {
    console.log(id);
    const gdata = await this.odb.getOneAsync('grouting', (g: GroutingTask) => g.id === id);
    if (!this.plcsub) {
      this.tpmDirection = gdata.groups[0].direction;
      gdata.id = null;
      gdata.otherInfo[0].value = null;
      gdata.groups = [];
      this.saveTpl.data = gdata;
      // data.groups.map(item => {
      //   return this.creationGroutingItem(item.name);
      // });
      this.plcsub = this.GPLCS.plcSubject.subscribe((data: any) => {
        console.warn(data.data[0]);
        if (data.data[0]) {
          console.error(data);
        }
        if (data.state) {
          this.monitoringMsg.color = '#20a162';
          if (data.data[0] && !this.monitoringMsg.save) {
            this.groutingSave();
            this.monitoringMsg.save = true;
          } else if (!data.data[0] && this.monitoringMsg.save) {
            this.monitoringMsg.save = false;
          }
        } else {
          this.monitoringMsg.color = '#d42517';
        }
        this.cdr.detectChanges();
        this.cdr.markForCheck();
      });
    }
    this.groutingTemplateShow = false;
  }
  stopMonitoring() {
    this.plcsub.unsubscribe();
    this.plcsub = null;
    this.monitoringMsg.color = '#d42517';
  }
  /** 压浆完成保存 */
  async groutingSave() {
    const arrs = [
      { channel: 'groutingF03ASCII', address: PLC_D(152), value: 2 },
      { channel: 'groutingF03ASCII', address: PLC_D(220), value: 4 },
      { address: PLC_D(276), value: 16 },
      { address: PLC_D(50), value: 2 },
      { address: PLC_D(250), value: 2 },
      { address: PLC_D(208), value: 1 },
      // { channel: 'groutingF03ASCII', address: 2, value: 1 },
      // { channel: 'groutingF03ASCII', address: 3, value: 1 },
      // { address: 4, value: 1 },
      // { address: 5, value: 1 },
      // { address: 6, value: 1 },
      // { address: 7, value: 1 },
      // { address: 8, value: 1 },
    ];
    const backData = [];
    for (const item of arrs) {
      console.log('保存数据', item);
      await new Promise((resolve, reject) => {
        this.e.ipcRenderer.send(item.channel || 'groutingF03', { address: item.address, value: item.value, channel: 'groutingSaveback' });
        const t = setTimeout(() => {
          this.e.ipcRenderer.removeAllListeners('groutingSaveback');
          console.error('获取数据超时');
          return;
        }, 3000);
        this.e.ipcRenderer.once('groutingSaveback', (event, data) => {
          console.log(item, `设置返回的结果`, data);
          clearTimeout(t);
          backData.push(data);
          resolve(data);
        });
      });
    }
    const bridgeName = backData[1].str;
    const date = `${backData[2].uint16[7]}-${backData[2].uint16[8]}-${backData[2].uint16[9]}`;
    // const groud: GroutingItem =  {
    //   /** 孔号 */
    //   name: backData[0].str,
    //   /** 试验日期 */
    //   testDate: null,
    //   /** 压浆方向 */
    //   direction: null,
    //   /** 张拉开始时间 */
    //   startDate: new Date(),
    //   /** 张拉结束时间 */
    //   endDate: new Date(),
    //   /** 压浆压力 */
    //   setMpa: 0.6,
    //   /** 通过 */
    //   pass: null,
    //   /** 冒浆情况 */
    //   msg: null,
    //   /** 停留时间 */
    //   stayTime: null,
    //   /** 稳压时间 */
    //   steadyTime: null,
    //   /** 稳压压力 */
    //   steadyMpa: backData[2].uint16[0],
    //   /** 压浆状态 */
    //   state: 1,
    //   /** 上传状态 */
    //   upState: 0,
    //   /** 二次压浆 */
    //   tow: null,
    //   /** 压浆料量 */
    //   materialsTotal: backData[3].uint16[0],
    //   /** 水量 */
    //   waterTotal: backData[4].uint16[0],
    //   /** 搅拌时间 */
    //   stirTime: backData[6].uint16[0],
    //   /** 水浆比 */
    //   proportion: backData[5].uint16[0],
    //   any: backData
    // };
    const groud: GroutingItem = {
      /** 孔号 */
      name: backData[0].str,
      /** 试验日期 */
      testDate: null,
      /** 压浆方向 */
      direction: this.tpmDirection,
      /** 张拉开始时间 */
      startDate: new Date(`${date} ${backData[2].uint16[10]}:${backData[2].uint16[11]}:${backData[2].uint16[12]}`),
      /** 张拉结束时间 */
      endDate: new Date(`${date} ${backData[2].uint16[13]}:${backData[2].uint16[14]}:${backData[2].uint16[15]}`),
      /** 压浆压力 */
      setMpa: backData[2].float[2].toFixed(2),
      /** 通过 */
      pass: null,
      /** 冒浆情况 */
      msg: null,
      /** 停留时间 */
      stayTime: null,
      /** 稳压时间 */
      steadyTime: backData[2].uint16[6],
      /** 稳压压力 */
      steadyMpa: backData[2].float[0].toFixed(2),
      /** 压浆状态 */
      state: 2,
      /** 上传状态 */
      upState: 0,
      /** 二次压浆 */
      tow: null,
      /** 压浆料量 */
      materialsTotal: backData[3].float[0].toFixed(2),
      /** 水量 */
      waterTotal: backData[4].float[0].toFixed(2),
      /** 搅拌时间 */
      stirTime: backData[5].uint16[0] / 10,
      /** 水浆比 */
      proportion: backData[2].float[1].toFixed(2),
    };
    const getData = await this.odb.getOneAsync('grouting', (g: GroutingTask) =>
      g.name === bridgeName
      && g.project === this.saveTpl.data.project
      && g.component === this.saveTpl.data.component);
    console.log('save', getData);
    if (!getData) {
      const gdata: GroutingTask = copyAny(this.saveTpl.data);
      gdata.name = bridgeName;
      gdata.template = false;
      gdata.groups = [groud];
      console.log('save2', gdata);
      const saveback = await this.odb.addAsync('grouting', gdata, (g: GroutingTask) =>
        g.name === gdata.name
        && g.project === gdata.project
        && g.component === gdata.component);
      if (saveback.success) {
        this.taskMenuDom.res({ component: this.data.component, selectBridge: saveback.id });
      }
    } else {
      let index = null;
      getData.groups.filter((g, i) => {
        if (g.name === groud.name) {
          index = i;
        }
      });
      if (index !== null) {
        getData.groups[index] = groud;
      } else {
        getData.groups.push(groud);
      }
      console.log('save3', getData);
      const saveback = await this.odb.updateAsync('grouting', getData, (o1) => this.updateFilterFun(o1, getData));
      if (saveback.success) {
        this.taskMenuDom.res({ component: this.data.component, selectBridge: saveback.id });
      }
    }
  }
  /** 上传 */
  async upload() {
    const proj = await this.odb.getOneAsync('project', (p: Project) => p.id === this.taskMenuDom.project.select.id);
    console.log(this.data, proj);
    let url = null;
    let data = null;
    switch (proj.uploadingName) {
      case 'weepal':

        break;
      case 'xalj':
        url = uploadingData.xalj(proj.uploadingLinkData);
        data = uploadingData.xaljData(this.data);
        break;
      default:
        break;
    }
    console.log(data);
    // tslint:disable-next-line:max-line-length
    const d = {
      Data: {
        beamNO: "测试梁号1",
        holeNO: "HN1",
        stretchDrawDate: "2016-06-30",
        endTime: "2016-06-30 10:20:21",
        startTime: "2016-06-30 09:20:21",
        intoPulpPressure: "551.2",
        outPulpPressure: "124.2",
        Datas: [
          {
            timeSeconds:"16",
            intoPulpPressure:"157.2",
            outPulpvolume:"1578.01",
            state1:"保压"
          }
        ]
      }
    }
    data.map(g => {
      this.http.post(url, {Data: g}).subscribe(r => {
        console.log(r);
      }, err => {
        console.log(decodeURI(err.error.text))
      });
    });
  }
}
