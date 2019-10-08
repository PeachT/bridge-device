import { Injectable } from '@angular/core';
import { CanDeactivate, Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd';
import { Observable } from 'rxjs';
import { AppService } from '../services/app.service';

@Injectable({ providedIn: 'root' })
export class GlobalEditGuard implements CanDeactivate<any> {
  constructor(
    private message: NzMessageService,
    private appS: AppService,
    private router: Router
  ) { }
  canDeactivate(): boolean | Observable<boolean> | Promise<boolean> {
    const editState = this.appS.edit || this.appS.groutingLive;
    console.log(editState, this.router);
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
        if (this.appS.groutingLive) {
          msg = '正在压浆监控,不允许跳转！！';
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
