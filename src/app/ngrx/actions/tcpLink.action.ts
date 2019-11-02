import { createAction, props } from '@ngrx/store';
import { TcpLive } from 'src/app/models/tensionLive';

/** 修改数据 */
export const resetTcpLive = createAction(
  'Reset TcpLive',
  props<{data: TcpLive}>()
);
/** init数据 */
export const initTcpLive = createAction(
  'Init TcpLive',
  props<{data: TcpLive}>()
);
