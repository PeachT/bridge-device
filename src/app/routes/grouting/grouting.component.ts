import { Component, OnInit, ViewChild, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { FormGroup, FormBuilder, FormArray, Validators } from '@angular/forms';
import { DbService } from 'src/app/services/db.service';
import { NzMessageService } from 'ng-zorro-antd';
import { AppService } from 'src/app/services/app.service';
import { Project } from 'src/app/models/project';
import { HttpService } from 'src/app/services/http.service';
import { uploadingData } from 'src/app/Function/uploading';
import { GroutingTask, GroutingHoleItem } from 'src/app/models/grouting';
import { nameRepetition } from 'src/app/Validator/async.validator';
import { upFormData } from 'src/app/Function/uploadingOther';
import { ScrollMenuComponent } from 'src/app/shared/scroll-menu/scroll-menu.component';
import { createForm } from './createForm';
import { mixingInfoInit, processDataInit, groutingHoleItemInit, groutingInfoInit, groutingTaskInit, getGroutingInfoInit } from 'src/app/models/groutingInit';
import { copyAny } from 'src/app/models/baseInit';

@Component({
  selector: 'app-grouting',
  templateUrl: './grouting.component.html',
  styleUrls: ['./grouting.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GroutingComponent implements OnInit, OnDestroy {
  dbName = 'grouting';
  @ViewChild('menu', null) menuDom: ScrollMenuComponent;

  data: GroutingTask = {
    ...groutingTaskInit,
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
    tensionDate: null,
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
    otherInfo: [],
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
        { name: '水', type: '水', value: 30 },
        { name: '辅料', type: '压浆剂', value: 10 },
        { name: '主料', type: '水泥', value: 100 },
      ],
    },
    /** 压浆数据 */
    groutingInfo: [
      {
        ...groutingInfoInit,
        /** 孔号 */
        name: 'N1',
        /** 压浆孔道采集数据 */
        groups: [
          {
            ...groutingHoleItemInit,
            processDatas: {
              ...processDataInit,
              hz: 1,
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
        otherInfo: []
      },
      {
        ...groutingInfoInit,
        /** 孔号 */
        name: 'N2',
        /** 压浆孔道采集数据 */
        groups: [
          {
            ...groutingHoleItemInit,
            /** 开始时间 */
            startDate: new Date(),
            /** 完成时间 */
            endDate: new Date(),
            processDatas: {
              ...processDataInit,
              hz: 1,
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
            ...groutingHoleItemInit,
            /** 开始时间 */
            startDate: new Date(),
            /** 完成时间 */
            endDate: new Date(),
            processDatas: {
              ...processDataInit,
              hz: 1,
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
        ...mixingInfoInit,
        /** 用量 */
        dosage: [30, 100, 10],
        /** 开始时间 */
        startDate: new Date(),
        endDate: new Date(),
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
        ...mixingInfoInit,
        /** 用量 */
        dosage: [300, 1000, 100],
        /** 开始时间 */
        startDate: new Date(),
        endDate: new Date(),
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
  /** 其他数据禁止删除key */
  otherUnDel = [];
  /** 添加数据判断 */
  addFilterFun = (o1: any, o2: any) => o1.name === o2.name
    && o1.component === o2.component && o1.project === o2.project
  /** 修改数据判断 */
  updateFilterFun = (o1: GroutingTask, o2: GroutingTask) => o1.name === o2.name
    && o1.component === o2.component && o1.project === o2.project && o1.id !== o2.id
  /** 菜单梁状态 */
  menuStateFunc = (g: GroutingTask) => {
    // console.log(g);
    return g.groutingInfo.map(item => {
      return item.state
    })
  }

  constructor(
    public odb: DbService,
    private message: NzMessageService,
    public appS: AppService,
    private http: HttpService,
    private crd: ChangeDetectorRef
  ) {

  }

  ngOnInit() {
    this.formInit(this.data);
    // setTimeout(() => {
    // }, 300);
  }
  async getPorject(): Promise<Project> {
    return await this.odb.getOneAsync('project', (p: Project) => p.id === this.menuDom.projectId);
  }
  /** 初始化数据 */
  formInit(data: GroutingTask) {
    console.log('初始化数据', data, !data.id && data.name);
    this.formData = createForm(data);
    this.formData.controls.name.setAsyncValidators([nameRepetition(this.odb, this.dbName, this.updateFilterFun)]);
    setTimeout(() => {
      console.log('测试验证');
      this.formData.controls.name.updateValueAndValidity();
    }, 1);
    this.crd.detectChanges();
  }

  /** 选择构建 */
  selectComponent(value: Array<string>) {
    console.log(value);
    const groutingInfo = [];
    value.map(name => {
      const g = { ...getGroutingInfoInit(), name };
      groutingInfo.push(g)
    });
    console.log(groutingInfo);
    this.data = { ...this.formData.getRawValue(), groutingInfo };
    this.formInit(this.data);
  }
  test() {
    // tslint:disable-next-line:forin
    for (const i in this.formData.controls) {
      console.log(
        this.formData.controls[i].valid,
        i
      );
      // this.formData.controls[i].markAsDirty();
      // this.formData.controls[i].updateValueAndValidity();
    }

    console.log(this.formData,
      this.formData.getRawValue(),
      this.formData.valid
    );
  }
  ngOnDestroy() {
    console.log('退出');
  }
  /** 切换显示项 */
  changeTabs(value) {
    this.tabsetShow = value.index;
  }

  /** 选择梁 */
  async selectBridge(data: GroutingTask) {
    if (!data) {
      return;
    }
    data.mixingInfo.map(m => {
      if ('startTime' in data) {
        m.startDate = (m as any).startTime;
      }
    })
    this.data = data;
    this.uploading = false;
    this.data.groutingInfo.map(g => {
      if (!g.uploading) {
        this.uploading = true;
      }
    });
    this.formInit(this.data);
  }

  /**
   * *编辑/添加
   */
  async onEdit(state: string, modification = false) {
    const project = await this.getPorject();
    if (!modification) {
      /** 复制 */
      if (state === 'copy') {
        const data = copyAny(this.data);
        data.id = null;
        data.tensionDate = null;
        data.castingDate = null;
        data.template = false;
        delete data.mixingInfo;
        for (const g of data.groutingInfo) {
          g.state = 0;
          const groups: Array<GroutingHoleItem> = [];
          for (const item of g.groups) {
            // tslint:disable-next-line:max-line-length
            groups.push({ ...copyAny(groutingHoleItemInit), direction: item.direction, setGroutingPressure: item.setGroutingPressure });
          }
          g.groups = groups;
          console.log(g);
        }
        console.log(data);

        this.data = data;
        /** 添加 */
      } else if (state === 'add') {
        this.data = {...copyAny(groutingTaskInit), project: this.menuDom.projectId};
      }
      const other = this.projectAddOther(project);
      if (other) {
        this.otherUnDel = other.unDel;
        this.data.otherInfo = other.other;
      }
    } else {
      this.formData.controls.name.updateValueAndValidity();
    }
    console.log('编辑', state, this.data);
    this.formInit(this.data);
  }
  /** 处理项目其他数据添加 */
  projectAddOther(project: Project) {
    try {
      return upFormData[`${project.uploadingName}Other`](this.data.otherInfo, 'grouting');
    } catch (error) {
      return null;
    }
  }
  /**
   * *编辑完成
   */
  editOk(data) {
    console.log(data, this.menuDom.bridgeId);
    if (data && data.bridgeId && data.bridgeId !== this.menuDom.bridgeId) {
      this.menuDom.reset({
        projectId: data.projectId,
        componentName: data.componentName,
        bridgeId: data.bridgeId
      });
    } else {
      this.menuDom.selectBridge(this.menuDom.bridgeId);
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
      this.menuDom.getBridgeMenu();
    }
    this.deleteShow = false;
  }

  /** 上传 */
  async upload() {
    const proj = await this.odb.getOneAsync('project', (p: Project) => p.id === this.menuDom.projectId);
    const ups = [];
    console.log(this.data, proj);
    if (!proj.uploadingName) {
      this.message.warning(`未设置数据上传平台，请先设置好链接平台后重试！`);
      return;
    }
    let url = null;
    let data = null;
    switch (proj.uploadingName) {
      case 'weepal':
        break;
      case 'xalj':
        url = uploadingData.xalj(proj.uploadingLinkData);
        data = uploadingData.xaljData(this.data);
        console.log(data);
        // return;
        data.map(g => {
          this.http.post(url, { Data: g }).subscribe(r => {
          }, err => {
            const result: any = decodeURI(err.error.text);
            if (result.indexOf('压浆数据上传完成') !== -1) {
              ups.push({ success: true, name: g.holeNO });
              this.message.success(`${g.holeNO}上传成功`);
              if (data.length === ups.length) {
                this.updataDB(ups);
              }
            } else {
              ups.push({ success: false, name: g.holeNO });
              this.message.error(`${g.holeNO}上传失败 \n错误：${result}`);
              if (data.length === ups.length) {
                this.updataDB(ups);
              }
            }
          });
        });
        break;
      case 'hzxf':
        if (proj.uploadingLinkData.serviceData) {
          // http://47.98.39.16:8988/receive/zlyjaction!yajiangresult.action?TOKEN=
          // tslint:disable-next-line:max-line-length
          url = `${proj.uploadingLinkData.url}/zlyjaction!yajiangresult.action?TOKEN=${proj.uploadingLinkData.serviceData.TOKEN}&DATA=`;
          data = uploadingData.hzxfDataYJ(this.data, proj);
          data.map(g => {
            const urld = `${url}${encodeURI(JSON.stringify(g))}`
            console.log(urld);
            this.http.post1(urld).subscribe(r => {
              console.log(r);
              if ('CODE' in r && r.CODE !== 1) {
                ups.push({ success: true, name: g.STEELBEAMNO });
                this.message.success(`${g.STEELBEAMNO}上传成功`);
              } else {
                ups.push({ success: false, name: g.STEELBEAMNO });
                this.message.error(`${g.STEELBEAMNO}上传失败 \n错误：${JSON.stringify(r)}`);
              }
              if (data.length === ups.length) {
                this.updataDB(ups);
              }
            }, err => {
              ups.push({ success: false, name: g.STEELBEAMNO });
              this.message.error('上传错误！！！');
              if (data.length === ups.length) {
                this.updataDB(ups);
              }
            });
          });
        } else {
          console.log(proj);
          this.message.warning(`数据平台链接有误，请先正确链接平台后重试！`);
          return;
        }
        break;
      default:
        break;
    }
  }
  updataDB(ups) {
    const upstate = false;
    if (ups.length > 0) {
      this.data.groutingInfo.map(hg => {
        const up = ups.filter(f => f.name === hg.name);
        if (up.length > 0 && up[0].success) {
          hg.uploading = true;
          console.log('更新数据', hg.name);
        }
      });
      if (upstate) {
        this.odb.updateAsync('grouting', this.data, (o: any) => this.updateFilterFun(o, this.data), true);
      }
    }
  }
}
