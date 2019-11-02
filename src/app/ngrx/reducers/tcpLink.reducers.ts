import { Action, createReducer, on } from '@ngrx/store'
import { TcpLive } from 'src/app/models/tensionLive';
import { resetTcpLive, initTcpLive } from '../actions/tcpLink.action';

const initialState: TcpLive = {
  state: false,
  now: false,
  link: false,
  oldTime: 0,
  delayTime: '0s',
  msg: ''
}

const reducer = createReducer(
  initialState,
  on(resetTcpLive, (state, action) => ({ ...state, ...action.data })),
  on(initTcpLive, () => initialState)
);

export function tcpLiveReducer(state: TcpLive | undefined, action: Action) {
  return reducer(state, action);
}
