import { Component, OnInit, OnDestroy } from '@angular/core';
import { DbService } from 'src/app/services/db.service';
import { GroutingTask, MixingInfo, GroutingHoleItem, GroutingInfo } from 'src/app/models/grouting';
import { GroutingService } from 'src/app/services/grouting.service';
import { Subscription } from 'rxjs';
import { PLC_D, PLC_M } from 'src/app/models/IPCChannel';
import { copyAny } from 'src/app/models/base';
import { ElectronService } from 'ngx-electron';
import { NzMessageService } from 'ng-zorro-antd';

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
    date: [],
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
  styleUrls: ['./live-grouting.component.less']
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
    startTime: null,
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
    holeName: ''
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
  liveT;
  /** 模拟数据T */
  tt;
  /** 添加数据判断 */
  addFilterFun = (o1: any, o2: any) => o1.name === o2.name
    && o1.component === o2.component && o1.project === o2.project;
  /** 修改数据判断 */
  updateFilterFun = (o1: GroutingTask, o2: GroutingTask) => o1.name === o2.name
    && o1.component === o2.component && o1.project === o2.project && o1.id !== o2.id;


  constructor(
    public GPLCS: GroutingService,
    private odb: DbService,
    private e: ElectronService,
    private message: NzMessageService,
  ) { }

  ngOnInit() {


  }
  livePLC() {
    if (!this.plcsub) {
      this.plcsub = this.GPLCS.plcSubject.subscribe((data: any) => {
        if (this.monitoringMsg.start) {
          console.warn(data.data[0]);
          if (data.data[0]) {
            console.error(data);
          }
          if (data.state) {
            this.monitoringMsg.color = '#20a162';
            if (data.data[0] && !this.monitoringMsg.save) {
              this.groutingSave();
              this.monitoringMsg.save = true;
              this.monitoringMsg.start = false;
              this.groutingHoleItem.endDate = new Date();
              if (this.tt) {
                clearInterval(this.tt);
                this.tt = null;
              }
            } else if (!data.data[0] && this.monitoringMsg.save) {
              this.monitoringMsg.save = false;
            }
          } else {
            this.monitoringMsg.color = '#d42517';
          }
        }
        if (!this.liveT) {
          this.liveData();
        }
      });
    }
    if (!this.plcsub1) {
      this.plcsub1 = this.GPLCS.plcSubject1.subscribe((data: any) => {
        // console.warn('1111', data, data.data[0], !this.monitoringMsg.start);
        if (data.data[0] && !this.monitoringMsg.start) {
          if (!this.tt) {
            this.groutingHoleItem = copyAny(groutingHoleItemBase);
            /** 压浆开始 */
            this.liveSvg();
            this.groutingHoleItem.startDate = new Date();
          }
          this.monitoringMsg.start = true;
        }
      });
    }
  }
  ngOnDestroy() {
    console.log('退出');
    if (this.plcsub) {
      this.plcsub.unsubscribe();
    }
    if (this.plcsub1) {
      this.plcsub1.unsubscribe();
    }
    if (this.liveT) {
      clearInterval(this.liveT);
    }
    if (this.tt) {
      clearInterval(this.tt);
    }
  }
  /** 实时数据 */
  liveData() {
    console.log('实时数据');

    this.liveT = setTimeout(async () => {
      console.log('132456789实时数据');
      const arrs = [
        { channel: 'groutingF03ASCII', address: PLC_D(220), value: 4, outKey: 'out0' },
        { channel: 'groutingF03ASCII', address: PLC_D(152), value: 2, outKey: 'out1' },
        { address: PLC_D(200), value: 6, outKey: 'out2' },
        { address: PLC_D(72), value: 1, outKey: 'out3' },
        { address: PLC_D(52), value: 2, outKey: 'out4' },
        { address: PLC_D(120), value: 1, outKey: 'out5' },
        { channel: 'groutingF01', address: PLC_M(30), value: 8, outKey: 'out6' },
      ];
      const backData: any = {};
      let i = 0;
      for (const item of arrs) {
        // console.log('保存数据', item);
        await new Promise((resolve, reject) => {
          this.e.ipcRenderer.send(item.channel || 'groutingF03', { address: item.address, value: item.value, channel: item.outKey });
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
      console.log(`实时返回的结果`, backData.out6.data);
      if (i !== arrs.length) {
        clearInterval(this.liveT);
        this.liveT = null;
        console.error('实时数据错误');
        return;
      }
      try {
        this.now = {
          name: backData.out0.str.replace(/\0/g, ''),
          holeName: backData.out1.str.replace(/\0/g, '')
        };
        this.mixingData.dosage = backData.out2.float.map(m => Number(m.toFixed(2)));
        let count = 0;
        this.mixingData.dosage.map((item, i) => {
          if (i > 0) {
            count += item || 0;
          }
        });
        this.mixingData.waterBinderRatio = Number((this.mixingData.dosage[0] / count).toFixed(2));
        this.mixingData.mixingTime = backData.out3.uint16[0];
        /** 搅拌开始 */
        if (!this.mixingDataNow.state && backData.out6.data[0]) {
          this.mixingDataNow.time = this.mixingData.mixingTime;
          this.mixingDataNow.state = true;
          this.mixingDataNow.date = new Date();
        }
        /** 搅拌完成 */
        if (this.mixingDataNow.state && !this.mixingDataNow.save && backData.out6.data[6]) {
          this.mixingDataNow.save = true;
        }
        if (this.mixingDataNow.state && !backData.out6.data[6] && !backData.out6.data[0]) {
          if (this.mixingDataNow.save) {
            const mixing: MixingInfo = {
              /** 用量 */
              dosage: this.mixingData.dosage,
              /** 开始时间 */
              startTime: this.mixingDataNow.date,
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
        this.liveData();
      } catch (error) {

      }
    }, 100);
  }
  /** 确认模板监控 */
  async selectGroutingTemp(id) {

    this.templateData = await this.odb.getOneAsync('grouting', (g: GroutingTask) => g.id === id);
    if (this.templateData) {
      this.livePLC();
    }
    this.groutingTemplateShow = false;
    console.log(id);
  }
  liveSvg() {
    console.error('svg');

    this.tt = setInterval(() => {
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
      this.groutingHoleItem.processDatas.date.push(new Date().getTime());
      this.groutingHoleItem.processDatas.intoPulpPressure.push(this.groutingHoleItem.intoPulpPressure);
    }, 1000);
  }

  /** 压浆完成保存 */
  async groutingSave() {
    const arrs = [
      { channel: 'groutingF03ASCII', address: PLC_D(270), value: 22, outKey: 'out1' },
    ];
    const backData: any = {};
    for (const item of arrs) {
      // console.log('保存数据', item);
      await new Promise((resolve, reject) => {
        this.e.ipcRenderer.send(item.channel || 'groutingF03', { address: item.address, value: item.value, channel: item.outKey });
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
  /** 搅拌数据保存 */
  mixingSave() {

  }
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
      gdata.tensinDate = null;
      gdata.castingDate = null;
      gdata.template = false;
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
