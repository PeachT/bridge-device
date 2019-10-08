import { Component, OnInit, ViewChild, ChangeDetectorRef, OnDestroy, TemplateRef } from '@angular/core';
import { FormGroup, FormBuilder, FormArray } from '@angular/forms';
import { DbService } from 'src/app/services/db.service';
import { NzMessageService, NzModalService } from 'ng-zorro-antd';
import { AppService } from 'src/app/services/app.service';
import { ElectronService } from 'ngx-electron';
import { copyAny } from 'src/app/models/base';
import { GroutingRecordComponent } from './components/grouting-record/grouting-record.component';
import { ProportionComponent } from './components/proportion/proportion.component';
import { TaskMenuComponent } from 'src/app/shared/task-menu/task-menu.component';
import { Subscription, forkJoin } from 'rxjs';
import { GroutingService } from 'src/app/services/grouting.service';
import { PLC_D } from 'src/app/models/IPCChannel';
import { Project } from 'src/app/models/project';
import { HttpService } from 'src/app/services/http.service';
import { uploadingData } from 'src/app/Function/uploading';
import { GroutingTask, GroutingInfo, GroutingHoleItem } from 'src/app/models/grouting';
import { GroutingMianComponent } from './components/mian/mian.component';
import { MixingInfoComponent } from './components/mixing-info/mixing-info.component';
import { createForm, createMixingInfoForm, createGroutingInfoForm, groutingTaskBase, groutingInfoBase, groutingHoleitemBase } from './createForm';
import { nameRepetition } from 'src/app/Validator/async.validator';

@Component({
  selector: 'app-grouting',
  templateUrl: './grouting.component.html',
  styleUrls: ['./grouting.component.less']
})
export class GroutingComponent implements OnInit, OnDestroy {
  dbName = 'grouting';
  @ViewChild('taskmenu', null) taskMenuDom: TaskMenuComponent;
  @ViewChild('groutingMian', { read: GroutingMianComponent, static: true }) groutingDom: GroutingMianComponent;
  @ViewChild('proportionInfo', { read: ProportionComponent, static: true }) proportionDom: ProportionComponent;
  @ViewChild('mixing', { read: MixingInfoComponent, static: true }) mixingDom: MixingInfoComponent;
  @ViewChild('groutingRecord', { read: GroutingRecordComponent, static: true }) groutingRecordDom: GroutingRecordComponent;
  @ViewChild('tplTitle', null) tplTitle: TemplateRef<{}>;


  // @Input() taskMenu: TaskMenuComponent;
  set proportionsForm(formArray: FormArray) {
    (this.formData.controls.proportionInfo as FormGroup).controls.proportions = formArray;
  }

  get mixingInfoForm(): FormArray {
    return this.formData.controls.mixingInfo as FormArray;
  }
  set mixingInfoForm(formArray: FormArray) {
    this.formData.controls.mixingInfo = formArray;
  }
  get groutingInfoForm(): FormArray {
    return this.formData.controls.groutingInfo as FormArray;
  }
  set groutingInfoForm(formArray: FormArray) {
    this.formData.controls.groutingInfo = formArray;
  }


