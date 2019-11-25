import { format, startOfDay, endOfDay, isAfter, isBefore } from 'date-fns';

function constareChannel(name: string = 't'): string {
  return `${name}${new Date().getTime()}`;
}

export const unit = {
  constareChannel
}
/** 水胶比计算 */
export function waterBinderRatio(dosage: Array<number>) {
  let count = 0;
  dosage.map((item, i) => {
    if (i > 0) {
      count += item || 0;
    }
  });
  return Number((dosage[0] / count).toFixed(2));
}
/** 获取时间戳s */
export function getDatetimeS(date: Date | string | number = null): number {
  if (date) {
    return Math.floor(new Date(date).getTime() / 1000);
  } else {
    return Math.floor(new Date().getTime() / 1000);
  }
}
/** 转JS时间 */
export function getJSDate(date: Date | string | number = null): Date {
  if (date) {
    let t;
    if (typeof date === 'number') {
      t = new Date((date) * 1000);
    } else {
      t = new Date(date);
    }
    return t;
  } else {
    return null;
  }
}

/** UUID */
export function uuid() {
  const s = [];
  const hexDigits = "0123456789abcdefghijklmnopqrstuvwsyz";
  for (let i = 0; i < 36; i++) {
      s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
  }
  s[14] = "4";  // bits 12-15 of the time_hi_and_version field to 0010
  // tslint:disable-next-line: no-bitwise
  s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1);  // bits 6-7 of the clock_seq_hi_and_reserved to 01
  s[8] = s[13] = s[18] = s[23] = "-";

  return s.join("");
}

/**
 * 获取日期的开始时间或结束
 *
 * @export
 * @param {(Date | string | number)} date
 * @param {boolean} start_end true 获取开始时间 false 获取结束数据
 * @returns {number} 返回时间戳
 */
export function dateResetTime(date: Date | string | number, start_end: boolean): Date {
  if (start_end) {
    return startOfDay(new Date(date));
  } else {
    return endOfDay(new Date(date));
  }
}

/**
 * 获取一个时间是否在另外两个时间内
 *
 * @export
 * @param {Array<Date>} cDate 0：开始 1：结束
 * @param {Date} nDate 比较时间
 * @returns
 */
export function cmp3Date(cDate: Array<Date>, nDate: Date): boolean {
  const sd = startOfDay(new Date(cDate[0]));
  const ed = endOfDay(new Date(cDate[1]));
  return isAfter(nDate, sd) && isBefore(nDate, ed);
}
