import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { GroutingService } from 'src/app/services/grouting.service';
import { AppService } from 'src/app/services/app.service';
import { ElectronService } from 'ngx-electron';
import { DbService } from 'src/app/services/db.service';
import { NzMessageService } from 'ng-zorro-antd';
import { Observable, Observer } from 'rxjs';

@Component({
  selector: 'app-grouting-setting',
  templateUrl: './grouting-setting.component.html',
  styleUrls: ['./grouting-setting.component.less'],
})
export class GroutingSettingComponent implements OnInit {
  tastLinkMsg = {
    state: false,
    msg: null,
    success: false,
  };
  devices = {
    envTemperature: false,
    slurryTemperature: false,
    waterTemperature: false,
    intoPulpPressure: true,
    outPulpPressure: false,
    intoPulpvolume: false,
    outPulpvolume: false,
  }
  constructor(
    public appS: AppService,
    private e: ElectronService,
    private odb: DbService,
    private message: NzMessageService,
    private cdr: ChangeDetectorRef,
    public GPLCS: GroutingService
  ) { }

  ngOnInit() {
    this.devices = this.appS.groutingDevicesInfo;
  }

  tastLink() {
    this.tastLinkMsg.state = true;
    localStorage.setItem('groutingConn', JSON.stringify(this.GPLCS.connectionStr));
    this.e.ipcRenderer.send('tastLink', `${this.GPLCS.connectionStr.ip}`);
    this.e.ipcRenderer.once(`tastLink`, (event, data) => {
      this.tastLinkMsg.state = false;
      this.tastLinkMsg.success = data.alive;
      console.log(data);
      if (data.alive) {
        this.tastLinkMsg.msg = `${this.GPLCS.connectionStr.ip} 测试成功！`;
      } else {
        this.tastLinkMsg.msg = `${this.GPLCS.connectionStr.ip} 测试失败！`;
      }
      this.cdr.detectChanges();
    });
  }
  devicesSet() {
    setTimeout(() => {
      console.log(this.devices, JSON.stringify(this.devices));
      this.appS.groutingDevicesInfo = this.devices;
      localStorage.setItem('groutingDevicesInfo', JSON.stringify(this.devices));
    }, 1);
  }
}
