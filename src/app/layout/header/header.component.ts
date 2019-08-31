import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef
} from "@angular/core";
import { Router, NavigationEnd } from "@angular/router";
import { AppService } from "src/app/services/app.service";
import { ElectronService } from "ngx-electron";
import { DbService, tableName } from "src/app/services/db.service";
import { map } from "rxjs/operators";
import { Observable } from "rxjs";
import { Store } from '@ngrx/store';
import { RouterInfo } from 'src/app/models/app';
import { goRouter } from 'src/app/ngrx/actions/router.action';
import { NgrxState } from 'src/app/ngrx/reducers';

@Component({
  selector: "app-header",
  templateUrl: "./header.component.html",
  styleUrls: ["./header.component.less"]
})
export class HeaderComponent implements OnInit {

  powerState = false;
  routerInfo$ = new Observable<RouterInfo>();
  constructor(
    private router: Router,
    public appS: AppService,
    private db: DbService,
    private changeDetectorRef: ChangeDetectorRef,
    private store$: Store<NgrxState>,
  ) {}

  ngOnInit() {
    this.store$.dispatch(goRouter(null))
    this.routerInfo$ = this.store$.select(state => state.routerInfo);
  }

  goUrl(url) {
    this.router.navigate([url]);
  }
  ifUrl(url) {
    // return this.appS.nowUrl.indexOf(url) > -1;
    // return this.appS.nowUrl === url;
    return this.store$.subscribe()
  }

  power() {
    this.appS.powerState = true;
  }
}
