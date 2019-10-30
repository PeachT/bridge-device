import { Component, OnInit } from '@angular/core';
import { tensionAlarmStr } from 'src/app/models/liveTension';
import { TensionTask, TensionHoleTask, TensionHoleInfo, TensionRecord, RecordCompute } from 'src/app/models/tension';
import { holeNameShow, getModeStr, recordCompute } from 'src/app/Function/tension';
import { TensionDevice } from 'src/app/models/jack';
import { PLCService } from 'src/app/services/plc.service';

@Component({
  selector: 'app-live-tension',
  templateUrl: './live-tension.component.html',
  styleUrls: ['./live-tension.component.less']
})
export class LiveTensionComponent implements OnInit {
  strMode = ['A1', 'A2', 'B1', 'B2'];
  alarm = tensionAlarmStr;
  liveData = {
    A1: [0.5, 1.1, 2.2, 4],
    A2: [0.5, 1.1, 2.2, 3],
    B1: [0.5, 1.1, 2.2, 2],
    B2: [0.5, 1.1, 2.2, 1],
  }
  nzHref: string;
  data: TensionTask;
  holeIndex: number;
  record: TensionRecord;
  recordCalculate: RecordCompute;
  get holeData(): TensionHoleInfo {
    return this.data.tensionHoleInfos[this.holeIndex];
  }
  get task(): TensionHoleTask {
    return this.holeData.tasks[0];
  }
  get holeNames() {
    return holeNameShow(this.holeData.name, this.task.mode);
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
    public PLCS: PLCService
  ) { }

  ngOnInit() {
    this.data = this.PLCS.data;
    this.holeIndex = this.PLCS.holeIndex;
    if (this.data) {
      this.strMode = getModeStr(this.task.mode);
    }
    console.log(this.task.record);

    if (this.task.record && this.task.record.groups.length > 0) {
      this.record = this.task.record[0];
    } else {
      const jn: any = {};
      const ds: any = {};
      this.strMode.map(key => {
        jn[key] = {
          mpa: Array(this.task.stage.time.length).map(_ => 0),
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
    this.recordCalculate = recordCompute({...this.task, record: this.record});

    console.log(this.record);

  }

  switchItem(event) {
    console.log(event.nzHref);
    this.nzHref = event.nzHref;
  }

}
