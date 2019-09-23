import { RouterInfo } from 'src/app/models/app';

import { createAction, props } from '@ngrx/store';

/** 路由跳转 */
export const goRouter = createAction(
  'Go Router',
  props<{routerInfo: RouterInfo}>()
);
/** 编辑 */
export const editRouter = createAction(
  'Edit Router',
  props<{routerInfo: RouterInfo}>()
);
