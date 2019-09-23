import { Injectable } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { goRouter } from "../actions/router.action";
import { switchMap, map, filter } from "rxjs/operators";
import { Router, NavigationEnd } from "@angular/router";

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
}
