import { Action, createReducer, on } from '@ngrx/store'
import { TensionLive } from 'src/app/models/tensionLive';
import { resetTensionLive, initTensionLive } from '../actions/tensionLink.action';

const initialState: TensionLive = {
  state: false,
  now: false,
  link: false,
  oldTime: 0,
  delayTime: '0s',
  msg: ''
}

const reducer = createReducer(
  initialState,
  on(resetTensionLive, (state, action) => ({ ...state, ...action.data })),
  on(initTensionLive, () => initialState)
);

export function tensionLiveReducer(state: TensionLive | undefined, action: Action) {
  return reducer(state, action);
}
