import { createAction, props } from '@ngrx/store';
import { TensionLive } from 'src/app/models/tensionLive';

/** 修改数据 */
export const resetTensionLive = createAction(
  'Reset TensionLive',
  props<{data: TensionLive}>()
);
/** init数据 */
export const initTensionLive = createAction(
  'Init TensionLive',
  props<{data: TensionLive}>()
);
