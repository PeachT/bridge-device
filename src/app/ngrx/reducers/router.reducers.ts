import { Action, createReducer, on } from '@ngrx/store'
import { RouterInfo } from 'src/app/models/app';
import { goRouter, editRouter } from '../actions/router.action';

const initialState: RouterInfo = {
    url: null,
    state: false
}

const reducer = createReducer(
  initialState,
  on(goRouter, (state, action) => {
    return { ...state, ...action.routerInfo }
  }),
  on(editRouter, state => ({ ...state, state: true }))
);

export function routerReducer(state: RouterInfo | undefined, action: Action) {
  return reducer(state, action);
}
