import { Component, OnInit, ChangeDetectorRef, ViewChild, TemplateRef } from '@angular/core';
import { ElectronService } from 'ngx-electron';
import { AppService } from 'src/app/services/app.service';
import { NzNotificationService, NzMessageService } from 'ng-zorro-antd';



@Component({
  selector: 'app-service-app-update',
  templateUrl: './service-app-update.component.html',
  styleUrls: ['./service-app-update.component.less']
})
export class ServiceAppUpdateComponent implements OnInit {
  @ViewChild('notificationTemp', { static: false }) template: TemplateRef<{}>;
  updateMessage = {
    checking: '正在检查更新……',
    updateAva: '检测到新版本',
    updateNotAva: '现在使用的就是最新版本，不用更新',
    error: '检查更新出错',
  };

  serviceUpdate = {
    state: false,
    msg: null,
    info: null,
    start: false,
    downInfo: {
      /** 速度 */
      bytesPerSecond: null,
      delta: null,
      /** 下载百分比 */
      percent: null,
      /** 总大小 */
      total: null,
      downSize: null,
      transferred: 0,
      remainingTime: null,
    }
  }

  constructor(
    public appS: AppService,
    public e: ElectronService,
    private cdr: ChangeDetectorRef,
    private notification: NzNotificationService,
    private message: NzMessageService
  ) { }

  ngOnInit() {
    this.notification.config({
      nzPlacement: 'bottomRight'
    });
    console.log('检测更新init');


    // 监听主进程
    this.e.ipcRenderer.on('update-message', (event, message) => {
      if (this.appS.updateState) {
        this.serviceUpdate.state = true;
      } else if (message.msg === 'updateAva') {
        this.showNotification();
      }
      console.log('检测更新', message);
      this.serviceUpdate.msg = message.msg;
      this.serviceUpdate.info = message.info;
      this.cdr.detectChanges();
    });
    this.e.ipcRenderer.on('isUpdateNow', () => {
      alert('下载完成，马上安装');
      this.e.ipcRenderer.send('isUpdateNow');
      this.cdr.detectChanges();
    });
    this.e.ipcRenderer.on('downloadProgress', (event, message) => {
      this.setDownInfo(message);
    });
  }
  showNotification() {
    const s = this.notification.template(this.template, { nzDuration: 0 });
  }
  showInfo() {
    this.serviceUpdate.state = true;
    this.notification.remove();
  }
  setDownInfo(message) {
    this.serviceUpdate.start = true;
    this.serviceUpdate.downInfo.total = this.type2MG(message.total);
    this.serviceUpdate.downInfo.bytesPerSecond = this.type2MG(message.bytesPerSecond);
    // tslint:disable-next-line:radix
    this.serviceUpdate.downInfo.percent = parseInt(message.percent);
    const dsize = message.total * (message.percent / 100);
    this.serviceUpdate.downInfo.downSize = this.type2MG(dsize);
    this.serviceUpdate.downInfo.remainingTime = this.secondToDate( (message.total - dsize) / message.bytesPerSecond);
    this.cdr.detectChanges();
    console.log(message, this.serviceUpdate);
  }
  /** 测试 */
  testsetDownInfo() {
    this.serviceUpdate.state = true;
    this.serviceUpdate.start = true;
    setInterval(() => {
      this.setDownInfo({ total: 646189426, bytesPerSecond: new Date().getSeconds(), percent: new Date().getSeconds() });
    }, 1000);
  }

  onServiceUpdate() {
    this.serviceUpdate = {
      state: true,
      msg: null,
      info: null,
      start: false,
      downInfo: {
        /** 速度 */
        bytesPerSecond: null,
        delta: null,
        /** 下载百分比 */
        percent: 0,
        /** 总大小 */
        total: null,
        downSize: null,
        transferred: 0,
        remainingTime: 0
      }
    };
  }
  /** 获取更新 */
  // this.e.ipcRenderer.send('update');

  /** 启动下载 */
  startServiceUpdata() {
    this.e.ipcRenderer.send('downApp');
  }
  /** 测试 */
  secondToDate(result) {
    const h = Math.floor(result / 3600);
    const m = Math.floor((result / 60 % 60));
    const s = Math.floor((result % 60));
    return result = h + ':' + m + ':' + s;
  }
  /** 字节转kB MB GM */
  type2MG(bd: number) {
    const kb = bd / 1024;
    if (kb > 1024) {
      const mb = kb / 1024;
      if (mb > 1024) {
        return `${(mb / 1024).toFixed(1)}GB`;
      } else {
        return `${mb.toFixed(1)}MB`
      }
    } else {
      return `${kb.toFixed(1)}KB`
    }
  }
  colseModal() {
    if (this.serviceUpdate.start) {
      this.message.warning('正在下载不要退出！');
    } else {
      this.serviceUpdate.state = false;
    }
  }
}
