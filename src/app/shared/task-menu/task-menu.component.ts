import {
  Component, OnInit, Input, ChangeDetectorRef, Output, EventEmitter,
  ViewChild, ElementRef
} from '@angular/core';
import { DbService } from 'src/app/services/db.service';
import { AppService } from 'src/app/services/app.service';
import { NzMessageService } from 'ng-zorro-antd';
import { TaskBase } from 'src/app/models/task.models';
import { ActivatedRoute } from '@angular/router';
import { lastDayOfWeek, lastDayOfMonth, startOfWeek, startOfMonth, getTime} from 'date-fns';
import { Project } from 'src/app/models/project';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'task-menu',
  templateUrl: './task-menu.component.html',
  styleUrls: ['./task-menu.component.less'],
})
export class TaskMenuComponent implements OnInit {
  @ViewChild('bridgeScroll', null) bridgeScrollDom: ElementRef;
  @Input() dbNmae = 'task';
  project = {
    select: null,
    menu: null,
    names: [],
    sName: null,
  };
  component = {
    select: null,
    menu: null,
  };
  bridge = {
    select: null,
    menu: null,
    count: 1,
    page: 0
  };
  pageCount = 17;
  paddingTop = 0;
  pts = [];
  sg = 0;
  sgs = true;
  sgsd = true;
  pt10 = 0;
  pt20 = 0;
  scrollTop = 0;
  setScrollTop = 0;
  filter = {
    ok: false,
    no: false,
    tension: {
      startDate: null,
      endDate: null,
      date: [],
    },
    pouring: {
      startDate: null,
      endDate: null,
      date: [],
    },
  };
  rangesDate = {本周: [startOfWeek(new Date()), lastDayOfWeek(new Date())], 本月: [startOfMonth(new Date()), lastDayOfMonth(new Date())] };

  @Output() menuChange = new EventEmitter();

  constructor(
    private db: DbService,
    private cdr: ChangeDetectorRef,
    public appS: AppService,
    private message: NzMessageService,
    private activatedRoute: ActivatedRoute,
  ) { }

  async ngOnInit() {
    await this.getProject();
    this.activatedRoute.queryParams.subscribe(queryParams => {
      let data = null;
      if (queryParams.project) {
        data = queryParams;
      } else if (this.appS.userInfo) {
        data = JSON.parse(localStorage.getItem(this.appS.userInfo.nameId));
        if (data) {
          data = data[this.appS.nowUrl.slice(1)];
        }
      }
      data = Object.assign({ project: null, component: null, selectBridge: null }, data);
      this.project.select = this.project.menu.filter(f => f.id === Number(data.project))[0];
      console.log(this.project.select);
      if (this.project.select) {
        this.project.sName = this.project.select.name;
      }
      this.res(data);
    });
  }

  res(data) {
    this.component.select = data.component;
    this.bridge.select = Number(data.selectBridge);
    console.log('路由菜单', this.project, this.component, this.bridge);
    if (this.project.select) {
      this.getProject();
    }
    if (this.component.select) {
      this.getComponent();
    }
  }

  async getProject() {
    const j =  this.appS.userInfo.jurisdiction;
    this.project.menu = await this.db.getMenuData('project', (o1: Project) => {
      if (j < 8 && o1.jurisdiction !== 8) {
        return true;
      }
      if (j >= 8) {
        return o1.jurisdiction === 8;
      }
    });
    this.project.names = this.project.menu.map(item => {
      return item.name;
    });
    console.log(this.project);
  }
  async getComponent() {
    this.component.menu = await this.db.getTaskComponentMenuData(this.dbNmae, (o1) => o1.project === this.project.select.id);
    console.log(this.component);
    if (this.component.select && this.component.menu.indexOf(this.component.select) > -1) {
      this.getBridge(this.bridge.select);
    } else {
      this.component.select = null;
      this.bridge.select = null;
      this.cdr.markForCheck();
    }
  }
  async getBridge(id = null) {
    if (!this.project.select.id ||  !this.component.select) {
      return;
    }
    this.paddingTop = 0;
    this.pts = [];
    this.sg = 0;
    this.sgs = true;
    this.sgsd = true;
    this.pt10 = 0;
    this.pt20 = 0;
    this.scrollTop = 0;
    this.setScrollTop = 0;
    this.bridgeScrollDom.nativeElement.scrollTop = 0;
    this.getBridgedb(id);
  }

  onProject() {
    this.project.select = this.project.menu.filter(f => f.name === this.project.sName)[0];
    console.log(this.project.select, this.project.menu);
    if (this.ifEdit()) { return; }
    this.bridge = { menu: [], select: null, count: 0, page: 0 };
    this.component = { menu: [], select: null };
    this.appS.leftMenu = null;
    console.log(this.project);
    this.getComponent();
  }
  onComponent(event) {
    if (this.ifEdit()) { return; }
    if (event !== this.component.select) {
      this.component.select = event;
      this.getBridge();
    } else {
      this.component.select = null;
      this.bridge.menu = [];
      this.appS.leftMenu = null;
    }
    console.log(this.component);
  }
  onBridge(event) {
    if (this.ifEdit()) { return; }
    this.bridge.select = event;
    console.log(this.bridge);
    this.onMneu();
  }

