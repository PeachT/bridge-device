import { Injectable, ChangeDetectorRef } from '@angular/core';
import { ElectronService } from 'ngx-electron';
import { PLCSocket, testLink } from '../class/PLCSocket';
import { DbService } from './db.service';
import { NzMessageService } from 'ng-zorro-antd';
import { ConnectionStr } from '../models/socketTCP';
import { TensionTask } from '../models/tension';

@Injectable({
  providedIn: 'root'
})
export class PLCService {
  tcp: PLCSocket;
  /** 张拉数据 */
  data: TensionTask;
  /** 张拉孔 */
  holeIndex: number;

  constructor(
    private e: ElectronService,
    private message: NzMessageService,
  ) { }

  async link(name: string) {
    console.log('链接');
    const connStr: ConnectionStr = JSON.parse(localStorage.getItem(name));
    if (connStr) {
      await testLink(this.e, connStr).then((s) => {
        this.tcp = s;
      }).catch((err) => {
        console.error(err);
      });
    } else {
      this.message.error('没有链接字符串');
    }
  }
  cancelLink() {
    this.tcp.cancelLink();
    this.tcp = null;
  }
}
