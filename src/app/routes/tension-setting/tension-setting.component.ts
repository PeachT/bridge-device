import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { AppService } from 'src/app/services/app.service';
import { ElectronService } from 'ngx-electron';
import { DbService } from 'src/app/services/db.service';
import { NzMessageService } from 'ng-zorro-antd';
import { PLCSocket, testLink } from 'src/app/class/PLCSocket';
import { FC, ConnectionStr } from 'src/app/models/socketTCP';
import { PLC_D } from 'src/app/models/IPCChannel';
import { Store } from '@ngrx/store';
import { NgrxState } from 'src/app/ngrx/reducers';

@Component({
  selector: 'app-tension-setting',
  templateUrl: './tension-setting.component.html',
  styleUrls: ['./tension-setting.component.less'],
})
export class TensionSettingComponent implements OnInit {
  constructor(
  ) { }
  ngOnInit() {

  }
}
