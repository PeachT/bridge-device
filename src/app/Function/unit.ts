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
