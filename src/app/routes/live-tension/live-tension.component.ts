import { Component, OnInit, OnDestroy, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { tensionAlarmStr } from 'src/app/models/liveTension';
import { TensionTask, TensionHoleTask, TensionHoleInfo, TensionRecord, RecordCompute } from 'src/app/models/tension';
import { holeNameShow, getModeStr, recordCompute, HMIstage } from 'src/app/Function/tension';
import { TensionDevice } from 'src/app/models/jack';
import { PLCService } from 'src/app/services/plc.service';
import { tensionBase } from 'src/app/models/tensionBase';
import { AppService } from 'src/app/services/app.service';
import { NgxElectronModule, ElectronService } from 'ngx-electron';
import { interval } from 'rxjs/internal/observable/interval';
import { map } from 'rxjs/operators';
import { Subscription, Observable } from 'rxjs';
import { FC } from 'src/app/models/socketTCP';
import { PLC_D } from 'src/app/models/IPCChannel';
import { NzMessageService } from 'ng-zorro-antd';
import { Store } from '@ngrx/store';
import { NgrxState } from 'src/app/ngrx/reducers';
import { TcpLive } from 'src/app/models/tensionLive';
import { sleep } from 'sleep-ts';

enum JackModeEnum {
  '4顶两端' = 42,
  '4顶单端' = 41,
  'A1|A2单端' = 21,
  'A1|A2两端' = 23,
  'B1|B2两端' = 24,
  'A1|B1单端' = 22,
  'A1|B1两端' = 25,
  'A1单端' = 11,
  'B1单端' = 12
}
@Component({
  selector: 'app-live-tension',
  templateUrl: './live-tension.component.html',
  styleUrls: ['./live-tension.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LiveTensionComponent implements OnInit, OnDestroy {
  strMode = ['A1', 'A2', 'B1', 'B2'];
  /** 报警字符数据 */
  alarm = tensionAlarmStr;
  /** 实时主机 */
  liveData = {
    A1: [1, 2, 3, 4, 5, 6],
    A2: [1, 2, 3, 4, 5, 6],
    B1: [1, 2, 3, 4, 5, 6],
    B2: [1, 2, 3, 4, 5, 6],
    stage: null,
    state: false,
    t: null,
    sratrTime: null,
    /** 开始张拉 */
    run: false,
    /** 张拉完成 */
    success: false,
    /** 开始卸荷 */
    unState: false

  }
  nzHref: string;
  /** 张拉数据 */
  data: TensionTask = tensionBase;
  /** 张拉第几条 */
  holeIndex = 0;
  /** 记录数据 */
  record: TensionRecord;
  /** 张拉结果计算数据 */
  recordCalculate: RecordCompute;
  /** 张拉孔名称数据组 */
  holeNames: any;
  /** 使用顶名称组 */
  jackModeStr: string;
  /** 数据采集定时器 */
  liveT = null;
  // tcpLink$ = new Observable<TcpLive>();
  /** plc监听 */
  plcsub: Subscription;
  sendState = false;
  /** 张拉完成 */
  tensionSuccess = false;
  /** 选择张拉孔数据 */
  oldHoleIndex: number;
  /** 下载进度 */
  upProgress = 0;
  /** 下载状态 */
  downState = false;
  groupNames: { name: string; state: number; uploading: boolean; }[];
  holeData: TensionHoleInfo;
  task: TensionHoleTask;
  // get holeData(): TensionHoleInfo {
  //   return this.data.tensionHoleInfos[this.holeIndex];
  // }
  // get task(): TensionHoleTask {
  //   return this.holeData.tasks[0];
  // }
  // get tensionKn(): number {
  //   return this.task.tensionKn;
  // }
  // get twice(): boolean {
  //   return this.task.twice;
  // }
  // get superState(): boolean {
  //   return this.task.super;
  // }
  // get mend(): boolean {
  //   return this.task.mend;
  // }
  // get device(): TensionDevice {
  //   return this.task.device;
  // }
  /** plc状态 */
  get plcState(): boolean {
    return this.PLCS.plcState;
  }

  constructor(
    public PLCS: PLCService,
    public appS: AppService,
    private e: ElectronService,
    private cdr: ChangeDetectorRef,
    private message: NzMessageService,
    // private store$: Store<NgrxState>,
  ) { }

  ngOnInit() {
    this.PLCS.noOut = true;
    console.log(this.PLCS.data, this.PLCS.data);
    // this.tcpLink$ = this.store$.select(state => state.tcpLive);

    if (this.PLCS.data) {
      this.data = this.PLCS.data;
      this.oldHoleIndex = this.holeIndex;
      this.setTask();
    } else {
      this.holeIndex = 0;
      this.oldHoleIndex = 0;
      this.data = tensionBase;
      this.strMode = getModeStr(this.task.mode);
      // this.createRecord()
      this.record = this.data.tensionHoleInfos[0].tasks[0].record;
      this.getRecordCalculate();
      this.holeNames = holeNameShow(this.holeData.name, this.task.mode);
      this.jackModeStr = JackModeEnum[this.task.mode];
    }
    this.runLive();
  }

  setTask() {
    this.holeData = this.data.tensionHoleInfos[this.holeIndex];
    this.task = this.holeData.tasks[0];
    if (this.data) {
      this.strMode = getModeStr(this.task.mode);
    }
    console.log(this.task.record);

    if (this.task.record && this.task.record.groups.length > 0) {
      this.record = this.task.record[0];
    } else {
      this.createRecord()
    }
    console.log(this.record);
    this.getRecordCalculate();
    this.holeNames = holeNameShow(this.holeData.name, this.task.mode);
    this.jackModeStr = JackModeEnum[this.task.mode];
  }

  runLive() {
    if (this.plcState) {
      this.getLiveData();
    }
    this.plcsub = this.PLCS.LinkError$.subscribe((state) => {
      // console.log(state);
      if (state) {
        this.getLiveData();
      } else {
        this.stopLive();
      }
      this.cdr.detectChanges();
    });
  }

  ngOnDestroy() {
    this.PLCS.noOut = false;
    if (this.plcsub) {
      this.plcsub.unsubscribe();
      this.plcsub = null;
    }
    this.stop();
  }

  /** 创建记录基本数据 */
  createRecord() {
    const jn: any = {};
    const ds: any = {};
    this.strMode.map(key => {
      jn[key] = {
        // mpa: Array(this.task.stage.time.length).map(_ => 0),
        mpa: [],
        mm: Array(this.task.stage.time.length).map(_ => 0),
        initMpa: 0,
        initMm: 0
      };
      ds[key] = {
        mpa: [],
        mm: [],
      }
    });
    this.record = {
      state: 0,
      groups: [{

        knPercentage: this.task.stage.knPercentage,
        msg: this.task.stage.msg,
        time: this.task.stage.time,
        uploadPercentage: this.task.stage.uploadPercentage,
        uploadDelay: this.task.stage.uploadDelay,
        ...jn,
        datas: {
          hz: 1,
          ...ds
        }
      }]
    };
  }
  /** 计算数据 */
  getRecordCalculate(length = null) {
    this.recordCalculate = recordCompute({...this.task, record: this.record}, length);
  }
  /** 选择滚动显示 */
  switchItem(event) {
    this.nzHref = event.nzHref;
  }
  /** 监控 */
  async getLiveData() {
    if (this.sendState && !this.downState) {
      return;
    }
    if (!this.plcState) {
      console.log('请链接设备');
      this.cdr.detectChanges();
      return;
    }
    const callpack = 'liveTension';
    this.sendState = true;
    try {
      await this.PLCS.ipc({request: FC.FC3, address: PLC_D(0), value: 52, callpack}).then((data: any) => {

        // this.e.ipcRenderer.once(callpack, (e, data) => {
          const r = data.data.data;
          console.log('liveTension', r);
          this.liveData.A1 = r.float.slice(0, 6)
          this.liveData.A2 = r.float.slice(6, 12)
          this.liveData.B1 = r.float.slice(12, 18)
          this.liveData.B2 = r.float.slice(18, 24)
          const state = this.liveData[this.strMode[0]][5];
          if (this.liveData.run) {
            this.showCSV();
          }
          if (state === 2 && !this.liveData.run) {
            this.liveData.run = true;
            this.liveData.stage = 0;
            this.saveCSV();
          }
          if (state === 6) {
            this.liveData.stage = 1;
          }
          if (state === 10) {
            this.liveData.stage = 2;
          }
          if (state === 14) {
            this.liveData.stage = 3;
          }
          if (state === 18) {
            this.liveData.stage = 4;
          }
          if (state === 22) {
            this.liveData.stage = 5;
          }
          if (state === 26) {
            this.liveData.stage = 6;
          }
          /** 张拉完成 */
          if ((state === 9 && this.task.twice)
            // tslint:disable-next-line:max-line-length
            || ((state === 13 || state === 17 || state === 21 || state === 25 || state === 29) && this.liveData.stage === this.task.stage.time.length -1)
          ) {
            this.liveData.success = true;
          }
          /** 卸荷 */
          if(state === 30 && !this.liveData.unState) {
            this.liveData.unState = true;
          }
          if (this.liveData.unState) {
            this.upload();
          }
          if (state === 33) {
            this.liveData.unState = false;
          }
          if (state === 35) {
            this.liveData = {
              A1: [1, 2, 3, 4, 5, 6],
              A2: [1, 2, 3, 4, 5, 6],
              B1: [1, 2, 3, 4, 5, 6],
              B2: [1, 2, 3, 4, 5, 6],
              stage: null,
              state: false,
              t: null,
              sratrTime: null,
              /** 开始张拉 */
              run: false,
              /** 张拉完成 */
              success: false,
              /** 开始卸荷 */
              unState: false

            }
            this.saveData();
          }
        // })
      });
    } catch (error) {
      console.error('数据转换有误！！');
    } finally {
    }
    this.sendState = false;
    await sleep(1000);
    this.cdr.detectChanges();
    this.getLiveData();
  }
  test() {
    if (this.liveData.state) {
      this.stop();
    } else {
      this.liveData.state = true;
      this.appS.taskLiveState = true;
    }
    if (!this.liveData.t) {
      this.liveData.t = setInterval(() => {
        if (this.liveData.state) {
          this.liveCsv();
        } else {
          clearInterval(this.liveData.t);
          this.liveData.t = null;
        }
      }, 1000)
      if (this.liveData.stage === null) {
        this.liveData.stage = 0;
        this.liveData.sratrTime = new Date().getTime();
      }
    }
  }
  liveCsv() {
    const length = this.record.groups[0].datas[this.strMode[0]].mpa.length;
    this.liveData.stage = Math.floor(length / 20);
    if (this.liveData.stage === this.task.stage.msg.length) {
      clearInterval(this.liveData.t);
      this.liveData.t = null;
      this.liveData.state = false;
      this.appS.taskLiveState = false;
      return;
    }
    this.strMode.map(key => {
      const s = Math.random() > 0.5 ? 1 : -1;
      const mpa = Number((length + s).toFixed(2));
      const mm = Number((length + s * 10).toFixed(2));
      this.record.groups[0].datas[key].mpa.push(mpa);
      this.record.groups[0].datas[key].mm.push(mm);
      this.record.groups[0][key].mpa[this.liveData.stage] = mpa;
      this.record.groups[0][key].mm[this.liveData.stage] = mm;
    });
    if (this.liveData.stage >= 1) {
      this.getRecordCalculate(this.liveData.stage);
    }
    this.cdr.detectChanges();
  }
  /** 实时曲线：压力 */
  showCSV() {
    this.strMode.map(key => {
      const mpa = this.liveData[key][0];
      const mm = this.liveData[key][3];
      const length = this.record.groups[0].datas[key].mpa.length;
      if (!this.liveData.success) {
        this.record.groups[0].datas[key].mpa[length] = (mpa);
        this.record.groups[0].datas[key].mm[length] = (mm);
      }

      this.record.groups[0][key].mpa[this.liveData.stage] = mpa;
      this.record.groups[0][key].mm[this.liveData.stage] = mm;
    });
  }
  /** 保存曲线 */
  saveCSV() {
    // 0 A1张拉压力R
    // 1 A1张拉力R
    // 2 A1回程压力R
    // 3 A1位移值R
    // 4 A1绝对位移
    // 5 A1工作状态R
    this.strMode.map(key => {
      const mpa = this.liveData[key][0];
      const mm = this.liveData[key][3];
      this.record.groups[0].datas[key].mpa.push(mpa);
      this.record.groups[0].datas[key].mm.push(mm);
    });
    this.cdr.detectChanges();
    setTimeout(() => {
      this.saveCSV();
    }, 1000);
  }
  /** 卸荷 */
  upload() {
    this.strMode.map(key => {
      const mpa = this.liveData[key][0];
      const mm = this.liveData[key][3];
      this.record.groups[0][key].initMpa = mpa;
      this.record.groups[0][key].initMm = mm;
    });
  }
  /** 保存数据 */
  saveData() {
    console.log(this.record);
    localStorage.setItem('tensionSave', JSON.stringify(this.record));
  }
  /** 停止 */
  stop() {
    this.liveData.state = false;
    this.appS.taskLiveState = false;
    this.stopLive();
  }
  stopLive() {
    if (this.liveData.t) {
      clearInterval(this.liveData.t);
      this.liveData.t = null;
    }
    if (this.liveT) {
      clearInterval(this.liveT);
      this.liveT = null;
    }

  }
  /** 切换孔号 */
  switchHole(i: number) {
    this.groupNames = this.data.tensionHoleInfos.map(m => {
      return { name: m.name, state: m.state, uploading: m.uploading}
    });
    this.holeIndex = i;
    this.tensionSuccess = true;
    this.strMode = getModeStr(this.task.mode);
    console.log(this.holeIndex, this.holeData);
    this.setTask();
    this.cdr.detectChanges();
  }
  /** 确定数据 */
  selectOk() {
    this.oldHoleIndex = this.holeIndex;
    this.downHMI();
    this.tensionSuccess = false;
    this.cdr.detectChanges();
  }
  cancel() {
    this.holeIndex = this.oldHoleIndex;
    this.strMode = getModeStr(this.task.mode);
    this.tensionSuccess = false;
    this.cdr.detectChanges();
  }
  /** 下载张拉数据 */
  async downHMI() {
    if (this.downState) {
      return;
    }
    this.downState = true;
    this.upProgress = 0;
    console.log('下载的数据', this.data.tensionHoleInfos[this.holeIndex]);
    const HMIData = HMIstage(this.data, this.holeIndex);
    console.log(HMIData);
    const cmdarrs = [
      { request: FC.FC16_int16, address: PLC_D(2000), value: HMIData.unicode.slice(0, 40)},
      { request: FC.FC16_int16, address: PLC_D(2040), value: HMIData.unicode.slice(40)},
      { request: FC.FC16_float, address: PLC_D(2082), value: HMIData.d2082},
      { request: FC.FC16_float, address: PLC_D(2108), value: HMIData.percentage},
      { request: FC.FC16_float, address: PLC_D(2124), value: HMIData.A1},
      { request: FC.FC16_float, address: PLC_D(2198), value: HMIData.A2},
      { request: FC.FC16_float, address: PLC_D(2272), value: HMIData.B1},
      { request: FC.FC16_float, address: PLC_D(2346), value: HMIData.B2},
      { request: FC.FC16_float, address: PLC_D(2460), value: HMIData.reboundWord},
    ];

    // tslint:disable-next-line:prefer-for-of
    for (let index = 0; index < cmdarrs.length; index++) {
      const item = cmdarrs[index]
      await this.PLCS.ipc({
        request: item.request,
        address: item.address,
        value: item.value,
        callpack: 'tensionup'
      }).then(r => console.log(r));
      if (!this.next()) {
        return;
      }
      console.log('456');
    }
    console.log('123');

    this.tensionSuccess = false;
    this.downState = false;
    this.getLiveData();
  }
  /** 下载下一组数据 */
  async next() {
    this.upProgress++;
    this.cdr.detectChanges();
    await sleep(5);
    return this.downState;
  }
}
