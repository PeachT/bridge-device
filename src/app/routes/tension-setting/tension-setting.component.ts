import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { AppService } from 'src/app/services/app.service';
import { ElectronService } from 'ngx-electron';
import { DbService } from 'src/app/services/db.service';
import { NzMessageService } from 'ng-zorro-antd';
import { PLCSocket, testLink } from 'src/app/class/PLCSocket';
import { FC, ConnectionStr } from 'src/app/models/socketTCP';
import { PLC_D } from 'src/app/models/IPCChannel';

@Component({
  selector: 'app-tension-setting',
  templateUrl: './tension-setting.component.html',
  styleUrls: ['./tension-setting.component.less'],
})
export class TensionSettingComponent implements OnInit {
  connStr: ConnectionStr = {
    ip: '192.168.1.1',
    port: 8899,
    address: 1,
    uid: 'tension',
    setTimeout: 3000,
    hz: 1000
  }
  tcp: PLCSocket;

  constructor(
    public appS: AppService,
    private e: ElectronService,
    private odb: DbService,
    private message: NzMessageService,
    private cdr: ChangeDetectorRef,
  ) { }

  ngOnInit() {
    /** 压浆设备信息设置获取 */
    const connStr = JSON.parse(localStorage.getItem('tensionLink'));
    if (!connStr) {
      localStorage.setItem('tensionLink', JSON.stringify(this.connStr));
    } else {
      this.connStr = connStr;
    }
  }
  saveConnStr() {
    setTimeout(() => {
      console.log(this.connStr, JSON.stringify(this.connStr));
      localStorage.setItem('tensionLink', JSON.stringify(this.connStr));
    }, 1);
  }
  async link() {
    console.log('链接');
    await testLink(this.e, this.connStr).then((s) => {
      this.tcp = s;
    }).catch((err) => {
      console.error(err);
    });
  }
  cancelLink() {
    this.tcp.cancelLink();
    this.tcp = null;
  }
  setD() {
    this.tcp.ipc(FC.F016_float, {address: PLC_D(2108), value: [10, 20, 50, 80, 100], channel: 's01ss'}, (r) => {
      console.log(r);
    })
  }
  setStr() {
    this.tcp.ipc(FC.F016, {address: PLC_D(2042), value: [78, 49, 0, 0, 0, 0, 0, 0, 0, 0], channel: 'teststr'}, (r) => {
      console.log(r);
    })
  }
  setStr1() {
    this.tcp.ipc(FC.F016_float, {address: PLC_D(2152), value: [10.2, 20.3, 50.5, 80.8, 90.9], channel: 'teststr'}, (r) => {
      console.log(r);
    })
  }
  setStr2() {
    this.tcp.ipc(FC.F016_float, {address: PLC_D(2168), value: [10, 20, 50, 80, 100], channel: 'teststr'}, (r) => {
      console.log(r);
    })
  }
  setStr3() {
    this.tcp.ipc(FC.F016_float, {address: PLC_D(2184), value: [10.22], channel: 'teststr'}, (r) => {
      console.log(r);
    })
  }
}
