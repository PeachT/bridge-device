import { TensionDevice, JackItem } from './jack';
import { iBaseInit } from './base';

export const tensionDeviceInit: TensionDevice = {
  ...iBaseInit,
  name: '模拟',
  equation: false,
  jackModel: '240Q',
  pumpModel: 'CZB2X3-500',
  A1: {
    /** 千斤顶编号 */
    jackNo: '00A1',
    /** 油泵编号 */
    pumpNo: 'LQ0001',
    /** 标定系数a */
    a: 1,
    /** 标定系数b */
    b: 0,
    /** 标定日期 */
    date: new Date()
  },
  A2: {
    /** 千斤顶编号 */
    jackNo: '00A2',
    /** 油泵编号 */
    pumpNo: 'LQ0002',
    /** 标定系数a */
    a: 1,
    /** 标定系数b */
    b: 0,
    /** 标定日期 */
    date: new Date()
  },
  B1: {
    /** 千斤顶编号 */
    jackNo: '00B1',
    /** 油泵编号 */
    pumpNo: 'LQ0001',
    /** 标定系数a */
    a: 1,
    /** 标定系数b */
    b: 0,
    /** 标定日期 */
    date: new Date()
  },
  B2: {
    /** 千斤顶编号 */
    jackNo: '00B2',
    /** 油泵编号 */
    pumpNo: 'LQ0002',
    /** 标定系数a */
    a: 1,
    /** 标定系数b */
    b: 0,
    /** 标定日期 */
    date: new Date()
  }
};

export const jackItemInit: JackItem = {
  /** 千斤顶编号 */
  jackNo: '',
  /** 油泵编号 */
  pumpNo: '',
  /** 标定系数a */
  a: null,
  /** 标定系数b */
  b: null,
  /** 标定日期 */
  date: null
}
