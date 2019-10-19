import { Component, OnInit } from '@angular/core';
import { DbService, DbEnum } from 'src/app/services/db.service';
import { Observable, from } from 'rxjs';
import { map } from 'rxjs/operators';
import { Comp } from 'src/app/models/component';
import { GroutingTask } from 'src/app/models/grouting';
import { Menu$ } from 'src/app/models/app';
import { trigger, state, style, transition, animate, query, stagger, group } from '@angular/animations';

@Component({
  selector: 'app-scroll-menu',
  templateUrl: './scroll-menu.component.html',
  styleUrls: ['./scroll-menu.component.less'],
  animations: [
    trigger('pageAnimations', [
      transition(':enter', [
        group([
          query('p', [
            style({opacity: 0, transform: 'translateX(-100%)'}),
            stagger(-3, [
              animate('200ms cubic-bezier(0.35, 0, 0.25, 1)',
              style({ opacity: 1, transform: 'none' }))
            ]),
          ]),
          query('.state-content', [
            style({opacity: 0, transform: 'translateY(-100%)'}),
            stagger(-3, [
              animate('0.2s 900ms cubic-bezier(0.35, 0, 0.25, 1)',
              style({ opacity: 1, transform: 'none' }))
            ]),
          ]),
        ])
      ])
    ]),
  ]
})
export class ScrollMenuComponent implements OnInit {
  items = Array.from({length: 100000}).map((_, i) => `中文中文中文中文中文中 #${i}`);
  menu$: Observable<Menu$>;
  selectid: number;
  search = {
    /** 未完成 */
    unfinished: false,
    /** 已完成 */
    done: false,
    /** 完成时间 */
    doneTime: null,
    /** 浇筑完成 */
    ouringTime: null
  }


  constructor(
    private db: DbService,
  ) { }

  ngOnInit() {
    this.getMenu();
  }

  async getMenu() {
    this.menu$ = await this.db.pageData<GroutingTask>(
      DbEnum.grouting,
      (g) => true,
      {
        label: 'name', value: 'id',
        state: g => {
          return g.groutingInfo.map(item => {
            return item.state
          })
        }
      }
    );
  }
  /** 搜索 */
  onSerach() {

  }
}
