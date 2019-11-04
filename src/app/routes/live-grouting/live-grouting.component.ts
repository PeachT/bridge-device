import { Component, OnInit, OnDestroy, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { DbService } from 'src/app/services/db.service';
import { GroutingTask, MixingInfo, GroutingHoleItem, GroutingInfo } from 'src/app/models/grouting';
import { GroutingService } from 'src/app/services/grouting.service';
import { Subscription } from 'rxjs';
import { PLC_D, PLC_M } from 'src/app/models/IPCChannel';
import { copyAny } from 'src/app/models/base';
import { ElectronService } from 'ngx-electron';
import { NzMessageService } from 'ng-zorro-antd';
import { AppService } from 'src/app/services/app.service';
import { waterBinderRatio, getDatetimeS } from 'src/app/Function/unit';
import { PLCService } from 'src/app/services/plc.service';
import { FC } from 'src/app/models/socketTCP';

const groutingHoleItemBase: GroutingHoleItem = {
  /** 压浆方向 */
  direction: null,
  /** 设置压浆压力 */
  setGroutingPressure: null,
  /** 环境温度 */
  envTemperature: null,
  /** 浆液温度 */
  slurryTemperature: null,
  /** 开始时间 */
  startDate: null,
  /** 完成时间 */
  endDate: null,
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
  /** 压浆过程数据 */
  processDatas: {
    hz: 1,
    intoPulpPressure: [],
    outPulpPressure: [],
    intoPulpvolume: [],
    outPulpvolume: [],
  },
  /** 真空过程数据 */
  vacuumPumpProcessDatas: null,
  /** 其他数据信息 */
};
@Component({
  selector: 'app-live-grouting',
  templateUrl: './live-grouting.component.html',
  styleUrls: ['./live-grouting.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LiveGroutingComponent implements OnInit, OnDestroy {

  /** 选择模板 */
  groutingTemplateShow = false;
  /** 模板数据 */
  templateData: GroutingTask = null;
  /** 搅拌数据 */
  mixingData: MixingInfo = {
    /** 用量 */
    dosage: [0, 0, 0, 0, 0, 0, 0],
    /** 开始时间 */
    startDate: null,
    /** 完成时间 */
    endDate: null,
    /** 搅拌时间 */
    mixingTime: null,
    /** 泌水率 */
    bleedingRate: null,
    /** 流动度 */
    fluidity: null,
    /** 黏稠度 */
    viscosity: null,
    /** 水胶比 */
    waterBinderRatio: null,
    /** 水温 */
    waterTemperature: null,
    /** 环境温度 */
    envTemperature: null,
  };
  mixingDataNow = {
    state: false,
    time: 0,
    date: null,
    save: false
  };

  /** 压浆数据 */
  groutingHoleItem: GroutingHoleItem = copyAny(groutingHoleItemBase);
  /** 正在压浆数据 */
  now = {
    name: '',
    holeName: '',
    dosage: [null, null, null, null, null, null],
    waterBinderRatio: null
  };
  /** 监控压浆 */
  plcsub: Subscription;
  plcsub1: Subscription;
  monitoringMsg = {
    start: false,
    state: false,
    color: '#d42517',
    save: false
  };
  /** 实时数据 */
  liveT: any;
  liveDelay = 100;
  /** 模拟数据T */
  svgT: any;
  /** 停止监控 */
  stop = false;
  /** plc状态 */
  get plcState(): boolean {
    return this.PLCS.socketInfo.state === 'success';
  }
  /** 添加数据判断 */
  addFilterFun = (o1: any, o2: any) => o1.name === o2.name
    && o1.component === o2.component && o1.project === o2.project;
  /** 修改数据判断 */
  updateFilterFun = (o1: GroutingTask, o2: GroutingTask) => o1.name === o2.name
    && o1.component === o2.component && o1.project === o2.project && o1.id !== o2.id;

  constructor(
    public appS: AppService,
    public PLCS: PLCService,
    private odb: DbService,
    private e: ElectronService,
    private message: NzMessageService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    this.PLCS.noOut = true;
  }
  ngOnDestroy() {
    this.PLCS.noOut = false;
    if (this.plcsub) {
      this.plcsub.unsubscribe();
      this.plcsub = null;
    }
    this.exit();
  }
  exit() {
    console.log('退出');
    this.appS.taskLiveState = false;
    if (this.liveT) {
      clearInterval(this.liveT);
      this.liveT = null;
    }
    if (this.svgT) {
      clearInterval(this.svgT);
      this.svgT = null;
    }

  }
  /** 监控启停 */
  operatorLive() {
    this.stop = !this.stop;
    if (this.stop) {
      this.appS.taskLiveState = false;
      this.exit();
    } else {
      if (this.liveT) {
        clearInterval(this.liveT);
      };
    }
  }
  /** 实时数据 */
  liveData() {
    if (this.liveT) {
      return;
    }
    this.liveT = setTimeout(async () => {
      if (this.plcState) {
        const arrs = [
          // 完成标志
          { channel: FC.F01, address: PLC_M(46), value: 1, outKey: 'out8' },
          // 开始标准
          { channel: FC.F01, address: PLC_M(50), value: 1, outKey: 'out9' },
          // 梁号
          { channel: FC.F03ASCII, address: PLC_D(220), value: 4, outKey: 'out0' },
          // 孔号
          { channel: FC.F03ASCII, address: PLC_D(152), value: 2, outKey: 'out1' },
          // 实时数据
          { channel: FC.F03, address: PLC_D(200), value: 6, outKey: 'out2' },
          { channel: FC.F03, address: PLC_D(72), value: 1, outKey: 'out3' },
          { channel: FC.F03, address: PLC_D(52), value: 2, outKey: 'out4' },
          { channel: FC.F03, address: PLC_D(120), value: 1, outKey: 'out5' },
          { channel: FC.F01, address: PLC_M(30), value: 8, outKey: 'out6' },
          { channel: FC.F03, address: PLC_D(520), value: 6, outKey: 'out7' },
        ];
        const backData: any = {};
        let i = 0;
        for (const item of arrs) {
          // console.log('保存数据', item);
          await new Promise((resolve, reject) => {
            this.e.ipcRenderer.send(item.channel, { address: item.address, value: item.value, channel: item.outKey });
            const t = setTimeout(() => {
              clearInterval(this.liveT);
              this.liveT = null;
              this.e.ipcRenderer.removeAllListeners(item.outKey);
              console.error('获取数据超时');
              return;
            }, 3000);
            this.e.ipcRenderer.once(item.outKey, (event, data) => {
              clearTimeout(t);
              i++;
              backData[item.outKey] = data;
              resolve(data);
            });
          });
        }
        if (i !== arrs.length) {
          clearInterval(this.liveT);
          this.liveT = null;
          console.error('实时数据错误');
          return;
        }
        this.groutingStart(backData.out9.data[0]);
        this.groutingSuccess(backData.out8.data[0]);
        const dosage = backData.out7.float.map(m => Number(m.toFixed(2)));
        this.now = {
          name: backData.out0.str.replace(/\0/g, ''),
          holeName: backData.out1.str.replace(/\0/g, ''),
          dosage,
          waterBinderRatio: waterBinderRatio(dosage)
        };
        this.mixingData.dosage = backData.out2.float.map(m => Number(m.toFixed(2)));
        this.mixingData.waterBinderRatio = waterBinderRatio(this.mixingData.dosage);
        this.mixingData.mixingTime = backData.out3.uint16[0];
        /** 搅拌开始 */
        if (!this.mixingDataNow.state && backData.out6.data[0]) {
          this.mixingDataNow.state = true;
          this.mixingDataNow.date = new Date();
        }
        /** 上料完成 */
        if (this.mixingDataNow.state && !this.mixingDataNow.save && backData.out6.data[6] && this.mixingData.mixingTime > 0) {
          this.mixingDataNow.time = this.mixingData.mixingTime;
          this.mixingDataNow.save = true;
        }
        /** 搅拌完成 */
        if (this.mixingDataNow.state && !backData.out6.data[6] && !backData.out6.data[0]) {
          if (this.mixingDataNow.save) {
            const mixing: MixingInfo = {
              /** 用量 */
              dosage: this.mixingData.dosage,
              /** 开始时间 */
              startDate: this.mixingDataNow.date,
              /** 完成时间 */
              endDate: new Date(),
              /** 搅拌时间 */
              mixingTime: this.mixingDataNow.time,
              /** 泌水率 */
              bleedingRate: null,
              /** 流动度 */
              fluidity: null,
              /** 黏稠度 */
              viscosity: null,
              /** 水胶比 */
              waterBinderRatio: this.mixingData.waterBinderRatio,
              /** 水温 */
              waterTemperature: null,
              /** 环境温度 */
              envTemperature: null,
            };
            console.error('搅拌完成', mixing);
            this.save(mixing, null);
          }
          this.mixingDataNow.state = false;
          this.mixingDataNow.save = false;
        }
        this.groutingHoleItem.intoPulpPressure = (backData.out4.float[0]).toFixed(2);
        this.groutingHoleItem.steadyTime = backData.out5.uint16[0];
        this.cdr.detectChanges();
      } else {
        console.error('请链接设备');
        this.cdr.detectChanges();
        clearInterval(this.liveT);
        this.liveT = null;
      }
    }, 100);
  }
  /** 压浆完成 */
  groutingSuccess(state) {
    if (state && !this.monitoringMsg.save) {
      this.groutingSave();
      this.monitoringMsg.save = true;
      this.monitoringMsg.start = false;
      this.groutingHoleItem.endDate = new Date();
    } else if (state && this.monitoringMsg.save) {
      this.monitoringMsg.save = false;
    }
  }
  /** 压浆开始 */
  groutingStart(state) {
    if (state && !this.monitoringMsg.start) {
      this.liveSvg();
      this.monitoringMsg.start = true;
    }
  }
  /** 确认模板监控 */
  async selectGroutingTemp(id) {
    this.templateData = await this.odb.getOneAsync('grouting', (g: GroutingTask) => g.id === id);
    if (this.templateData) {
      if ( this.plcState) {
        this.liveData();
      } else {
        if (!this.plcsub) {
          this.plcsub = this.PLCS.LinkError$.subscribe((state) => {
            if (state) {
              this.liveData();
            } else {
              if (this.liveT) {
                clearInterval(this.liveT);
                this.liveT = null;
              }
              if (this.svgT) {
                clearInterval(this.svgT);
                this.svgT = null;
              }
            }
          });
        }
      }
    }
    this.groutingTemplateShow = false;
    console.log(id);
  }
  /** 压浆曲线监控 */
  liveSvg() {
    console.error('svg');
    if (this.svgT) {
      return;
    } else {
      this.groutingHoleItem = copyAny(groutingHoleItemBase);
      this.groutingHoleItem.startDate = new Date();
      this.svgT = setInterval(() => {
        // const pressure = Math.random() * 2;
        // const pulpvolume = Math.random() * 100;
        // this.groutingHoleItem.processDatas.date.push(new Date().getTime());
        // this.groutingHoleItem.processDatas.intoPulpPressure.push(Number((pressure - Math.random()).toFixed(2)));
        // this.groutingHoleItem.processDatas.outPulpPressure.push(Number((pressure - Math.random()).toFixed(2)));
        // this.groutingHoleItem.processDatas.intoPulpvolume.push(Number((pulpvolume - Math.random() * 10).toFixed(2)));
        // this.groutingHoleItem.processDatas.outPulpvolume.push(Number((pulpvolume - Math.random() * 10).toFixed(2)));
        // if (this.groutingHoleItem.processDatas.date.length > 100) {
        //   clearInterval(this.tt)
        // }
        // console.log(this.groutingHoleItem);
        // this.groutingHoleItem.processDatas.date.push(new Date().getTime());
        this.groutingHoleItem.processDatas.intoPulpPressure.push(this.groutingHoleItem.intoPulpPressure);
        if (this.stop && this.svgT) {
          clearInterval(this.svgT);
          this.svgT = null;
        }
        this.cdr.detectChanges();
      }, 1000);
    }
  }

  /** 压浆完成保存 */
  async groutingSave() {
    const arrs = [
      { address: PLC_D(270), value: 22, outKey: 'out1' },
    ];
    const backData: any = {};
    for (const item of arrs) {
      // console.log('保存数据', item);
      await new Promise((resolve, reject) => {
        this.e.ipcRenderer.send('groutingF03', { address: item.address, value: item.value, channel: item.outKey });
        const t = setTimeout(() => {
          this.e.ipcRenderer.removeAllListeners(item.outKey);
          console.error('获取数据超时');
          return;
        }, 3000);
        this.e.ipcRenderer.once(item.outKey, (event, data) => {
          console.log(item, `设置返回的结果`, data);
          clearTimeout(t);
          backData[item.outKey] = data;
          resolve(data);
        });
      });
    }
    console.error('压浆保存数据', backData);
    const groutingHoleItem: GroutingHoleItem = {
      ...this.templateData.groutingInfo[0].groups[0],
      /** 压浆方向 */
      // direction: this.templateData.groutingInfo[0].groups[0].direction,
      // /** 设置压浆压力 */
      // setGroutingPressure: this.templateData.groutingInfo[0].groups[0].setGroutingPressure,
      /** 环境温度 */
      envTemperature: null,
      /** 浆液温度 */
      slurryTemperature: null,
      /** 开始时间 */
      startDate: this.groutingHoleItem.startDate,
      /** 完成时间 */
      endDate: this.groutingHoleItem.endDate,
      /** 进浆压力 */
      intoPulpPressure: (backData.out1.float[3]).toFixed(2),
      /** 回浆压力 */
      outPulpPressure: null,
      /** 进浆量 (L) */
      intoPulpvolume: null,
      /** 回浆量 (L) */
      outPulpvolume: null,
      /** 真空泵压力 */
      vacuumPumpPressure: null,
      /** 稳压时间 */
      steadyTime: backData.out1.uint16[12],
      /** 通过情况 */
      passMsg: null,
      /** 冒浆情况 */
      slurryEmittingMsg: null,
      /** 其他说明 */
      remarks: null,
      /** 压浆过程数据 */
      processDatas: this.groutingHoleItem.processDatas,
      /** 真空过程数据 */
      vacuumPumpProcessDatas: null,
      /** 其他数据信息 */
    };
    this.save(null, groutingHoleItem);
  }
  /** 数据保存 */
  async save(mixing: MixingInfo, groutingHoleItem: GroutingHoleItem) {
    if (groutingHoleItem) {
      groutingHoleItem.direction = this.templateData.groutingInfo[0].groups[0].direction;
      groutingHoleItem.setGroutingPressure = this.templateData.groutingInfo[0].groups[0].setGroutingPressure;
    }
    const getData = await this.odb.getOneAsync('grouting', (g: GroutingTask) =>
      g.name === this.now.name
      && g.project === this.templateData.project
      && g.component === this.templateData.component);
    console.log('save', getData);
    /** 添加 */
    if (!getData) {
      const gdata: GroutingTask = copyAny(this.templateData);
      delete gdata.id;
      gdata.name = this.now.name;
      gdata.tensionDate = null;
      gdata.castingDate = null;
      gdata.template = false;
      gdata.operator = this.appS.userInfo.name;
      gdata.mixingInfo = [];
      gdata.groutingInfo = [];
      if (mixing) {
        gdata.mixingInfo.push(mixing);
      }
      if (groutingHoleItem) {
        // tslint:disable-next-line:max-line-length
        gdata.groutingInfo.push({ ...this.templateData.groutingInfo[0], name: this.now.holeName, uploading: false, state: 2, groups: [groutingHoleItem] });
      }
      const saveback = await this.odb.addAsync('grouting', gdata, (g: GroutingTask) =>
        g.name === gdata.name
        && g.project === gdata.project
        && g.component === gdata.component);
      if (saveback.success) {
        this.message.success('添加成功');
      }
    } else {
      if (mixing) {
        getData.mixingInfo.push(mixing);
      }
      if (groutingHoleItem) {
        let index = null;
        getData.groutingInfo.filter((g, i) => {
          if (g.name === this.now.holeName) {
            index = i;
          }
        });
        if (index !== null) {
          getData.groutingInfo[index].uploading = false;
          getData.groutingInfo[index].groups.push(groutingHoleItem);
        } else {
          // tslint:disable-next-line:max-line-length
          getData.groutingInfo.push({ ...this.templateData.groutingInfo[0], name: this.now.holeName, uploading: false, state: 2, groups: [groutingHoleItem] });
        }
      }
      console.log('save3', getData);
      const saveback = await this.odb.updateAsync('grouting', getData, (o1) => this.updateFilterFun(o1, getData));
      if (saveback.success) {
        // this.taskMenuDom.res({ component: this.data.component, selectBridge: saveback.id });
        this.message.success(`${this.now.name}/${this.now.holeName}-保存完成`);
      }
    }
  }
}
