import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { DbService, DbEnum } from 'src/app/services/db.service';
import { Observable, from } from 'rxjs';
import { map, groupBy, mergeMap, toArray } from 'rxjs/operators';
import { Comp } from 'src/app/models/component';
import { GroutingTask } from 'src/app/models/grouting';
import { Menu$, MenuItem } from 'src/app/models/app';
import { trigger, state, style, transition, animate, query, stagger, group } from '@angular/animations';
import { AppService } from 'src/app/services/app.service';
import { Project } from 'src/app/models/project';
import { ActivatedRoute } from '@angular/router';
import { TensionTask } from 'src/app/models/tension';

@Component({
  selector: 'app-scroll-menu',
  templateUrl: './scroll-menu.component.html',
  styleUrls: ['./scroll-menu.component.less'],
  animations: [
    trigger('pageAnimations', [
      transition(':enter', [
        group([
          query('p', [
            style({ opacity: 0, transform: 'translateX(-100%)' }),
            stagger(-3, [
              animate('200ms cubic-bezier(0.35, 0, 0.25, 1)',
                style({ opacity: 1, transform: 'none' }))
            ]),
          ]),
          query('.state-content', [
            style({ opacity: 0, transform: 'translateY(-100%)' }),
            stagger(-3, [
              animate('0.2s 900ms cubic-bezier(0.35, 0, 0.25, 1)',
                style({ opacity: 1, transform: 'none' }))
            ]),
          ]),
        ])
      ]),
    ]),
  ]
})
export class ScrollMenuComponent implements OnInit {
  @Input() dbName;
  @Input() stateFunc: any;
  projects$: Observable<Menu$>;
  projectId: any;
  component$: Observable<Menu$>;
  componentName: any = null;
  bridge$: Observable<Menu$>;
  bridgeId: number;
  search = {
    /** 未完成 */
    unDone: false,
    /** 已完成 */
    done: false,
    /** 完成时间 */
    doneTime: null,
    /** 浇筑完成 */
    ouringTime: null
  }


  @Output() menuChange = new EventEmitter();

  constructor(
    private db: DbService,
    public appS: AppService,
    private activatedRoute: ActivatedRoute,
    private crd: ChangeDetectorRef,
  ) { }

  ngOnInit() {
    this.getProjectMenu();
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
      if (data) {
        this.reset(data);
      } else {
        console.warn('没有菜单数据', data);
      }

    });
  }
  reset(data) {
    this.projectId = data.projectId;
    this.componentName = null;
    this.selectProject();
    this.selectComponent(data.componentName);
    this.selectBridge(data.bridgeId);
  }
  /** 获取项目菜单 */
  async getProjectMenu() {
    this.projects$ = await this.db.pageData<Project>(
      DbEnum.project,
      p => (this.appS.userInfo.jurisdiction > 5 && p.jurisdiction > 5) ||
           (this.appS.userInfo.jurisdiction < 5 && p.jurisdiction < 5),
    );
  }
  /** 获取构建菜单 */
  async getComponentMenu() {
    if (!this.projectId) { return; }
    console.log('获取构建菜单');

    // tslint:disable-next-line:max-line-length
    this.component$ = from(await (this.db.pageData<any>(
      this.dbName, (o1) => true, { label: 'component', value: 'component' }))).pipe(
      map(m => {
        const data: Array<MenuItem> = []
        from(m.data).pipe(
          groupBy((g: MenuItem) => g.label),
          // 为每个分组返回一个数组
          mergeMap(group => group.pipe(toArray()))
        ).subscribe(r => {
          data.push(r[0]);
        })
        return { data, count: data.length };
      })
    );
  }
  async getBridgeMenu() {
    console.log(this.projectId, this.componentName);
    this.bridge$ = await this.db.pageData<any>(
      this.dbName,
      (g) => this.projectId === g.project && g.component === this.componentName,
      {
        label: 'name', value: 'id',
        state: this.stateFunc
      }
    );
    this.bridge$.subscribe(r => {
      this.crd.detectChanges();
    })
  }
  /** 选择项目 */
  selectProject() {
    this.getComponentMenu();
    this.appS.leftMenu = this.projectId;
  }
  /** 选择构建 */
  selectComponent(name) {

    if (!this.componentName) {
      console.log('ssss');
      this.componentName = name;
      this.getBridgeMenu();
    } else {
      this.componentName = null;
      this.bridge$ = from([0]).pipe(
        map((item: any) => null),
      );
    }
  }
  /** 选择梁 */
  async selectBridge(id) {
    this.bridgeId = id;
    this.appS.editId = id;
    let data = JSON.parse(localStorage.getItem(this.appS.userInfo.nameId)) || {};
    data = JSON.stringify(
      {
        ...data,
        url: this.appS.nowUrl,
        [this.appS.nowUrl.slice(1)]: {
          projectId: this.projectId,
          componentName: this.componentName,
          bridgeId: this.bridgeId,
        }
      }
    );
    localStorage.setItem(this.appS.userInfo.nameId, data);
    const bridge = await this.db.getFirstId(this.dbName, this.bridgeId);
    this.menuChange.emit(bridge);
  }
  /** 搜索 */
  onSerach() {

  }
}
