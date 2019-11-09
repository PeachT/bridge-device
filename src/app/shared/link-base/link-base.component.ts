import { Component, OnInit, Input } from '@angular/core';
import { ConnectionStr, FC } from 'src/app/models/socketTCP';
import { AppService } from 'src/app/services/app.service';
import { ElectronService } from 'ngx-electron';
import { Store } from '@ngrx/store';
import { NgrxState } from 'src/app/ngrx/reducers';
import { PLC_D } from 'src/app/models/IPCChannel';
import { NzMessageService } from 'ng-zorro-antd';

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
    heartbeatAddress: PLC_D(0),
    toLinkTime: 10000,
    mode: 'tcp'
  }

  constructor(
    public appS: AppService,
    private e: ElectronService,
    private store$: Store<NgrxState>,
    private message: NzMessageService,
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
      localStorage.setItem(this.linkName, JSON.stringify(this.connStr));
      this.message.success('保存成功');
    }, 1);
  }
}
