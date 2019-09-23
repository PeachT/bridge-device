import {
  ActionReducerMap,
  MetaReducer,
  Action
} from '@ngrx/store';
import { environment } from '../../../environments/environment';
import { routerReducer } from './router.reducers';
import { InjectionToken } from '@angular/core';
import { RouterInfo } from 'src/app/models/app';

export interface NgrxState {
  routerInfo: RouterInfo
}

export const ROOT_REDUCERS = new InjectionToken<
  ActionReducerMap<NgrxState, Action>
>("Root Reducers token", {
  factory: () => ({
    routerInfo: routerReducer
  })
});

// export const ROOT_REDUCERS: ActionReducerMap<AppState, Action> = {
//   routerInfo :routerReducer
// };


export const metaReducers: MetaReducer<NgrxState>[] = !environment.production ? [] : [];
