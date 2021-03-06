import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { DB, DbService } from 'src/app/services/db.service';
import { NzMessageService } from 'ng-zorro-antd';
import { AppService } from 'src/app/services/app.service';
import { User } from 'src/app/models/user.models';
import { Router } from '@angular/router';
import { randomWord } from 'src/app/Function/randomWord';
import { PLCService } from 'src/app/services/PLC.service';
import { PLC_D, PLC_M } from 'src/app/models/IPCChannel';
import { decodeLock } from 'src/app/Function/lock';

const menus = [
  { platform: 'tension,windows', jurisdiction: 0, url: '/task', icon: 'swap', name: '张拉' },
  { platform: 'grouting,windows', jurisdiction: 0, url: '/grouting', icon: 'experiment', name: '压浆' },
  { platform: 'tension,windows', jurisdiction: 1, url: '/jack', icon: 'usb', name: '千斤顶' },
  { platform: 'all', jurisdiction: 1, url: '/project', icon: 'appstore', name: '项目' },
  { platform: 'all', jurisdiction: 1, url: '/component', icon: 'deployment-unit', name: '构建' },
  { platform: 'all', jurisdiction: 1, url: '/user', icon: 'user', name: '用户' },
  { platform: 'tension', jurisdiction: 0, url: '/manual', icon: 'deployment-unit', name: '手动' },
  { platform: 'tension', jurisdiction: 1, url: '/setting', icon: 'setting', name: '张拉设置' },
  { platform: 'grouting,windows', jurisdiction: 1, url: '/grouting-setting', icon: 'setting', name: '压浆设置' },
  { platform: 'tension', jurisdiction: 8, url: '/auto', icon: 'box-plot', name: '自动' },
  { platform: 'all', jurisdiction: 0, url: '/help', icon: 'question', name: '帮助'},
];
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.less']
})
export class LoginComponent implements OnInit {
  validateForm: FormGroup;
  db: DB;
  dyLogin = null;
  users = [];
  sUsers = [];
  msg = null;
  lock = null;

  constructor(
    public appS: AppService,
    private fb: FormBuilder,
    private odb: DbService,
    private message: NzMessageService,
    private router: Router,
    public PLCS: PLCService,
    private cdr: ChangeDetectorRef,
  ) {
    this.db = this.odb.db;
  }

  ngOnInit() {
    this.validateForm = this.fb.group({
      userName: [this.appS.platform === 'debug' ? 'Administrator' : null, [Validators.required]],
      password: [this.appS.platform === 'debug' ? 'admin' : null, [Validators.required]]
    });
    // tslint:disable-next-line:no-unused-expression
    return new Promise((resolve, reject) => {
      this.db.users.filter(f => f.jurisdiction < 8).toArray().then((d) => {
        console.log(d);
        this.users = d.map(item => {
          return item.name;
        });
        resolve();
      }).catch(() => {
        this.message.error('获取菜单数据错误!!');
        reject();
      });
    });
  }

  submitForm() {
    if (this.dyLogin) {
      return;
    }
    console.log('1111111111111111111');
    this.dyLogin = setTimeout(() => {
      this.dyLogin = null;
      this.login();
    }, 1000);
  }
  adminLogin() {
    clearTimeout(this.dyLogin);
    this.dyLogin = null;
    this.login(true);
    console.log('22222222222222222');
  }
  login(jurisdiction = false) {
    // tslint:disable-next-line:forin
    for (const i in this.validateForm.controls) {
      this.validateForm.controls[i].markAsDirty();
      this.validateForm.controls[i].updateValueAndValidity();
    }
    const value = this.validateForm.value;
    console.log(value, jurisdiction, (jurisdiction && 1 >= 5));
    this.db.users.filter(a => a.name === value.userName && a.password === value.password &&
      ((!jurisdiction && a.jurisdiction < 5) || (jurisdiction && a.jurisdiction >= 5)))
      .first().then((user: User) => {
        console.log(user);
        if (user) {
          // sessionStorage.setItem('user', JSON.stringify(admin));
          this.appS.userInfo = {
            name: user.name,
            jurisdiction: user.jurisdiction,
            nameId: `${user.name}-${user.id}`,
            operation: user.operation || []
          };
          const stateTension = localStorage.getItem('stateTension');
          console.log('stateTension', stateTension, localStorage.getItem('stateTension'));
          this.message.success('登录成功🙂');
          this.appS.menus = menus.filter(menu => {
            if (this.appS.platform === 'debug') {
              return true;
            } else if (menu.platform === 'all') {
              return menu.jurisdiction <= user.jurisdiction;
            } else if (menu.platform.indexOf(this.appS.platform) > -1 ) {
              return menu.jurisdiction <= user.jurisdiction;
            }
          });
          if (stateTension) {
            this.router.navigate(['/auto']);
          } else if (this.appS.platform === 'tension') {
            this.router.navigate(['/task']);
          } else if (this.appS.platform === 'grouting') {
            this.router.navigate(['/grouting']);
          } else {
            const url = JSON.parse(localStorage.getItem(this.appS.userInfo.nameId));
            console.log('fsdkjflsdfjsdklfjsdj', url);
            if (!url) {
              this.router.navigate(['/task']);
            } else {
              this.router.navigate([url.url]);
            }
          }
        } else {
          this.message.error('登录失败😔');
        }
      }).catch(() => {
      });
  }
  // usersInput(value: string): void {
  //   this.sUsers = this.users.filter(option => option.toLowerCase().indexOf(value.toLowerCase()) === 0);
  // }
  touch(msg) {
    console.log(msg);
  }
  /** 解锁 */
  onLock() {
    const j4 = decodeLock(this.lock, this.PLCS.lock.code);
    if (j4) {
      this.PLCS.ipcSend('zF016', PLC_D(3900), [j4.slice(0, 4), j4.slice(4, 8), j4.slice(8, 12), j4.slice(12, 16)]).then(() => {
        this.message.success('解锁成功');
        this.PLCS.lock.success = false;
        const nowTime = Math.round(new Date().getTime() / 1000);
        const lockTime = Number(j4);
        this.lock.state = true;
        if (nowTime < lockTime) {
          this.lock.success = false;
          this.PLCS.ipcSend(`cF05`, PLC_M(0), true);
        }
      });
    } else {
      this.message.warning('验证码错误');
      this.PLCS.getLockID();
    }
  }
  runPLC() {
    this.PLCS.lock = {
      state: false,
      success: true,
      code: null,
    };
    const lastTime = Number(localStorage.getItem('lastTime'));
    const nowTime = new Date().getTime();
    if (nowTime < lastTime) {
      this.appS.lock = true;
    } else {
      this.PLCS.runSocket();
    }
  }
}
