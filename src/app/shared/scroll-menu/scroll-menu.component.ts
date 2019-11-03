import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectorRef, OnChanges, SimpleChanges, ChangeDetectionStrategy } from '@angular/core';
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
import { format, endOfMonth, endOfWeek, startOfWeek, startOfMonth, isAfter, isBefore } from 'date-fns/esm';
import { dateResetTime, cmp3Date } from 'src/app/Function/unit';
import { NzMessageService } from 'ng-zorro-antd';

@Component({
  selector: 'app-scroll-menu',
  templateUrl: './scroll-menu.component.html',
  styleUrls: ['./scroll-menu.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('pageAnimations', [
      transition('* => *', [
        group([
          query(':leave', [
            stagger(50, [ animate(300, style({ transform: 'translateX(-100%)' })) ])
          ], { optional: true }),
          query(':enter', [
            style({ transform: 'translateX(-100%)' }),
            stagger(50, [ animate(300, style({ transform: 'translateX(0)' })) ])
          ],
          { optional: true })
        ])
      ])
    ]),
  ]
})

export class ScrollMenuComponent implements OnInit, OnChanges {
  @Input() dbName;
  @Input() stateFunc: any;
  projects$: Observable<Menu$>;
  projectId: any;
  @Input() component$: Observable<Menu$>;
  componentName: any = null;
  bridge$: Observable<Menu$>;
  bridgeId: number;
  search = {
    /** 未完成 */
    unDone: false,
    /** 已完成 */
    done: false,
    /** 完成时间 */
    doneDate: [],
    /** 浇筑完成 */
    castingDate: []
  }
  ranges1 = { 本周: [startOfWeek(new Date()), endOfWeek(new Date())], 本月: [startOfMonth(new Date()), endOfMonth(new Date())] };

  @Output() menuChange = new EventEmitter();

  constructor(
    private db: DbService,
    public appS: AppService,
    private activatedRoute: ActivatedRoute,
    private crd: ChangeDetectorRef,
    private message: NzMessageService
  ) { }

  ngOnInit() {
    this.appS.editId = null;
    this.appS.leftMenu = null;
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

  ngOnChanges(changes: SimpleChanges) {
    console.warn('数据更新');

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
    this.onCrd(this.component$);
  }
  /** 获取梁数据 */
  async getBridgeMenu() {
    console.log(this.projectId, this.componentName);
    this.bridge$ = await this.db.pageData<TensionTask | GroutingTask>(
      this.dbName,
      (g) => {
        if (this.projectId === g.project && g.component === this.componentName) {
          if (this.dbName === 'tension') {
            const t = g as TensionTask;
            if (this.search.done && t.tensionHoleInfos.find(h => h.tasks.find(f => f.record.state > 0) !== undefined)) {
              if (this.search.doneDate.length > 0) {
                // tslint:disable-next-line:max-line-length
                if (t.tensionHoleInfos[0].tasks.find(f => f.record.groups.length > 0 && cmp3Date(this.search.doneDate, f.record.groups[0].startDate))) {
                  return true;
                }
              } else {
                return true
              }
            }
            if (this.search.unDone && t.tensionHoleInfos.find(h => h.tasks.find(f => f.record.state === 0) !== undefined)) {
              return true
            }
            if (this.search.castingDate.length > 0) {
              // tslint:disable-next-line:max-line-length
              if (cmp3Date(this.search.castingDate, t.castingDate)) {
                return true;
              }
            }
            if (!this.search.done && !this.search.unDone && this.search.doneDate.length === 0 && this.search.castingDate.length === 0) {
              return true;
            }
          } else {
            const gr = g as GroutingTask;
            if (this.search.done && gr.groutingInfo.find(f => f.state > 0)) {
              if (this.search.doneDate.length > 0) {
                // tslint:disable-next-line:max-line-length
                if (gr.groutingInfo[0].groups.find(f => cmp3Date(this.search.doneDate, f.startDate))) {
                  return true;
                }
              } else {
                return true
              }
            }
            if (this.search.unDone && gr.groutingInfo[0].groups.find(f => !f.startDate)) {
              return true
            }
            if (this.search.castingDate.length > 0) {
              // tslint:disable-next-line:max-line-length
              if (cmp3Date(this.search.castingDate, gr.castingDate)) {
                return true;
              }
            }
            if (!this.search.done && !this.search.unDone && this.search.doneDate.length === 0 && this.search.castingDate.length === 0) {
              return true;
            }
          }
        }
        return false;
      },
      {
        label: 'name', value: 'id',
        state: this.stateFunc
      }
    );
    this.onCrd(this.bridge$);
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
    if (this.appS.edit) {
      this.message.error('请完成编辑');
      return;
    }
    this.bridgeId = id;
    this.appS.editId = id;
    this.appS.leftMenu = this.projectId;
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
    console.log(this.search);
    this.getBridgeMenu();
  }
  /** 时间过滤 */
  onFilterDate(e, key) {
    console.log(e, this.search);
    this.getBridgeMenu();
  }
  /** 更新 */
  onCrd(ob) {
    const sub = ob.subscribe(r => {
      this.crd.markForCheck();
      sub.unsubscribe();
    })
  }
}