  data: GroutingTask = {
    id: null,
    name: '测试base',
    createdDate: null,
    modificationDate: null,
    user: null,
    project: null,
    component: null,
    /** 梁长度 */
    beamLength: null,
    /** 张拉日期 */
    tensinDate: null,
    /** 浇筑日期 */
    castingDate: null,
    /** 压浆顺序 */
    sort: null,
    /** 压浆开始日期 */
    startDate: null,
    /** 压浆完成日期 */
    endDate: null,
    /** 设备编号 */
    deviceNo: null,
    /** 是否作为模板 */
    template: false,
    /** 其他数据信息 */
    otherInfo: null,
    /** 施工员 */
    operator: null,
    /** 监理员 */
    supervisors: null,
    /** 自检员 */
    qualityInspector: null,
    /** 配比信息 */
    proportionInfo: {
      waterBinderRatio: 0.99,
      proportions: [
        { name: '水', type: '水', value: 33 },
        { name: '水泥', type: '水泥', value: 22 },
        { name: '压浆剂', type: '压浆剂', value: 11 }
      ],
    },
    /** 压浆数据 */
    groutingInfo: [
      {
        /** 孔号 */
        name: 'N1',
        /** 压浆孔道采集数据 */
        groups: [
          {
            /** 压浆方向 */
            direction: null,
            /** 设置压浆压力 */
            setGroutingPressure: null,
            /** 环境温度 */
            envTemperature: null,
            /** 浆液温度 */
            slurryTemperature: null,
            /** 开始时间 */
            startDate: new Date(),
            /** 完成时间 */
            endDate: new Date(),
            /** 进浆压力 */
            intoPulpPressure: null,
            /** 回浆压力 */
            outPulpPressure: null,
            /** 进浆量 (L) */
            intoPulpvolume: null,
            /** 回浆量 (L) */
            outPulpvolume: null,
            /** 真空泵压力 */
            vacuumPumpPressure: null,
            /** 稳压时间 */
            steadyTime: null,
            /** 通过情况 */
            passMsg: null,
            /** 冒浆情况 */
            slurryEmittingMsg: null,
            /** 其他说明 */
            remarks: null,
            processDatas: {
              date: [
                '1570254841000', '1570254841000', '1570254842000', '1570254843000', '1570254844000',
                '1570254845000', '1570254846000', '1570254847000', '1570254848000', '1570254849000',
                '1570254850000', '1570254851000', '1570254852000', '1570254853000', '1570254854000',
                '1570254855000', '1570254856000', '1570254857000', '1570254858000', '1570254859000',
              ],
              intoPulpPressure: [
                0, 0.2, 0.3, 0.28, 0.3,
                0.4, 0.38, 0.41, 0.44, 0.45,
                0.42, 0.44, 0.45, 0.45, 0.48,
                0.52, 0.5, 0.51, 0.55, 0.6,
              ],
              outPulpPressure: [
                0.2, 0.1, 0.3, 0.58, 0.4,
                0.3, 0.24, 0.33, 0.22, 0.45,
                0.42, 0.44, 0.45, 0.45, 0.48,
                0.52, 0.5, 0.51, 0.55, 0.6,
              ],
              intoPulpvolume: [
                10, 20, 30, 40, 50,
                80, 90, 66, 77, 88,
                92, 99, 80, 60, 50,
                45, 32, 30, 26, 10,
              ],
              outPulpvolume: [
                0, 0, 0, 1, 2,
                80, 90, 66, 77, 88,
                92, 99, 80, 60, 50,
                45, 32, 30, 26, 10,
              ]
            }
          }
        ],
        /** 孔道内径 */
        holeDiameter: 20,
        /** 孔道长度 */
        holeLength: 22,
        /** 钢绞线数量 */
        steelStrandNum: 5,
        /** 上传状态 */
        uploading: true,
        /** 压浆状态 */
        state: 2,
      },
      {
        /** 孔号 */
        name: 'N2',
        /** 压浆孔道采集数据 */
        groups: [
          {
            /** 压浆方向 */
            direction: null,
            /** 设置压浆压力 */
            setGroutingPressure: null,
            /** 环境温度 */
            envTemperature: null,
            /** 浆液温度 */
            slurryTemperature: null,
            /** 开始时间 */
            startDate: new Date(),
            /** 完成时间 */
            endDate: new Date(),
            /** 进浆压力 */
            intoPulpPressure: null,
            /** 回浆压力 */
            outPulpPressure: null,
            /** 进浆量 (L) */
            intoPulpvolume: null,
            /** 回浆量 (L) */
            outPulpvolume: null,
            /** 真空泵压力 */
            vacuumPumpPressure: null,
            /** 稳压时间 */
            steadyTime: null,
            /** 通过情况 */
            passMsg: null,
            /** 冒浆情况 */
            slurryEmittingMsg: null,
            /** 其他说明 */
            remarks: null,
            processDatas: {
              date: [
                '1570254841000', '1570254841000', '1570254842000', '1570254843000', '1570254844000',
                '1570254845000', '1570254846000', '1570254847000', '1570254848000', '1570254849000',
                '1570254850000', '1570254851000', '1570254852000', '1570254853000', '1570254854000',
                '1570254855000', '1570254856000', '1570254857000', '1570254858000', '1570254859000',
              ],
              intoPulpPressure: [
                0, 0.2, 0.3, 0.28, 0.3,
                0.4, 0.38, 0.41, 0.44, 0.45,
                0.42, 0.44, 0.45, 0.45, 0.48,
                0.52, 0.5, 0.51, 0.55, 0,
              ],
              outPulpPressure: [
                0.2, 0.1, 0.3, 0.58, 0.4,
                0.3, 0.24, 0.33, 0.22, 0.45,
                0.42, 0.44, 0.45, 0.45, 0.48,
                0.52, 0.5, 0.51, 0.55, 0,
              ],
              intoPulpvolume: [
                10, 20, 30, 40, 50,
                80, 90, 66, 77, 88,
                92, 99, 80, 60, 50,
                45, 32, 30, 26, 0,
              ],
              outPulpvolume: [
                0, 0, 0, 1, 2,
                80, 90, 66, 77, 88,
                92, 99, 80, 60, 50,
                45, 32, 30, 26, 0,
              ]
            }
          },
          {
            /** 压浆方向 */
            direction: null,
            /** 设置压浆压力 */
            setGroutingPressure: null,
            /** 环境温度 */
            envTemperature: null,
            /** 浆液温度 */
            slurryTemperature: null,
            /** 开始时间 */
            startDate: new Date(),
            /** 完成时间 */
            endDate: new Date(),
            /** 进浆压力 */
            intoPulpPressure: null,
            /** 回浆压力 */
            outPulpPressure: null,
            /** 进浆量 (L) */
            intoPulpvolume: null,
            /** 回浆量 (L) */
            outPulpvolume: null,
            /** 真空泵压力 */
            vacuumPumpPressure: null,
            /** 稳压时间 */
            steadyTime: null,
            /** 通过情况 */
            passMsg: null,
            /** 冒浆情况 */
            slurryEmittingMsg: null,
            /** 其他说明 */
            remarks: null,
            processDatas: {
              date: [
                '1570254841000', '1570254841000', '1570254842000', '1570254843000', '1570254844000',
                '1570254845000', '1570254846000', '1570254847000', '1570254848000', '1570254849000',
                '1570254850000', '1570254851000', '1570254852000', '1570254853000', '1570254854000',
                '1570254855000', '1570254856000', '1570254857000', '1570254858000', '1570254859000',
              ],
              intoPulpPressure: [
                0, 0.2, 0.3, 0.28, 0.3,
                0.4, 0.38, 0.41, 0.44, 0.45,
                0.42, 0.44, 0.45, 0.45, 0.48,
                0.52, 0.5, 0.51, 0.55, 0.6,
              ],
              outPulpPressure: [
                0.2, 0.1, 0.3, 0.58, 0.4,
                0.3, 0.24, 0.33, 0.22, 0.45,
                0.42, 0.44, 0.45, 0.45, 0.48,
                0.52, 0.5, 0.51, 0.55, 0.6,
              ],
              intoPulpvolume: [
                10, 20, 30, 40, 50,
                80, 90, 66, 77, 88,
                92, 99, 80, 60, 50,
                45, 32, 30, 26, 10,
              ],
              outPulpvolume: [
                0, 0, 0, 1, 2,
                80, 90, 66, 77, 88,
                92, 99, 80, 60, 50,
                45, 32, 30, 26, 10,
              ]
            }
          }
        ],
        /** 孔道内径 */
        holeDiameter: 20,
        /** 孔道长度 */
        holeLength: 22,
        /** 钢绞线数量 */
        steelStrandNum: 5,
        /** 上传状态 */
        uploading: false,
        /** 压浆状态 */
        state: 2,
      }
    ],
    /** 搅拌数据 */
    mixingInfo: [
      {
        /** 用量 */
        dosage: [30, 100, 10],
        /** 开始时间 */
        startTime: new Date(),
        /** 搅拌时间 */
        mixingTime: 20,
        /** 泌水率 */
        bleedingRate: 1,
        /** 流动度 */
        fluidity: 28,
        /** 黏稠度 */
        viscosity: 0.5,
        /** 水胶比 */
        waterBinderRatio: 0.28,
        /** 水温 */
        waterTemperature: 22,
        /** 环境温度 */
        envTemperature: 35,
      },
      {
        /** 用量 */
        dosage: [300, 1000, 100],
        /** 开始时间 */
        startTime: new Date(),
        /** 搅拌时间 */
        mixingTime: 100,
        /** 泌水率 */
        bleedingRate: 101,
        /** 流动度 */
        fluidity: 102,
        /** 黏稠度 */
        viscosity: 103,
        /** 水胶比 */
        waterBinderRatio: 0.299,
        /** 水温 */
        waterTemperature: 22.5,
        /** 环境温度 */
        envTemperature: 33.3,
      }
    ],
  };
  formData: FormGroup;
  /** 删除数据 */
  deleteShow = false;

