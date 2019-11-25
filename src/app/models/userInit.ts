import { User } from './user.models';

import { iBaseInit } from './base';

export const userInit: User = {
  ...iBaseInit,
  /** 密码 */
  password: '',
  /** 超级管理员 */
  jurisdiction: 0,
  operation: null,
}
