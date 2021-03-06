import { Component, OnInit, Input, ChangeDetectionStrategy, ChangeDetectorRef, Output, EventEmitter } from '@angular/core';
import { Menu } from 'src/app/models/menu';
import { DbService } from 'src/app/services/db.service';
import { AppService } from 'src/app/services/app.service';
import { NzMessageService } from 'ng-zorro-antd';

@Component({
  selector: 'app-left-menu',
  templateUrl: './left-menu.component.html',
  styleUrls: ['./left-menu.component.less'],
})
export class LeftMenuComponent implements OnInit {
  @Input() dbName: string;
  @Input() menuFilter: (o1) => boolean;
  menus: Array<Menu> = [];

  @Output() menuChange = new EventEmitter();

  selectId = null;

  constructor(
    private db: DbService,
    private cdr: ChangeDetectorRef,
    public appS: AppService,
    private message: NzMessageService,
  ) { }

  ngOnInit() {
    this.getMenuData();
  }
  /** 点击菜单项 */
  async onClick(id = this.selectId) {
    console.log(id);
    if (this.appS.edit) {
      this.message.warning('请完成编辑！');
      return true;
    }
    this.appS.leftMenu = id;
    this.selectId = id;
    const data = await this.db.getFirstId(this.dbName, id);
    console.log(data);
    this.menuChange.emit(data);
    this.markForCheck();
  }
  /**
   * * 获取菜单数据
   *
   * @param {*} [id=null] 有ID直接跳转
   * @memberof LeftMenuComponent
   */
  async getMenuData(id = null) {
    if (this.menuFilter) {
      this.menus = await this.db.getMenuData(this.dbName, this.menuFilter);
    } else {
      this.menus = await this.db.getMenuData(this.dbName);
    }
    if (id) {
      this.onClick(id);
    }
    this.markForCheck();
  }
  markForCheck() {
    this.cdr.markForCheck();
  }
}
