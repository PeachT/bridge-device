import { Injectable, ChangeDetectorRef } from '@angular/core';
import { ElectronService } from 'ngx-electron';
import { PLCSocket, testLink } from '../class/PLCSocket';
import { DbService } from './db.service';
import { NzMessageService } from 'ng-zorro-antd';
import { ConnectionStr } from '../models/socketTCP';

@Injectable({
  providedIn: 'root'
})
export class PLCService {
  tcp: PLCSocket;

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
