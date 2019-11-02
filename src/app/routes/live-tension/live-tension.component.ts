import { Component, OnInit, OnDestroy, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { tensionAlarmStr } from 'src/app/models/liveTension';
import { TensionTask, TensionHoleTask, TensionHoleInfo, TensionRecord, RecordCompute } from 'src/app/models/tension';
import { holeNameShow, getModeStr, recordCompute } from 'src/app/Function/tension';
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
  get holeData(): TensionHoleInfo {
    return this.data.tensionHoleInfos[this.holeIndex];
  }
  get task(): TensionHoleTask {
    return this.holeData.tasks[0];
  }

  get tensionKn(): number {
    return this.task.tensionKn;
  }
  get twice(): boolean {
    return this.task.twice;
  }
  get superState(): boolean {
    return this.task.super;
  }
  get mend(): boolean {
    return this.task.mend;
  }
  get device(): TensionDevice {
    return this.task.device;
  }
  /** plc状态 */
  get plcState(): boolean {
    return this.PLCS.socketInfo.state === 'success';
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
      this.holeIndex = this.PLCS.holeIndex;
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
    } else {
      this.holeIndex = 0;
      this.data = tensionBase;
      this.strMode = getModeStr(this.task.mode);
      // this.createRecord()
      this.record = this.data.tensionHoleInfos[0].tasks[0].record;
    }
    this.getRecordCalculate();
    this.holeNames = holeNameShow(this.holeData.name, this.task.mode);
    this.jackModeStr = JackModeEnum[this.task.mode];
  }
  runLive() {
    if (this.plcState) {
      this.getLiveData();
    }
    if (!this.plcsub) {
      this.plcsub = this.PLCS.LinkState$.subscribe((state) => {
        if (state) {
          this.getLiveData();
        } else {
          this.stopLive();
        }
      });
    }
  }

  ngOnDestroy() {
    this.PLCS.noOut = false;
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
  getLiveData() {
    const delay = 100;
    if (this.liveT) {
      return;
    }
    this.liveT = setInterval(() => {
      if (this.plcState) {
        const channel = 'liveTension';
        const t = setTimeout(() => {
          this.e.ipcRenderer.removeAllListeners(channel);
        }, 3000);
        this.e.ipcRenderer.send(`${this.PLCS.connStr.uid}${FC.F03}`, {address: PLC_D(0), value: 52, channel});
        this.e.ipcRenderer.once(channel, (e, r) => {
          // console.log('liveTension', r);
          this.liveData.A1 = r.float.slice(0, 6)
          this.liveData.A2 = r.float.slice(6, 12)
          this.liveData.B1 = r.float.slice(12, 18)
          this.liveData.B2 = r.float.slice(18, 24)
          clearTimeout(t);
          this.cdr.detectChanges();
        })
      } else {
        console.log('请链接设备');
        this.cdr.detectChanges();
      }
    }, delay);
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
    if (this.plcsub) {
      this.plcsub.unsubscribe();
      this.plcsub = null;
    }
  }
}
