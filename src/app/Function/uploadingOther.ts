import { OtherInfo } from "../models/common";

const keys =  {
  hzxf: {
    project: ['工程名称', '工程部位'],
    grouting: ['砼设计强度', '弹性模量', '初始流动速度', '流动度'],
  },
  xalj: {
    grouting: ['步骤次数','步骤参数','初始流动速度','流动度'],
  },
}
/**
 * 创建添加其他数据
 *
 * @export
 * @param {Array<OtherInfo>} other 原数据
 * @param {Array<string>} names 添加的key
 * @returns {Array<OtherInfo>}
 */
function createOtherFormData(other: Array<OtherInfo>, names: Array<string>): Array<OtherInfo> {
  const addOther = [];
  names.map(key => {
    const count = other.filter(o => o.key === key)[0];
    if (!count) {
      console.log(count);
      addOther.push({key, value: ''})
    }
  });
  return [...addOther, ...other];
}

/**
 * 杭州西复
 *
 * @param {Array<OtherInfo>} other 原数据
 * @param {string} key 操作数据名称
 * @returns
 */
function hzxfOther(other: Array<OtherInfo>, key: 'grouting' | 'project' | 'tension'): {other: Array<OtherInfo>, unDel: Array<string>} {
  return { other : createOtherFormData(other, keys.hzxf[key]), unDel: keys.hzxf[key] };
}
/**
 * 西安璐江
 *
 * @param {Array<OtherInfo>} other 原数据
 * @param {string} key 操作数据名称
 * @returns
 */
function xaljOther(other: Array<OtherInfo>, key: 'grouting' | 'project' | 'tension'): {other: Array<OtherInfo>, unDel: Array<string>} {
  return { other : createOtherFormData(other, keys.xalj[key]), unDel: keys.xalj[key] };
}

export const upFormData = {
  keys,
  hzxfOther,
  xaljOther,
}
