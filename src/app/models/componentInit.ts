import { iBaseInit } from './base'
import { Comp, Hole } from './component'

export const compInit: Comp = {
  ...iBaseInit,
  /** 梁数据 */
  hole: []
}

export const holeInit: Hole = {
  /** 名字 */
  name: '',
  /** 孔明细 */
  holes: [],// Array<string>;
  /** 图片 */
  imgBase64: null,
}