  /** 选项卡显示index */
  tabsetShow = 0;
  /** 上传 */
  uploading = false;
  /** 添加数据判断 */
  addFilterFun = (o1: any, o2: any) => o1.name === o2.name
    && o1.component === o2.component && o1.project === o2.project
  /** 修改数据判断 */
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
    private http: HttpService
  ) {

  }

  ngOnInit() {
    this.formInit(this.data);
  }
  /** 初始化数据 */
  formInit(data: GroutingTask) {
    this.formData = createForm(data);
    if (data.mixingInfo) {
      /** 初始化搅拌数据 */
      this.mixingInfoForm = createMixingInfoForm(data.mixingInfo);
      // this.mixingInfoForm.patchValue(data.mixingInfo);
    }
    if (data.groutingInfo) {
      /** 初始化压浆距离数据 */
      this.groutingInfoForm = createGroutingInfoForm(data.groutingInfo);
      this.groutingInfoForm.patchValue(data.groutingInfo);
    }
    /** 初始化配比数据 */
    this.formData.controls.proportionInfo.patchValue(data.proportionInfo);
    // this.formData.setValue(data);
    console.log('初始化数据', data);
    this.formData.controls.name.setAsyncValidators([nameRepetition(this.odb, this.dbName, this.updateFilterFun)]);
    setTimeout(() => {
      // tslint:disable-next-line:forin
      for (const i in this.formData.controls) {
        this.formData.controls[i].markAsDirty();
        this.formData.controls[i].updateValueAndValidity();
      }
    }, 1);
  }

  /** 选择构建 */
  selectComponent(value: Array<string>) {
    console.log(value);
    const groutingInfo = [];
    value.map(name => {
      const g = { ...groutingInfoBase, name };
      groutingInfo.push(g)
    });
    console.log(groutingInfo);
    this.data = { ...this.formData.getRawValue(), groutingInfo };
    this.formInit(this.data);
  }
  test() {
    // tslint:disable-next-line:forin
    for (const i in this.formData.controls) {
      this.formData.controls[i].markAsDirty();
      this.formData.controls[i].updateValueAndValidity();
      console.log(
        this.formData.controls[i].valid,
        i
      );
    }

    console.log(this.formData,
      this.formData.getRawValue(),
      this.formData.valid
      // this.mixingInfoForm.value,
      // this.groutingInfoForm.value,
    );
  }
  ngOnDestroy() {
    console.log('退出');
  }
  /** 切换显示项 */
  changeTabs(value) {
    console.log(value.index);
    this.tabsetShow = value.index;
  }

  /** 选择梁 */
  async onBridge(data: GroutingTask) {
    if (!data) {
      return;
    }
    this.data = data;
    this.uploading = false;
    this.data.groutingInfo.map(g => {
      if (!g.uploading) {
        this.uploading = true;
      }
    });
    this.formInit(this.data);
    console.log('梁梁梁梁', this.data, this.uploading);
  }

  /**
   * *编辑/添加
   */
  onEdit(data: GroutingTask) {
    /** 复制 */
    if (!data) {
      data = { ...this.data };
      data.id = null;
      data.tensinDate = null;
      data.castingDate = null;
      data.template = false;
      delete data.mixingInfo;
      for (const g of data.groutingInfo) {
        g.state = 0;
        const groups: Array<GroutingHoleItem> = [];
        for (const item of g.groups) {
          groups.push({ ...groutingHoleitemBase, direction: item.direction, setGroutingPressure: item.setGroutingPressure });
        }
        g.groups = groups;
        console.log(g);
      }
      console.log(data);

      this.data = data;
      /** 添加 */
    } else {
      this.data = groutingTaskBase;
      this.data.project = this.taskMenuDom.project.select.id;
    }
    console.log('添加', this.data);
    this.formInit(this.data);
  }
  /**
   * *编辑完成
   */
  editOk(id: number) {
    console.log();
    if (id) {
      // this.leftMenu.getMenuData(id);
      this.taskMenuDom.res({ component: this.data.component, selectBridge: id });
    } else {
      // this.leftMenu.onClick();
      this.taskMenuDom.onMneu();
    }
  }
  /** 删除 */
  async delete() {
    const id = this.appS.leftMenu;
    this.deleteShow = true;
    console.log('删除', id, '任务');
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
    const i = 0;
    const ups = [];
    data.map(g => {
      this.http.post(url, { Data: g }).subscribe(r => {
        console.log(r);
      }, err => {
        const result: any = decodeURI(err.error.text);
        ups.push({success: result, name: g.holeNO});
        console.log(result, ups);
        if (ups.length === data.length) {
          console.log('更新数据');

          this.data.groutingInfo.map(hg => {
            const up = ups.filter(f => f.name === hg.name);
            console.log('123', up);
            if (up.length > 0 && up[0].success.indexOf('压浆数据上传完成') !== -1) {
              hg.uploading = true;
            }
          });
          this.odb.updateAsync('grouting', this.data, (o: any) => this.updateFilterFun(o, this.data));
        }
      });
    });
    // const uphttp = data.map(g => this.http.post(url, { Data: g }));
    // forkJoin(uphttp).subscribe(val => {
    //     console.log('上传返回成功', val)
    //   }, err => {
    //     console.log('上传返回错误', err)
    //   }
    // );
  }
}
