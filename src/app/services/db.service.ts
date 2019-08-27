import { Injectable } from '@angular/core';
import Dexie from 'dexie';
import { User, userIndex } from '../models/user.models';
import { TensionTask, TaskIndex, TaskBase } from '../models/task.models';
import { Jack, JackIndex } from '../models/jack';
import { Project, projectIndex } from '../models/project';
import { Observable, from, empty } from 'rxjs';
import { filter, map, every } from 'rxjs/operators';
import { ValidationErrors } from '@angular/forms';
import { NzMessageService } from 'ng-zorro-antd';
import { Comp, compIndex } from '../models/component';
import { Menu } from '../models/menu';
import { keyGroupBy } from '../Function/groupBy';
import { AppService } from './app.service';
import { IBase } from '../models/base';
import { GroutingIndex, GroutingTask } from '../models/grouting';

@Injectable({ providedIn: 'root' })
export class DbService {
  public db: DB;
  constructor(
    private message: NzMessageService,
    private appS: AppService,
  ) {
    // tslint:disable-next-line: no-use-before-declare
    this.db = new DB();
    // this.db.open();
    console.log(this.db);
  }


  public async getOneAsync<T>(tName: string, filterFunction: (o1: T) => boolean): Promise<T> {
    return await this.db[tName].filter(filterFunction).first();
  }
  /** 判断数据是否存在 */
  // tslint:disable-next-line:max-line-length
  public async repetitionAsync<T>(tName: string, filterFunction: (o1: T) => boolean): Promise<number> {
    const count = await this.db[tName].filter(filterFunction).count();
    console.log('重复查询', count);
    return count;
  }
  /**
   * 添加一条新数据
   *
   * @template T 添加数据类型
   * @param {string} tName 库名称
   * @param {IBase} data 数据
   * @param {(o1: T) => boolean} filterFunction 存在判断
   * @returns
   * @memberof DbService
   */
  public async addAsync<T>(tName: string, data: IBase, filterFunction: (o1: T) => boolean) {
    if (await this.repetitionAsync(tName, filterFunction) > 0) {
      return { success: false, msg: '已存在' };
    }
    try {
      delete data.id;
      data.createdDate = new Date().getTime();
      data.modificationDate = new Date().getTime();
      data.user = this.appS.userInfo.name || 'sys';
      const r = await this.db[tName].add(data);
      console.log('保存结果', r);
      return { success: true, id: r };
    } catch (error) {
      console.log('错误', error);
      return { success: false, msg: error };
    }
  }
  /**
   * 修改数据
   *
   * @param {string} tName 名库称
   * @param {IBase} data 修改的数据
   * @param {(obj: any) => boolean} filterFunction 重复查询
   * @returns
   * @memberof DbService
   */
  public async updateAsync(tName: string, data: IBase, filterFunction: (obj: any) => boolean) {
    if (await this.repetitionAsync(tName, filterFunction) > 0) {
      return { success: false, msg: '已存在' };
    }
    try {
      if (tName === 'task') {
        const d: TensionTask = await this.getFirstId('task', data.id);
        const t = data as TensionTask;
        d.groups.map((g, i) => {
          if ('record' in g) {
            t.groups[i].record = g.record;
          }
        });
        t.jack = d.jack;
        data = t;
      }
      console.log('处理', data);
      data.modificationDate = new Date().getTime();
      const r = await this.db[tName].update(data.id, data);
      console.log('保存结果', r);
      return { success: true, id: data.id };
    } catch (error) {
      console.log('错误', error);
      return { success: false, msg: error };
    }
  }
  /** 导入主句查询 */
  public async inRepetitionAsync(filterFunction: (o1: TensionTask) => boolean): Promise<TensionTask> {
    const task = await this.db.task.filter(filterFunction).first();
    return task;
  }
  /** 导入数据添加 */
  public async inAddTaskAsync(data: TensionTask) {
    try {
      const r = await this.db.task.add(data);
      console.log('保存结果', r);
      return { success: true, id: r };
    } catch (error) {
      console.log('错误', error);
      return { success: false, msg: error };
    }
  }
  public async inUpdateAsync(data: TensionTask) {
    try {
      // data.modificationDate = new Date().getTime();
      const r = await this.db.task.update(data.id, data);
      console.log('保存结果', r);
      return { success: true, id: data.id };
    } catch (error) {
      console.log('错误', error);
      return { success: false, msg: error };
    }
  }

  /** 判断数据是否存在 */
  // tslint:disable-next-line:max-line-length
  public repetition(tName: string, filterFunction: (obj: Project | TensionTask | Comp | User) => boolean): Observable<boolean> {
    return from(this.db[tName].filter(filterFunction).count()).pipe(
      map(item => {
        return item > 0;
      }),
    );
  }
  /**
   * 添加一条新数据
   *
   * @param {string} tName 表名称
   * @param {Project | TensionTask} data 数据
   * @param {{ (obj: any): boolean;}} filterFunction 判断重复
   * @returns {(Observable<number | null>)} 成功返回id 失败错误返回null'
   * @memberof DbService
   */
  public add(tName: string, data: Project | TensionTask | Comp | User,
             filterFunction: (obj: any) => boolean): Observable<number | null> {
    return this.repetition(tName, filterFunction).pipe(
      map(item => {
        return item ? Observable.create(_ => null) : from(this.db[tName].add(data));
      })
    );
  }
  public update(tName: string, data: Project | TensionTask | Comp | User,
                filterFunction: (obj: any) => boolean): Observable<number | null> {
    return this.repetition(tName, filterFunction).pipe(
      map(item => {
        return item ? Observable.create(_ => null) : from(this.db[tName].update(data.id, data));
      })
    );
  }

