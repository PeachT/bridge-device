import {
  ActionReducer,
  ActionReducerMap,
  createFeatureSelector,
  createSelector,
  MetaReducer,
  Action
} from '@ngrx/store';
import { environment } from '../../../environments/environment';
import { routerReducer } from './router.reducers';
import { RouterInfo } from 'src/app/models/app';
import { InjectionToken } from '@angular/core';

export interface NgrxState {
  routerInfo
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
