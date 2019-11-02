import { Component, OnInit } from '@angular/core';
import { AppService } from 'src/app/services/app.service';

@Component({
  selector: 'app-grouting-setting',
  templateUrl: './grouting-setting.component.html',
  styleUrls: ['./grouting-setting.component.less'],
})
export class GroutingSettingComponent implements OnInit {
  devices = {
    envTemperature: false,
    slurryTemperature: false,
    waterTemperature: false,
    intoPulpPressure: true,
    outPulpPressure: false,
    intoPulpvolume: false,
    outPulpvolume: false,
    svgHeight: 350,
  }
  constructor(
    public appS: AppService,
  ) { }

  ngOnInit() {
    this.devices = this.appS.groutingDevicesInfo;
  }

  devicesSet() {
    setTimeout(() => {
      console.log(this.devices, JSON.stringify(this.devices));
      this.appS.groutingDevicesInfo = this.devices;
      localStorage.setItem('groutingDevicesInfo', JSON.stringify(this.devices));
    }, 1);
  }
}
