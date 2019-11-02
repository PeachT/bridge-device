import { Component, OnInit, Input } from '@angular/core';
import { ConnectionStr, FC } from 'src/app/models/socketTCP';
import { PLCSocket, testLink } from 'src/app/class/PLCSocket';
import { AppService } from 'src/app/services/app.service';
import { ElectronService } from 'ngx-electron';
import { Store } from '@ngrx/store';
import { NgrxState } from 'src/app/ngrx/reducers';
import { PLC_D } from 'src/app/models/IPCChannel';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'link-base',
  templateUrl: './link-base.component.html',
  styleUrls: ['./link-base.component.less']
})
export class LinkBaseComponent implements OnInit {
  @Input() linkName: 'tensionLink' | 'groutingLink';
  @Input() heartbeatAddress = PLC_D(0);
  connStr: ConnectionStr = {
    ip: '192.168.1.1',
    port: 8899,
    address: 1,
    uid: 'tension',
    setTimeout: 3000,
    hz: 1000,
    heartbeatAddress: PLC_D(0)
  }
  tcp: PLCSocket;

  constructor(
    public appS: AppService,
    private e: ElectronService,
    private store$: Store<NgrxState>,
  ) { }

  ngOnInit() {
    this.connStr.uid = this.linkName;
    this.connStr.heartbeatAddress = this.heartbeatAddress;
    /** 压浆设备信息设置获取 */
    const connStr = JSON.parse(localStorage.getItem(this.linkName));
    if (!connStr) {
      localStorage.setItem(this.linkName, JSON.stringify(this.connStr));
    } else {
      this.connStr = connStr;
    }
  }
  saveConnStr() {
    setTimeout(() => {
      console.log(this.connStr, JSON.stringify(this.connStr));
      localStorage.setItem(this.linkName, JSON.stringify(this.connStr));
    }, 1);
  }
  async link() {
    console.log('链接');
    await testLink(this.e, this.store$, this.connStr).then((s) => {
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
    this.tcp.ipc(FC.F016_float, {address: PLC_D(2108), value: [10, 20, 50, 80, 100], channel: 's01ss'})
  }
  setStr() {
    this.tcp.ipc(FC.F016, {address: PLC_D(2042), value: [78, 49, 0, 0, 0, 0, 0, 0, 0, 0], channel: 'teststr'})
  }
  setStr1() {
    this.tcp.ipc(FC.F016_float, {address: PLC_D(2152), value: [10.2, 20.3, 50.5, 80.8, 90.9], channel: 'teststr'})
  }
  setStr2() {
    this.tcp.ipc(FC.F016_float, {address: PLC_D(2168), value: [10, 20, 50, 80, 100], channel: 'teststr'})
  }
  setStr3() {
    this.tcp.ipc(FC.F016_float, {address: PLC_D(2184), value: [10.22], channel: 'teststr'})
  }
}
