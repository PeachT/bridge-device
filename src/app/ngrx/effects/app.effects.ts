import { Injectable } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { goRouter } from "../actions/router.action";
import { switchMap, map, filter } from "rxjs/operators";
import { Router, NavigationEnd } from "@angular/router";
import { GlobalEditGuard } from "src/app/models/edit-guard";
import { Observable } from "rxjs";
import { RouterInfo } from "src/app/models/app";

@Injectable()
export class AppEffects {
  constructor(private actions$: Actions, private router: Router) {}

  goRouter = createEffect(() =>
    this.actions$.pipe(
      ofType(goRouter),
      switchMap(action =>
        this.router.events.pipe(
          filter((event: any) => event.routerEvent instanceof NavigationEnd),
          map((event: any) => {
            if (event.routerEvent instanceof NavigationEnd) {
              return { url: event.routerEvent.url, state: false };
            } else {
              return null;
            }
          })
        )
      ),
      map(action => {
        if (action) {
          console.log(action);
          return goRouter({ routerInfo: action });
        } else {
          return;
        }
      })
    )
  );

  r(): Observable<RouterInfo> {
    return this.router.events.pipe(
      filter((event: any) => event.routerEvent instanceof NavigationEnd),
      map((event: any) => {
        console.log(
          "555555555555555555555555555555555",
          event.routerEvent,
          event.routerEvent instanceof NavigationEnd
        );
        if (event.routerEvent instanceof NavigationEnd) {
          // if (!this.appS.userInfo) {
          //   this.router.navigate(["/login"]);
          // }
          // this.appS.nowUrl = event.url;
          return { url: event.routerEvent.url, state: false };
        } else {
          return null;
        }
      })
    );
  }
}
