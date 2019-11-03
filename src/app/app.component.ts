import { Component, OnInit, ChangeDetectorRef } from "@angular/core";
import { ElectronService } from "ngx-electron";
import { AppService } from "./services/app.service";
import { DbService, DB } from "./services/db.service";
import { NzMessageService } from "ng-zorro-antd";
import { User } from "./models/user.models";
import { Router, NavigationEnd } from "@angular/router";
import { getModelBase } from "./models/base";
import { Project } from "./models/project";
import { GroutingService } from "./services/grouting.service";
import { PLCService } from './services/plc.service';
import { interval, fromEvent, Observable } from 'rxjs';
import { map, debounceTime } from 'rxjs/operators';
import { format } from 'date-fns';
import { trigger, transition, style, query, animateChild, animate, group } from '@angular/animations';
import { PLCSocket } from './class/PLCSocket';
import { Store } from '@ngrx/store';
import { NgrxState } from './ngrx/reducers';
import { resetTcpLive } from './ngrx/actions/tcpLink.action';
import { TcpLive } from './models/tensionLive';
import { goRouter } from './ngrx/actions/router.action';

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.less"],
  animations: [
    trigger('routeAnimation', [
      transition('* => *', [
        query(':enter', style({ opacity: 0}), { optional: true }),
        group([
          query(':enter', animate('.3s ease-in-out', style({opacity: 1})), { optional: true }),
        ])
      ]),
    ])
  ]
})
export class AppComponent implements OnInit {
  time$ = null;
  // time$ = interval(1000).pipe(
  //   map(_ => format(new Date(), "H:mm:ss"))
  // );
  title = "bridge";
  s1 = null;
  s2 = null;
  db: DB;
  keyboardState = true;
  // router跳转动画所需参数
  routerState = true;
  routerStateCode = 'active';
  constructor(
    public e: ElectronService,
    private odb: DbService,
    public appS: AppService,
    private message: NzMessageService,
    private router: Router,

    public PLCS: PLCService,
    private store$: Store<NgrxState>,
    private crd: ChangeDetectorRef,
  ) {
    console.log("平台", this.appS.platform);
    // 判断运行环境适合是 Electron
    this.appS.Environment = navigator.userAgent.indexOf("Electron") !== -1;
    this.db = this.odb.db;

    router.events.subscribe((event: any) => {
      if (event instanceof NavigationEnd) {
        if (!this.appS.userInfo) {
          this.router.navigate(["/login"]);
        }
        console.log(event);
        this.appS.nowUrl = event.url;
        // 每次路由跳转改变状态动画切换
        this.routerState = !this.routerState;
        this.routerStateCode = this.routerState ? 'active' : 'inactive';
        this.store$.dispatch(goRouter({routerInfo: {url: event.url, state: false }}))
      }
    });
  }
  async ngOnInit() {
    this.store$.dispatch(resetTcpLive(null))
    const doby = document.getElementsByTagName('body')[0];
    console.warn(doby.offsetWidth);
    this.appS.bodyWidth = doby.offsetWidth;
    // 页面监听
    fromEvent(window, 'resize').pipe(
      debounceTime(300) // 以免频繁处理
      ).subscribe((event) => {
        // 这里处理页面变化时的操作
        this.appS.bodySize.next(doby.offsetWidth);
        this.appS.bodyWidth = doby.offsetWidth;
    });
    /** 添加管理员 */
    await this.db.users
      .count()
      .then(async data => {
        console.log("获取用户数量", data);
        if (data === 0) {
          const user: User = {
            name: "Administrator",
            password: "admin",
            jurisdiction: 9,
            operation: [],
            createdDate: new Date().getTime(),
            modificationDate: new Date().getTime(),
            user: "sys"
          };
          this.db.users
            .add(user)
            .then(() => {
              // // this.message.success("添加成功🙂");
            })
            .catch(() => {
              this.message.error("添加失败😔");
            });
          const user2: User = {
            name: "技术员",
            password: "123456",
            jurisdiction: 1,
            operation: [],
            createdDate: new Date().getTime(),
            modificationDate: new Date().getTime(),
            user: "sys"
          };
          this.db.users
            .add(user2)
            .then(() => {
              // // this.message.success("添加成功🙂");
            })
            .catch(() => {
              this.message.error("添加失败😔");
            });
          for (let index = 0; index < 10; index++) {
            const user1: User = {
              name: `admin${index}`,
              password: "admin",
              jurisdiction: 8,
              operation: [],
              createdDate: new Date().getTime(),
              modificationDate: new Date().getTime(),
              user: "sys"
            };
            this.db.users
              .add(user1)
              .then(() => {
                // this.message.success("添加成功🙂");
              })
              .catch(() => {
                this.message.error("添加失败😔");
              });
          }
        }
      })
      .catch(error => {
        console.log("数据库错误！！", error);
      });
    /** 添加测试项目 */
    await this.db.project
      .count()
      .then(data => {
        console.log("获取项目数量", data);
        if (data === 0) {
          const project: Project = getModelBase("project");
          project.name = "测试项目";
          project.jurisdiction = 8;
          delete project.id;
          this.db.project
            .add(project)
            .then(() => {
              this.message.success('数据初始化完成');
              this.router.navigate(["/help"]);
            })
            .catch(err => {
              console.log(err);
              this.message.error("项目添加失败😔");
            });
        }
      })
      .catch(error => {
        console.log("数据库错误！！", error);
      });
    let keyboard = JSON.parse(localStorage.getItem("keyboard"));
    if (!keyboard) {
      console.log("没有数据");
      keyboard = {
        number: {
          w: 240,
          h: 320
        },
        text: {
          w: 660,
          h: 320
        }
      };
      localStorage.setItem("keyboard", JSON.stringify(keyboard));
    }
    if (this.appS.Environment) {
      console.log("在 Electron 中运行");
      // 监听主进程
      this.e.ipcRenderer.on("message", (event, message) => {
        alert(message);
      });
      this.e.ipcRenderer.on("isUpdateNow", () => {
        this.s1 = "下载完成";
        alert("下载完成");
        this.e.ipcRenderer.send("isUpdateNow");
      });
      this.e.ipcRenderer.on("downloadProgress", (event, message) => {
        this.s2 = message;
      });
      // 键盘显示|隐藏
      // this.keyboard(keyboard);
    } else {
      // this.PLCS.lock = {
      //   state: true,
      //   success: false,
      //   code: null
      // };
    }
  }