  async onMneu() {
    if (!this.bridge.select) {
      return;
    }
    const data = await this.db.getFirstId(this.dbNmae, this.bridge.select);
    console.log(data);
    this.appS.leftMenu = this.bridge.select;
    this.menuChange.emit(data);
    this.saveSelectMneu();
  }
  markForCheck() {
    this.cdr.markForCheck();
  }
  /** 保存菜单选项 */
  saveSelectMneu() {
    let data = JSON.parse(localStorage.getItem(this.appS.userInfo.nameId)) || {};
    data = JSON.stringify(
      Object.assign(data,
        {
          url: this.appS.nowUrl,
          [this.appS.nowUrl.slice(1)]: {
            project: this.project.select.id,
            component: this.component.select,
            selectBridge: this.bridge.select,
          }
        }
      ));
    console.log('保存菜单选项', data, this.appS.userInfo.nameId);
    localStorage.setItem(this.appS.userInfo.nameId, data);
  }
  ifEdit() {
    if (this.appS.edit) {
      this.message.warning('请完成编辑！');
      return true;
    }
    return false;
  }
  async bScroll(event) {
    const data = event.target;
    const scrollTop = data.scrollTop;

    // const page = Math.floor(scrollTop / (15 * 49)) * 15;
    // const top = page * 49;
    // if (top !== this.paddingTop) {
    //   await this.getBridgedb(null, page, 45);
    //   this.paddingTop = page * 49;
    //   this.setPadding(data);
    // }
    const sg = this.pt20 === 0 ? 0 : Math.floor(scrollTop / (this.pt20 + this.paddingTop));
    const sgd =  Math.floor(scrollTop / this.paddingTop);
    console.log(this.sg, sg, sgd, scrollTop, this.pt20, (this.pt20 + this.paddingTop), this.pts);
    if (sg === 1 && this.sgs) {
      this.sgs = false;
      console.log('sg=', sg);
      this.sg++;
      await this.getBridgedb(null);
      this.pts.push(this.pt20);
      this.paddingTop = this.pts.reduce((prev, cur) => prev + cur, 0);
      this.setPadding(data);
      // console.log(scrollTop, this.paddingTop, sg, this.pt20);
    }
    if (sgd === 0 && this.sgs) {
      this.sgsd = false;
      console.log('sgd=', sgd);
      this.sg--;
      await this.getBridgedb(null);
      this.pts.pop();
      this.paddingTop = this.pts.reduce((prev, cur) => prev + cur, 0);
      this.setPadding(data);
      // console.log(scrollTop, this.paddingTop, sg, this.pt20);
    }

    if (sgd === 1) {
      this.sgsd = true;
    }
    if (sg === 0) {
      this.sgs = true;
    }
    if (this.pt20 === 0) {
      this.setPadding(data);
    }

  }
  async setPadding(target) {
    const children = target.children;
    this.pt20 = 0;
    for (let index = 1; index <= 15; index++) {
      this.pt20 += children[index].offsetHeight;
    }
    console.log(this.pt20);
  }
  /** 获取梁数据 */
  async getBridgedb(id = null) {
    const menu = await this.db.getTaskBridgeMenuData(
      this.dbNmae,
      (o1: TaskBase) => {
        if (o1.project !== this.project.select.id || o1.component !== this.component.select) {
          return false;
        }
        if (this.filter.ok) {
          if (!this.filter.tension.startDate) {
            return true;
          } else if ( o1.startDate >= this.filter.tension.startDate && o1.startDate <= this.filter.tension.endDate) {
            return true;
          }
        }
        // 86400000 时间戳24小时 ms
        if (this.filter.pouring.startDate
          && (
            (getTime(Number(o1.otherInfo[0].value)) < this.filter.pouring.startDate + 86400000
            || getTime(Number(o1.otherInfo[0].value)) > this.filter.pouring.endDate + 86400000)
            )) {
          return false;
        }
        if (!this.filter.no && !this.filter.ok) {
          return true;
        }
        if (this.filter.no && !o1.startDate) {
          return true;
        }

        return false;
      },
      false, this.bridge.page * this.pageCount, this.pageCount);
    this.bridge.menu = menu.menus;
    this.bridge.count = Math.ceil(menu.count / this.pageCount);
    console.log(this.bridge.page, this.pageCount, menu);
    if (id) {
      this.onBridge(id);
    }
    this.cdr.markForCheck();
    console.log(this.bridge, id);
  }
  funcPage(state) {
    if (state) {
      this.bridge.page ++;
    } else {
      this.bridge.page --;
    }
    this.getBridgedb();
  }
  onFilter() {
    console.log(this.filter);
    this.getBridgedb(null);
    this.paddingTop = 0;
    this.getBridge();
  }
  onFilterDate(e, key) {
    this.filter[key].startDate = getTime(e[0]);
    this.filter[key].endDate = getTime(e[1]);
    this.filter[key].date = e;
    console.log(e, this.filter);
    this.getBridge();
  }
}
