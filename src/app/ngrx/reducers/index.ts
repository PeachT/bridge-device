import {
  ActionReducerMap,
  MetaReducer,
  Action
} from '@ngrx/store';
import { environment } from '../../../environments/environment';
import { routerReducer } from './router.reducers';
import { InjectionToken } from '@angular/core';
import { RouterInfo } from 'src/app/models/app';
import { TensionLive } from 'src/app/models/tensionLive';
import { tensionLiveReducer } from './tensionLink.reducers';

export interface NgrxState {
  routerInfo: RouterInfo,
  tensionLive: TensionLive
}

export const ROOT_REDUCERS = new InjectionToken<
  ActionReducerMap<NgrxState, Action>
>("Root Reducers token", {
  factory: () => ({
    routerInfo: routerReducer,
    tensionLive: tensionLiveReducer
  })
});

// export const ROOT_REDUCERS: ActionReducerMap<AppState, Action> = {
//   routerInfo :routerReducer
// };


export const metaReducers: MetaReducer<NgrxState>[] = !environment.production ? [] : [];
