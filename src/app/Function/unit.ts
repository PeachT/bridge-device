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
    return new Date(date);
  } else {
    return new Date();
  }
}