  // 键盘显示|隐藏
  keyboard(keyboard) {
    document.body.addEventListener(
      "click",
      (event: any) => {
        if (event.target.localName !== "input") {
          if (this.keyboardState) {
            this.keyboardState = false;
            console.log("隐藏键盘", event.target.localName);
            this.appS.onKeyboard({
              type: "text",
              x: -10000,
              y: -10000,
              w: 0,
              h: 0
            });
          }
        } else {
          console.log(
            "键盘",
            event,
            event.target.disabled,
            event.target.readOnly
          );
          if (event.target.disabled || event.target.readOnly) {
            if (this.keyboardState) {
              this.keyboardState = false;
              console.log("隐藏键盘", event.target.localName);
              this.appS.onKeyboard({
                type: "text",
                x: -10000,
                y: -10000,
                w: 0,
                h: 0
              });
            }
            return;
          }
          this.keyboardState = true;
          keyboard = JSON.parse(localStorage.getItem("keyboard"));
          let type = event.target.type;
          // console.log('键盘', type, event);
          if (type === "password") {
            type = "text";
          }

          // console.log('0000111112222233333', event, document.body.clientWidth , document.body.clientHeight );
          if (
            (type === "number" || type === "text") &&
            event.target.classList[0] !== "ant-calendar-picker-input" &&
            event.target.classList[0] !== "ant-calendar-range-picker-input"
          ) {
            let keyType = type;
            if (type === "number" && event.target.min < 0) {
              keyType = "signed_number";
            }
            let topmag = type === "text" ? 130 : 30;
            const kwh = keyboard[type];
            // 获取元素绝对位置
            const rect = event.target.getBoundingClientRect();
            let x = Math.floor(rect.x + window.screenLeft);
            let y = Math.floor(
              rect.y + rect.height + window.screenTop + topmag
            );

            const drx = document.body.clientWidth + window.screenLeft;
            const dry = document.body.clientHeight + window.screenTop;

            const krx = x + kwh.w;
            const kry = y + kwh.h;

            x = Math.floor(krx - drx > 0 ? drx - kwh.w : x);
            topmag = 0;
            if (type === "text") {
              topmag = dry - rect.y - rect.height > 150 ? 0 : 130;
              console.log(dry - rect.y - rect.height);
            }
            y = Math.floor(
              kry - dry > 0 ? rect.y + window.screenTop - kwh.h - topmag : y
            );

            console.log("打开键盘", keyType);
            event.target.select();
            this.appS.onKeyboard({ type: keyType, x, y, w: kwh.w, h: kwh.h });
          }
        }
      },
      true
    );
  }

  onClick() {
    this.e.ipcRenderer.send("coil");
  }

  offClick() {
    this.e.ipcRenderer.send("offCoil");
  }

  updateClick() {
    this.e.ipcRenderer.send("update");
  }
  power(mode) {
    // this.appService.powerState = false;
    this.appS.power(mode);
  }
  loginOut() {
    this.appS.powerState = false;
    this.router.navigate(["/login"]);
  }
  cancle() {
    console.log("取消");
    clearTimeout(this.appS.powerDelayT);
    this.appS.powerDelayT = null;
  }
}
