import { Component, OnInit, OnDestroy, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { tensionAlarmStr } from 'src/app/models/liveTension';
import { TensionTask, TensionHoleTask, TensionHoleInfo, TensionRecord, RecordCompute, OnceRecord, GroupsName } from 'src/app/models/tension';
import { holeNameShow, getModeStr, recordCompute, HMIstage, kn2Mpa, createGroupsName } from 'src/app/Function/tension';
import { TensionDevice } from 'src/app/models/jack';
import { PLCService } from 'src/app/services/plc.service';
import { tensionBase } from 'src/app/models/tensionBase';
import { AppService } from 'src/app/services/app.service';
import { NgxElectronModule, ElectronService } from 'ngx-electron';
import { interval } from 'rxjs/internal/observable/interval';
import { map } from 'rxjs/operators';
import { Subscription, Observable } from 'rxjs';
import { FC } from 'src/app/models/socketTCP';
import { PLC_D, PLC_M } from 'src/app/models/IPCChannel';
import { NzMessageService } from 'ng-zorro-antd';
import { Store } from '@ngrx/store';
import { NgrxState } from 'src/app/ngrx/reducers';
import { TcpLive } from 'src/app/models/tensionLive';
import { sleep } from 'sleep-ts';
import { DbService, DbEnum } from 'src/app/services/db.service';
import { nameRepetition } from 'src/app/Validator/async.validator';
import { copyAny } from 'src/app/models/base';

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

function liveDataInit() {
return {
    A1: [1, 2, 3, 4, 5, 6],
    A2: [1, 2, 3, 4, 5, 6],
    B1: [1, 2, 3, 4, 5, 6],
    B2: [1, 2, 3, 4, 5, 6],
    time: 0,
    stage: null,
    stageActive: false,
    state: false,
    t: null,
    sratrTime: null,
    /** 开始张拉 */
    run: false,
    /** 张拉完成 */
    success: false,
    /** 开始卸荷 */
    unState: false,
    /** 保存记录 */
    saveSate: false,
    /** 下载完成 */
    downOk: false,
    /** 启动张拉按钮 */
    runPLCState: false
  };
}
@Component({
  selector: 'app-live-tension',
  templateUrl: './live-tension.component.html',
  styleUrls: ['./live-tension.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LiveTensionComponent implements OnInit, OnDestroy {
  strMode: Array<string>;
  /** 报警字符数据 */
  alarm = tensionAlarmStr;
  /** 实时主机 */
  liveData = liveDataInit();
  nzHref: string;
  /** 张拉数据 */
  data: TensionTask = tensionBase;
  /** 张拉第几条 */
  holeIndex = 0;
  /** 记录第几条 */
  recordIndex = 0;
  /** 记录数据 */
  record: OnceRecord;
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
  /** 显示下载界面 */
  downShow = false;
  /** 选择张拉孔数据 */
  oldHoleIndex: number;
  /** 下载进度 */
  downProgress = 0;
  /** 下载状态 */
  downState = false;
  groupNames: Array<GroupsName>;
  /** 当前孔数据 */
  holeData: TensionHoleInfo;
  /** 张拉数据 */
  task: TensionHoleTask;
  /** 下载数据错误提示 */
  downErrorMsg: any[];
  /** 自动下载时间 */
  autoDownT: any;
  /** 自动下载计数 */
  autoDownCount = 0;
  /** 启动延时 */
  runPLCT: NodeJS.Timeout;
  /** 梁张拉完成 */
  tensionSuccessAll = false;
  /** 复制新梁 */
  newData: TensionTask;
  newDataValidation = {
    name: null,
    castingDate: null,
    vidoe: false
  };
  /** 未张拉组 */
  tensionNot: any[] = [];
  downErrorCount: any;
  /** plc状态 */
  get plcState(): boolean {
    return this.PLCS.plcState;
  }

  /** 修改数据判断 */
  updateFilterFun = (o1: TensionTask, o2: TensionTask) => o1.name === o2.name
    && o1.component === o2.component && o1.project === o2.project && o1.id !== o2.id;

  constructor(
    public PLCS: PLCService,
    public appS: AppService,
    private e: ElectronService,
    private cdr: ChangeDetectorRef,
    private message: NzMessageService,
    private db: DbService,
    // private store$: Store<NgrxState>,
  ) { }

  async ngOnInit() {
    this.PLCS.noOut = true;
    console.log(this.PLCS.taskId, this.PLCS.taskId);
    this.holeIndex = this.PLCS.holeIndex;
    // this.tcpLink$ = this.store$.select(state => state.tcpLive);
    this.initData();
  }
  async initData() {
    if (this.PLCS.taskId) {
      this.data =  await this.db.getFirstId(DbEnum.tension, this.PLCS.taskId);
      this.groupNames = createGroupsName(this.data);
      // console.log(this.groupNames);

      this.oldHoleIndex = this.holeIndex;
      this.setTask();
      this.switchHole(this.holeIndex);
      this.selectOk();
    } else {
      this.holeIndex = 0;
      this.oldHoleIndex = 0;
      this.data = tensionBase;
      this.groupNames = createGroupsName(this.data);
      this.holeData = this.data.tensionHoleInfos[this.holeIndex];
      this.task = this.holeData.tasks[0];
      this.holeNames = holeNameShow(this.holeData.name, this.task.mode);
      this.strMode = getModeStr(this.task.mode);
      // this.createRecord()
      this.record = this.task.record.groups[0];
      this.getRecordCalculate();
      this.jackModeStr = JackModeEnum[this.task.mode];
    }
    this.runLive();
  }

  setTask() {
    this.holeData = this.data.tensionHoleInfos[this.holeIndex];
    this.task = this.holeData.tasks[0];
    this.holeNames = holeNameShow(this.holeData.name, this.task.mode);
    this.strMode = getModeStr(this.task.mode);
    console.log(this.task.record, this.strMode);
    if (this.task.record && this.task.record.groups && this.task.record.groups.length > 0) {
      this.record = this.task.record.groups[0];
      this.recordIndex = 0;
    } else {
      this.recordIndex = 0;
      this.record = this.createRecord();
      console.log(this.record);
    }
    // this.getRecordCalculate();
    this.jackModeStr = JackModeEnum[this.task.mode];
    this.cdr.detectChanges();
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
    this.PLCS.holeIndex = null;
    this.PLCS.taskId = null;
    if (this.plcsub) {
      this.plcsub.unsubscribe();
      this.plcsub = null;
    }
    this.cancelAutoDown();
    this.stop();
  }

  /** 创建记录基本数据 */
  createRecord(): OnceRecord {
    const jn: any = {};
    const ds: any = {};
    this.strMode.map(key => {
      jn[key] = {
        // mpa: Array(this.task.stage.time.length).map(_ => 0),
        mpa: [],
        mm: [],
        initMpa: 0,
        initMm: 0
      };
      ds[key] = {
        mpa: [],
        mm: [],
      }
    });
    return {
      knPercentage: this.task.stage.knPercentage,
      msg: this.task.stage.msg,
      time: Array(this.task.stage.time.length).map(_ => NaN),
      uploadPercentage: this.task.stage.uploadPercentage,
      uploadDelay: NaN,
      ...jn,
      datas: {
        hz: 1,
        ...ds
      }
    };
  }
  /** 计算数据 */
  getRecordCalculate(length = null) {
    const groups: Array<OnceRecord> = [this.record];
    const record: TensionRecord = { state: 0, groups}
    this.recordCalculate = recordCompute({...this.task, record}, length);
    this.cdr.detectChanges();
  }
  /** 选择滚动显示 */
  switchItem(event) {
    this.nzHref = event.nzHref;
  }
  /** 监控 */
  async getLiveData() {
    // console.log(this.downState, this.tensionSuccess, this.liveData.downOk);

    if (this.sendState || ((this.downState || this.tensionSuccess) && !this.liveData.downOk)) {
      return;
    }
    if (!this.plcState) {
      console.log('请链接设备');
      this.cdr.detectChanges();
      return;
    }
    const callpack = 'liveTension';
    this.sendState = true;
    // try {
    //   await this.PLCS.ipc({request: FC.FC3, address: PLC_D(0), value: 52, callpack}).then((data: any) => {
    //     this.resetLivedata(data.data.data);
    //   });
    // } catch (error) {
    //   console.error('数据转换有误！！');
    // } finally {
    // }
    // this.sendState = false;
    // await sleep(10);
    // this.cdr.detectChanges();
    // this.getLiveData();

    this.PLCS.ipcs({request: FC.FC3, address: PLC_D(0), value: 52, callpack}, data => {
      this.resetLivedata(data.data.data);
      this.sendState = false;
      this.cdr.detectChanges();
      setTimeout(() => {
        this.getLiveData();
      }, 50);
    })
  }
  resetLivedata(r) {
      // const r = data.data.data;
      this.liveData.A1 = r.float.slice(0, 6).map(m => m.toFixed(2));
      this.liveData.A2 = r.float.slice(6, 12).map(m => m.toFixed(2));
      this.liveData.B1 = r.float.slice(12, 18).map(m => m.toFixed(2));
      this.liveData.B2 = r.float.slice(18, 24).map(m => m.toFixed(2));
      this.liveData.time = Math.round(r.float[25]);
      const state = Math.round(this.liveData[this.strMode[0]][5]);
      // console.log(state);

      if (this.liveData.run) {
        this.showCSV();
      }
      /** 下载完成 */
      if (state === 60) {
        this.liveData.downOk = true;
        this.downProgress = 0;
        this.downShow = false;
      }
      if (state === 2 && !this.liveData.run) {
        this.appS.taskLiveState = true;
        this.record.startDate = new Date();
        this.liveData.run = true;
        this.liveData.stage = 0;
        this.saveCSV();
      }else if (!this.liveData.stageActive && ([6,7, 10,11, 14,15, 18,19, 22,21, 26,27].indexOf(state) > -1) ) {
        this.liveData.stageActive = true;
        this.liveData.stage++;
        // this.record.time[this.liveData.stage] = this.task.stage.time[this.liveData.stage];
      } else if([9, 13, 17, 21, 25, 29].indexOf(state) > -1) {
        this.liveData.stageActive = false;
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
      if (state === 35 && !this.liveData.saveSate) {
        this.liveData = liveDataInit();
        this.liveData.saveSate = true;
        this.liveData.run = false;
        console.error(this.liveData);

        this.saveData();
      }
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
    const length = this.record.datas[this.strMode[0]].mpa.length;
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
      this.record.datas[key].mpa.push(mpa);
      this.record.datas[key].mm.push(mm);
      this.record[key].mpa[this.liveData.stage] = mpa;
      this.record[key].mm[this.liveData.stage] = mm;
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
      const length = this.record.datas[key].mpa.length - 1;
      this.record.datas[key].mpa[length] = (mpa);
      this.record.datas[key].mm[length] = (mm);
      if (!this.liveData.success) {
        this.record[key].mpa[this.liveData.stage] = mpa;
        this.record[key].mm[this.liveData.stage] = mm;
        this.record.time[this.liveData.stage] = this.liveData.time;
      }
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
      this.record.datas[key].mpa.push(mpa);
      this.record.datas[key].mm.push(mm);
    });
    if (this.liveData.stage >= 1 && !this.liveData.success) {
      this.getRecordCalculate(this.liveData.stage);
    }
    this.cdr.detectChanges();
    setTimeout(() => {
      // console.log(this.liveData);
      if (this.liveData.run) {
        this.saveCSV();
      }
    }, 1000);
  }
  /** 卸荷 */
  upload() {
    this.strMode.map(key => {
      const mpa = this.liveData[key][0];
      const mm = this.liveData[key][3];
      this.record[key].initMpa = mpa;
      this.record[key].initMm = mm;
    });
  }
  /** 保存数据 */
  async saveData() {
    localStorage.setItem('tensionSave', JSON.stringify(this.record));
    console.log(this.record, this.data);
    const data = await this.db.getFirstId<TensionTask>('tension', this.data.id);
    this.record.endDate = new Date();
    if (this.task.record && this.task.record.groups && this.task.record.groups.length > 0) {
      data.tensionHoleInfos[this.holeIndex].tasks[0].record.state = 2;
      data.tensionHoleInfos[this.holeIndex].tasks[0].record.groups[this.recordIndex] = this.record;
    } else {
      data.tensionHoleInfos[this.holeIndex].tasks[0].record = {state: 2, groups: [this.record]}
    }
    const r = await this.db.updateAsync('tension', data, (o: any) => this.updateFilterFun(o, data));
    console.log(r);
    if (r.success) {
      this.message.success(`保存成功🙂`);
      this.data = data;
      this.groupNames = createGroupsName(this.data);
    }
    this.nextGroup();
  }
  startAutoDown() {
    if (!this.autoDownCount) {
      this.autoDownCount = 0;
      this.autoDownT = setInterval(() => {
        this.autoDownCount++;
        if (this.autoDownCount >= 10) {
          clearInterval(this.autoDownT);
          this.autoDownCount = 0;
          this.cancelAutoDown();
          this.selectOk();
        }
        this.cdr.detectChanges();
      }, 1000);

    }
  }
  /** 下一组 */
  nextGroup(state = true) {
    this.tensionSuccess = true;
    this.downShow = true;
    this.appS.taskLiveState = false;
    this.tensionNot = [];
    if (this.holeIndex < this.data.tensionHoleInfos.length - 1 && state) {
      this.switchHole(this.holeIndex + 1);
      this.startAutoDown();
    } else {
      this.groupNames.map((m, i)=> {
        if (m.state !== 2) {
          this.tensionNot.push(m);
        }
      })
      if (this.tensionNot.length === 0) {
        this.createNewData();
      } else if(!state) {
        this.tensionNot = [];
      }
    }
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
  switchHole(i: number, auto = false) {
    this.holeIndex = i;
    this.downShow = true;
    this.tensionSuccess = true;
    this.liveData.downOk = false;
    // this.strMode = getModeStr(this.task.mode);
    console.log(this.holeIndex, this.holeData, this.groupNames);
    this.setTask();
    if (!auto) {
      this.cancelAutoDown();
    }
    this.cdr.detectChanges();
  }
  /** 确定数据 */
  selectOk() {
    this.downHMI();
    this.cdr.detectChanges();
  }
  cancel() {
    this.holeIndex = this.oldHoleIndex;
    this.downShow = false;
    // this.strMode = getModeStr(this.task.mode);
    this.setTask();
    this.exitDown();
    this.cdr.detectChanges();
  }
  /** 下载张拉数据 */
  async downHMI() {
    this.liveData.saveSate = false;
    if (this.downState) {
      return;
    }
    this.downErrorMsg = [];
    this.downState = true;
    this.downProgress = 0;
    console.log('下载的数据', this.data.tensionHoleInfos[this.holeIndex]);
    const task = this.data.tensionHoleInfos[this.holeIndex].tasks[0];
    const stage = this.data.tensionHoleInfos[this.holeIndex].tasks[0].stage.knPercentage;

    getModeStr(task.mode).map(n => {
      const mpa0 = kn2Mpa((task.tensionKn * (stage[0] / 100)), task.device, n);
      const mpa1 = kn2Mpa((task.tensionKn * (stage[stage.length -1] / 100)), task.device, n);
      if (mpa0 < 0.5) {
        this.downErrorMsg.push(`${n}初张拉压力过低`)
      }
      if (mpa1 > 55) {
        this.downErrorMsg.push(`${n}终张拉压力过高`)
      }
      if (task.stage[n].theoryMm < 1) {
        this.downErrorMsg.push(`${n}理论伸长量设置太小`)
      }
      if (task.stage[n].wordMm < 0.1) {
        this.downErrorMsg.push(`${n}工作长度设置太小`)
      }
      if (task.stage[n].reboundMm < 0.1) {
        this.downErrorMsg.push(`${n}回缩量设置太小`)
      }
    })
    task.stage.time.find(t => {
      if (t < 5) {
        this.downErrorMsg.push('持荷时间设置有误！')
        return true;
      }
    })
    if (this.downErrorMsg.length > 0) {
      this.message.error('数据设置有误');
      return;
    }
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
      { request: FC.FC16_float, address: PLC_D(2498), value: [1.0]},
    ];
    this.downErrorCount = 0;
    // tslint:disable-next-line:prefer-for-of
    for (let index = 0; index < cmdarrs.length; index++) {
      if (!this.downState) {
        console.error('下载错误退出');
        return;
      }
      const item = cmdarrs[index]
      await this.PLCS.ipc({
        request: item.request,
        address: item.address,
        value: item.value,
        callpack: 'tensionup'
      }).then(r => console.log(r)).catch(r => {
        console.error('下载错误');
        // this.holeIndex = this.oldHoleIndex;
        // this.strMode = getModeStr(this.task.mode);
        // this.downState = false;
        index = 0;
        this.downErrorCount ++;
        this.downProgress = 0;
        if (this.downErrorCount > 5) {
          this.downState = false;
          this.message.error('尝试下载多次失败，请手动下载');
          this.downErrorMsg.push('尝试下载多次失败，请手动下载');
          this.downErrorCount = 0;
        }
        return;
      });
      if (!this.next()) {
        return;
      }
    }
    this.message.success('下载完成');
    this.oldHoleIndex = this.holeIndex;
    this.exitDown();
  }
  /** 下载下一阶段数据 */
  async next() {
    this.downProgress++;
    this.cdr.detectChanges();
    await sleep(5);
    return this.downState;
  }
  exitDown() {
    this.appS.edit = false;
    this.downState = false;
    this.tensionSuccess = false;
    this.getLiveData();
    this.cancelAutoDown();
    this.cdr.detectChanges();
  }
  /** 取消自动下载 */
  cancelAutoDown() {
    if (this.autoDownT) {
      clearTimeout(this.autoDownT);
      this.autoDownT = null
    }
    this.autoDownCount = 0;
  }
  /** 启动PLC */
  runPLC() {
    if (this.liveData.runPLCState) {
      return;
    }
    this.liveData.runPLCState = true;
    this.PLCS.ipcs({request: FC.FC16_float, address: PLC_D(2498), value: [2.0], callpack: 'runPLC'}, r => {
      console.log('启动张拉', r);
      setTimeout(() => {
        this.liveData.runPLCState = false;
      }, 1000);
    });
  }
  showTest() {
    this.liveData.stage++;
    console.log(this.liveData);
  }
  /** 复制数据认证 */
  async newInput() {
    console.log(this.newData);
    this.newDataValidation.name = null;

    if (this.newData.name) {
      const nameValidation = await this.db.repetitionAsync(DbEnum.tension, (o: any) => this.updateFilterFun(o, this.newData));
      if (nameValidation) {
        this.newDataValidation.name = { reperition: `${this.newData.name} 已存在!!` };
      }
    } else if (!this.newData.name) {
      this.newDataValidation.name = { reperition: '不能为空' };
    }
    this.newDataValidation.castingDate = !this.newData.castingDate ? { reperition: '不能为空' } : null;
    if (!this.newDataValidation.name && !this.newDataValidation.castingDate) {
      this.newDataValidation.vidoe = true;
    } else {
      this.newDataValidation.vidoe = false;
    }
    console.log(this.newDataValidation);

  }
  async newSave() {
    this.recordCalculate = null;
    console.log(this.newData);
    const r = await this.db.addAsync(DbEnum.tension, this.newData, (o: any) => this.updateFilterFun(o, this.newData))
    const msg = '添加';
    if (r.success) {
      this.appS.edit = false;
      this.PLCS.holeIndex = r.id;
      this.data =  await this.db.getFirstId(DbEnum.tension, r.id);
      this.groupNames = createGroupsName(this.data);
      this.setTask();
      this.switchHole(0);
      this.message.success(`${msg}成功🙂`);
      this.tensionSuccessAll = false;
      this.startAutoDown()
    } else {
      this.message.error(`${msg}失败😔`);
      console.log(`${msg}失败😔`, r.msg);
    }
  }
  createNewData() {
    this.tensionNot = [];
    this.newData = copyAny(this.data);
    delete this.newData.id;
    this.newData.tensionDate = null;
    this.newData.castingDate = null;
    this.newData.template = false;
    for (const g of this.newData.tensionHoleInfos) {
      g.state = 0;
      g.uploading = false;
      g.tasks.map(t => {
        t.record = null;
      })
    }
    console.log(this.newData);
    this.appS.edit = true;
    this.tensionSuccess = true;
    this.downShow = true;
    this.downState = false;
    this.tensionSuccessAll = true;
    this.cdr.detectChanges();
  }
}
