import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { DbService } from 'src/app/services/db.service';
import { NzMessageService } from 'ng-zorro-antd';
import { AppService } from 'src/app/services/app.service';
import { Router } from '@angular/router';
import { ElectronService } from 'ngx-electron';


@Component({
  selector: 'app-help',
  templateUrl: './help.component.html',
  styleUrls: ['./help.component.less'],
})
export class HelpComponent implements OnInit {
  updateMessage = {
    checking: '正在检查更新……',
    updateAva: '检测到新版本',
    updateNotAva: '现在使用的就是最新版本，不用更新',
    error: '检查更新出错',
  };
  update = {
    state: false,
    msg: '正在更新',
    sucess: 0,
    cancel: false,
    time: 0,
    files: null,
    selectFile: null,
    start: false,
    fileMsg: null,
  };
  testMsg: null;
  setPlatform = null;
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
  get powerDelay(): number {
    return this.appS.powerDelay;
  }

  constructor(
    public appS: AppService,
    private router: Router,
    public e: ElectronService,
    private cdr: ChangeDetectorRef,
  ) {

  }

  ngOnInit() {
    console.log(this.update);
    this.setPlatform = this.appS.platform;
    // // 监听主进程
    // this.e.ipcRenderer.on('update-message', (event, message) => {
    //   console.log(message);
    //   this.serviceUpdate.msg = message.msg;
    //   this.serviceUpdate.info = message.info;
    //   this.serviceUpdate.state = true;
    //   this.cdr.detectChanges();
    // });
    // this.e.ipcRenderer.on('isUpdateNow', () => {
    //   alert('下载完成，马上安装');
    //   this.e.ipcRenderer.send('isUpdateNow');
    //   this.cdr.detectChanges();
    // });
    // this.e.ipcRenderer.on('downloadProgress', (event, message) => {
    //   this.setDownInfo(message);
    // });
  }
  setDownInfo(message) {
    this.serviceUpdate.start = true;
    this.serviceUpdate.downInfo.total = this.type2MG(message.total);
    this.serviceUpdate.downInfo.bytesPerSecond = this.type2MG(message.bytesPerSecond);
    // tslint:disable-next-line:radix
    this.serviceUpdate.downInfo.percent = parseInt(message.percent);
    this.serviceUpdate.downInfo.downSize = this.type2MG(message.total * (message.percent / 100));
    this.serviceUpdate.downInfo.remainingTime = this.secondToDate( message.total / message.bytesPerSecond);
    this.cdr.detectChanges();
    console.log(message, this.serviceUpdate);
  }
  testsetDownInfo() {
    this.serviceUpdate.state = true;
    this.serviceUpdate.start = true;
    setInterval(() => {

      this.setDownInfo({ total: 646189426, bytesPerSecond: new Date().getSeconds(), percent: new Date().getSeconds() });
    }, 1000);
  }

  onServiceUpdate() {
    // this.serviceUpdate = {
    //   state: true,
    //   msg: null,
    //   info: null,
    //   start: false,
    //   downInfo: {
    //     /** 速度 */
    //     bytesPerSecond: null,
    //     delta: null,
    //     /** 下载百分比 */
    //     percent: 0,
    //     /** 总大小 */
    //     total: null,
    //     downSize: null,
    //     transferred: 0,
    //     remainingTime: 0
    //   }
    // };
    this.appS.updateState = true;
    this.e.ipcRenderer.send('update');
  }
  startServiceUpdata() {
    this.e.ipcRenderer.send('downApp');
  }
  secondToDate(result) {
    const h = Math.floor(result / 3600);
    const m = Math.floor((result / 60 % 60));
    const s = Math.floor((result % 60));
    return result = h + ':' + m + ':' + s;
  }
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

  onUpdate() {
    this.update.state = true;
    this.e.ipcRenderer.send('select-file', 'select-file-out');

    this.e.ipcRenderer.once('select-file-out', (event, data) => {
      console.log(data);
      this.update.files = data.stdout;
      this.update.fileMsg = data;
      this.cdr.detectChanges();
    });

  }
  runUpdate() {
    console.log(this.update.selectFile);
    this.update.start = true;
    this.e.ipcRenderer.send('local-update', this.update.selectFile);
    const it = setInterval(() => {
      this.update.time++;
      if (this.update.time > 120) {
        clearTimeout(it);
        this.update.msg = '更新失败！2分钟未更新完成！更新超时，请重启！';
        this.e.ipcRenderer.removeAllListeners('onUpdate');
        this.update.sucess = 2;
        return;
      }
      this.cdr.detectChanges();
    }, 1000);
    this.e.ipcRenderer.once('onUpdate', (event, data) => {
      clearTimeout(it);
      // stdout
      // stderr
      console.log(data);
      if (!data.stderr) {
        if (data.stdout.indexOf('不存在') !== -1) {
          this.update.msg = '未找到更新文件';
          this.update.sucess = 3;
        } else {
          this.update.msg = '更新成功，需重启！';
          this.update.sucess = 1;
        }
      } else {
        this.update.msg = data.stderr;
        this.update.sucess = 2;
      }
      this.cdr.detectChanges();
      return;
    });
  }
  onCancel() {
    this.update = {
      state: false,
      msg: '正在更新...',
      sucess: 0,
      cancel: false,
      time: 0,
      files: null,
      selectFile: null,
      start: false,
      fileMsg: null,
    };
  }
  power(mode) {
    // this.appService.powerState = false;
    this.appS.power(mode);

  }
  loginOut() {
    this.appS.powerState = false;
    this.router.navigate(['/login']);
  }
  cancle() {
    console.log('取消');
    clearTimeout(this.appS.powerDelayT);
    this.appS.powerDelayT = null;
  }

  test(value) {
    this.e.ipcRenderer.send('test', { data: value, out: 'test' });

    this.e.ipcRenderer.once('test', (event, data) => {
      this.testMsg = data;
      this.cdr.detectChanges();
    });
  }
  /** 打开天使面板 */
  openDevTools() {
    this.e.ipcRenderer.send('openDevTools');
  }
  /** 选择更新文件 */
  getUpdateFile() {
    this.update.selectFile = this.e.remote.dialog.showOpenDialog({
      properties: ['openFile'],
      filters: [{ name: '更新文件', extensions: ['zldeb'] }]
    })[0];
  }
  /** 设置软件端 */
  funcSetPlatform() {
    localStorage.setItem('platform', this.setPlatform);
    this.appS.platform = localStorage.getItem('platform');
    this.appS.setPlatFormName();
    this.router.navigate(['/login']);
  }
  selectUnit() {
    this.appS.codeState= true;
  }

}
