import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from "@angular/core";
import { Router } from "@angular/router";
import { AppService } from "src/app/services/app.service";
import { Observable } from "rxjs";
import { Store } from '@ngrx/store';
import { RouterInfo } from 'src/app/models/app';
import { goRouter } from 'src/app/ngrx/actions/router.action';
import { NgrxState } from 'src/app/ngrx/reducers';
import { trigger, transition, query, style, animate, group } from '@angular/animations';

@Component({
  selector: "app-header",
  templateUrl: "./header.component.html",
  styleUrls: ["./header.component.less"],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('routeAnimation', [
      transition('* => *', [
        query('*, :enter', style({ opacity: 0}), { optional: true }),
        query('.sider-menu, :enter', style({opacity: 1}), { optional: true }),
        group([
          query('*, :enter', animate('.5s', style({opacity: 1})), { optional: true }),
        ])
      ]),
    ])
  ]
})
export class HeaderComponent implements OnInit {

  powerState = false;
  routerInfo$ = new Observable<RouterInfo>();
  constructor(
    private router: Router,
    public appS: AppService,
    private store$: Store<NgrxState>,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.store$.dispatch(goRouter(null))
    this.routerInfo$ = this.store$.select(state => state.routerInfo);
  }

  goUrl(url) {
    this.router.navigate([url]);
  }
  ifUrl() {
    // return this.appS.nowUrl.indexOf(url) > -1;
    // return this.appS.nowUrl === url;
    return this.store$.subscribe()
  }

  power() {
    this.appS.powerState = true;
  }
}
