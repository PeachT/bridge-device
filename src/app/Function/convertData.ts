import { TensionStage, TensionHoleTask } from '../models/tension';

/** 字符串转Int16Array */
export function stringToInt16Array(str: string, length: number) {
  const bytes = new Array();
  let c;
  const len = str.length;
  for(let i = 0; i < len; i++) {
      c = str.charCodeAt(i);
      if(c >= 0x010000 && c <= 0x10FFFF) {
          bytes.push(((c >> 18) & 0x07) | 0xF0);
          bytes.push(((c >> 12) & 0x3F) | 0x80);
          bytes.push(((c >> 6) & 0x3F) | 0x80);
          bytes.push((c & 0x3F) | 0x80);
      } else if(c >= 0x000800 && c <= 0x00FFFF) {
          bytes.push(((c >> 12) & 0x0F) | 0xE0);
          bytes.push(((c >> 6) & 0x3F) | 0x80);
          bytes.push((c & 0x3F) | 0x80);
      } else if(c >= 0x000080 && c <= 0x0007FF) {
          bytes.push(((c >> 6) & 0x1F) | 0xC0);
          bytes.push((c & 0x3F) | 0x80);
      } else {
          bytes.push(c & 0xFF);
      }
  }
  // return bytes;
  return Array.from(new Int16Array([...bytes, ...[...Array(length)].map(_ => 0)].slice(0, length)));
}
/**
 * unicode字符转Int16
 *
 * @export
 * @param {string} str 字符串
 * @param {number} length 返回长度
 * @returns 返回Int16 数组
 */
export function stringUnicode2Int16(str: string, length: number): Array<number> {
  const arrInt16 = [];
  for (let i = 0; i < str.length; i++) {
      const code = str.charCodeAt(i);
      const code16 = code.toString(16);
      // console.log(parseInt(`${code16}`, 16))
      arrInt16.push(parseInt(`${code16}`, 16))
  }
  return [...arrInt16, ...[...Array(length)].map(_ => 0)].slice(0, length);
}