  public getAllAsync(name: string): Promise<any> {
    return new Promise(async (resolve, reject) => {
      const r = [];
      const s = await this.db.task.each(v => {
        r.push({ label: v.name, value: v.id, checked: false });
      });
      console.log(r, s);
      resolve(r);
    });
    // const ss = await this.db[name].toArray();
    // console.log(ss);
  }
  /**
   * * 获取菜单数据
   *
   * @param {string} name 数据库名称
   * @returns {Promise<any>}
   * @memberof DbService
   */
  public async getMenuData(name: string, f: (o1: any) => boolean = null): Promise<Array<Menu>> {
    const r = [];
    if (!f) {
      await this.db[name].each(v => {
        r.push({ name: v.name, id: v.id });
      });
    } else {
      await this.db[name].filter(f).each(v => {
        r.push({ name: v.name, id: v.id });
      });
    }
    return r;
  }
  /**
   * 获取任务分类菜单
   *
   * @param {string} dbName 库名称
   * @param {(o1: TaskBase) => boolean} f 过滤数据
   * @returns {Promise<Array<Menu>>}
   * @memberof DbService
   */
  public async getTaskComponentMenuData(dbName: string, f: (o1: TaskBase) => boolean): Promise<Array<Menu>> {
    const r = [];
    await this.db[dbName].filter((o1) => f(o1)).each(v => {
      r.push({ name: v.component, id: null });
    });
    const ar = keyGroupBy(r, 'name');
    console.log(ar);
    return ar;
  }
  /** 获取梁菜单 */
  /**
   * 获取梁菜单
   *
   * @param {string} dbName 库名称
   * @param {(o1: TaskBase) => boolean} f 过滤数据
   * @param {boolean} [state=false]
   * @param {number} [p=0] 第几页
   * @param {number} [y=0] 页数量
   * @returns {Promise<{menus: Array<Menu>, count: number}>}
   * @memberof DbService
   */
  public async getTaskBridgeMenuData(dbName: string, f: (o1: TaskBase) => boolean, state: boolean = false, p: number = 0, y: number = 0)
    : Promise<{menus: Array<Menu>, count: number}> {
    const r = [];
    const count = await this.db[dbName].filter(o1 => f(o1)).count();
    console.log(count);
    y = y || count;
    // y = count;
    await this.db[dbName].filter(o1 => f(o1))
      .reverse() // 按id 反序获取
      .offset(p) // 第几条开始
      .limit(y) // 获取几条
      .each(v => {
        if (state) {
          r.push({ title: v.name, key: v.id, isLeaf: true });
        } else {
          const cls = {
            a: false,
            b: false,
            c: false,
            d: false,
            e: false,
          };
          for (const g of v.groups) {
            if (g.record) {
              if (g.record.state === 2) {
                cls.a = true;
              } else if (g.record.state === 1) {
                cls.b = true;
              } else if (g.record.state === 3) {
                cls.c = true;
              } else if (g.record.state === 4) {
                cls.d = true;
              }
            } else {
              cls.e = true;
            }
          }
          r.push({ name: v.name, id: v.id, cls });
        }
      });
    return {menus: r, count};
  }
  /** 任务数据导出菜单 */
  public async getTaskDataTreatingProject() {
    const r = [];
    const j =  this.appS.userInfo.jurisdiction;
    await this.db.project.filter((o1: Project) => {
      if ((j < 8 && o1.jurisdiction !== 8) || j >= 8) {
        return true;
      }
    }).each(v => {
      r.push({ title: v.name, key: v.id, expanded: false });
    });
    return r;
  }
  /** 任务数据导出菜单 */
  public async getTaskDataTreatingBredge(f: (o1: TensionTask) => boolean) {
    const r = [];
    await this.db.task.filter(t => f(t)).each(t => {
      r.push({ title: t.name, key: t.id });
    });
    return r;
  }
  /** 任务数据导出菜单 */
  public async getTaskDataTreatingComponent(f: (o1: TensionTask) => boolean, key) {
    const data = await this.getTaskComponentMenuData('task', f);
    const r = [];
    data.map(name => {
      r.push({ title: name, key: [name, key], expanded: false });
    });
    return r;
  }
  /**
   * *通过ID获取一个数据
   *
   * @template T 类型
   * @param {string} name 数据库名称
   * @param {*} id id
   * @returns {Promise<T>}
   * @memberof DbService
   */
  public async getFirstId<T>(name: string, id: any): Promise<T> {
    return await this.db[name].filter(a => a.id === id).first();
  }
  /** 删除 */
  delete(id) {
    this.db.jack.delete(id);
  }
}

export class DB extends Dexie {
  users!: Dexie.Table<User, number>; // id is number in this case
  task!: Dexie.Table<TensionTask, number>; // id is number in this case
  jack!: Dexie.Table<Jack, number>; // id is number in this case
  project!: Dexie.Table<Project, number>; // id is number in this case
  comp!: Dexie.Table<Comp, number>; // id is number in this case
  grouting!: Dexie.Table<GroutingTask, number>; // id is number in this case
  // projects!: Dexie.Table<Project, number>; // id is number in this case

  public constructor() {
    super('APPDB');
    this.version(1).stores({
      users: userIndex,
      task: TaskIndex,
      jack: JackIndex,
      project: projectIndex,
      comp: compIndex,
      grouting: GroutingIndex,
    });
    this.open();
  }
}

export enum tableName {
  users = 'users',
  task = 'task',
  jack = 'jack',
  project = 'project',
  comp = 'comp',
  grouting = 'grouting',
}
