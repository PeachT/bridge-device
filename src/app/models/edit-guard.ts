import { Injectable } from '@angular/core';
import { CanDeactivate, Router, NavigationEnd, CanActivate } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd';
import { Observable } from 'rxjs';
import { AppService } from '../services/app.service';
import { PLCService } from '../services/plc.service';

@Injectable({ providedIn: 'root' })
export class GlobalEditGuard implements CanDeactivate<any> {
  constructor(
    private message: NzMessageService,
    private appS: AppService,
    private router: Router,
    private PLCS: PLCService
  ) { }
  canDeactivate(): boolean | Observable<boolean> | Promise<boolean> {
    const editState = this.appS.edit || this.appS.taskLiveState;
    if (editState) {
      return new Observable((observer) => {
        // this.modalService.create({
        //   nzTitle: '编辑中',
        //   nzContent: '你确定要放弃编辑吗？',
        //   nzClosable: false,
        //   nzOnOk: () => {
        //     this.apps.edit = false;
        //   }
        // });
        let msg = '请完成编辑！！';
        if (this.appS.taskLiveState) {
          msg = '正在监控任务，不允许跳转！！';
        }
        this.message.warning(msg);
        observer.next(false);
        observer.complete();
      });
    } else {
      console.log('可以跳转');
      this.appS.leftMenu = null;
      return true;
    }
  }
}


@Injectable({ providedIn: 'root' })
export class  TaskGuard implements CanActivate{
  constructor(
    private message: NzMessageService,
    private PLCS: PLCService
  ) { }
  canActivate(){
    if (this.PLCS.socketInfo.link && this.PLCS.socketInfo.state === 'success') {
      console.log('可以跳转');
      return true;
    } else {
      this.message.warning('请链接设备！！');
      return false;
    }
  }
}
