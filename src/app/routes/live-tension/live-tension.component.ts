import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
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
import { Subscription } from 'rxjs';
import { FC } from 'src/app/models/socketTCP';
import { PLC_D } from 'src/app/models/IPCChannel';

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
  styleUrls: ['./live-tension.component.less']
})
export class LiveTensionComponent implements OnInit, OnDestroy {
  strMode = ['A1', 'A2', 'B1', 'B2'];
  alarm = tensionAlarmStr;
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
  data: TensionTask = tensionBase;
  holeIndex = 0;
  record: TensionRecord;
  recordCalculate: RecordCompute;
  holeNames: any;
  jackModeStr: string;
  liveT = null;
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

  constructor(
    public PLCS: PLCService,
    public appS: AppService,
    private e: ElectronService,
    private crd: ChangeDetectorRef,
  ) { }

  ngOnInit() {
    console.log(this.PLCS.data, this.PLCS.data);

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
    if (this.PLCS.tcp.linkMsg.link) {
      this.getLiveData();
    }
  }

  ngOnDestroy() {
    if (this.liveData.t) {
      clearInterval(this.liveData.t);
    }
    if (this.liveT) {
      clearInterval(this.liveT);
    }
  }


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
    this.liveT = setTimeout(() => {
      if (this.PLCS.tcp.linkMsg.link) {
          const channel = 'liveTension';
          const t = setTimeout(() => {
            this.e.ipcRenderer.removeAllListeners(channel);
          }, 3000);
          this.e.ipcRenderer.send(`${this.PLCS.tcp.connStr.uid}${FC.F03}`, {address: PLC_D(0), value: 52, channel});
          this.e.ipcRenderer.once(channel, (e, r) => {
            // console.log('liveTension', r);
            this.liveData.A1 = r.float.slice(0, 6)
            this.liveData.A2 = r.float.slice(6, 12)
            this.liveData.B1 = r.float.slice(12, 18)
            this.liveData.B2 = r.float.slice(18, 24)
            clearTimeout(t);
            this.getLiveData();
          })
        }
    }, delay);
  }
  test() {
    this.liveData.state = !this.liveData.state;
    this.PLCS.tcp.linkMsg.monitoringState = this.liveData.stage;
    if (!this.liveData.t) {
      this.liveData.t = setInterval(() => {
        if (this.liveData.state) {
          this.liveCsv();
        } else {
          clearInterval(this.liveData.t);
          this.liveData.t = null;
        }
      }, 1000)
    }
    if (this.liveData.stage === null) {
      this.liveData.stage = 0;
      this.liveData.sratrTime = new Date().getTime();
    }
  }
  liveCsv() {
    const length = this.record.groups[0].datas[this.strMode[0]].mpa.length;
    this.liveData.stage = Math.floor(length / 20);
    if (this.liveData.stage === this.task.stage.msg.length) {
      clearInterval(this.liveData.t);
      this.liveData.t = null;
      this.liveData.state = false;
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
  }
}
