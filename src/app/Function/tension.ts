import { TensionDevice } from '../models/jack';

/**
 * kn转mpa
 *
 * @export
 * @param {number} kn 压力kn值
 * @param {TensionDevice} jack 设备
 * @param {string} jackName 顶名称
 * @returns
 */
export function kn2Mpa(kn: number, jack: TensionDevice, jackName: string) {
  // <label nz-radio [nzValue]="true">P=aF+b F张拉控制应力KN</label>
  // <label nz-radio [nzValue]="false">F=aP+b P张拉控制应力MPa</label>
  if (jack.equation) {
    // P=aF+b
    return (kn * jack[jackName].a + jack[jackName].b).toFixed(2);
  } else {
    // F=aP+b
    return ((kn - jack[jackName].b) / jack[jackName].a).toFixed(2);
  }
}
/**
 * mpa转kn
 *
 * @export
 * @param {number} mpa 压力mpa值
 * @param {TensionDevice} jack 设备
 * @param {string} jackName 顶名称
 * @returns
 */
export function mpa2Kn(mpa: number, jack: TensionDevice, jackName: string) {
  // <label nz-radio [nzValue]="true">P=aF+b F张拉控制应力KN</label>
  // <label nz-radio [nzValue]="false">F=aP+b P张拉控制应力MPa</label>
  if (jack.equation) {
    // P=aF+b
    return ((mpa - jack[jackName].b) / jack[jackName].a).toFixed(2);
  } else {
    // F=aP+b
    return (mpa * jack[jackName].a + jack[jackName].b).toFixed(2);
  }
}

/**
 * 孔号处理
 *
 * @export
 * @param {string} name 孔号
 * @param {number} mode 张拉模式
 * @returns
 */
export function holeNameShow (name: string, mode: number) {
  const names = name.split('/');
  switch (mode) {
    case 42: // 4顶两端
      return { A1: names[0], A2: names[0], B1: names[1], B2: names[1], span: 2 };
    case 41: // 4顶单端
      return { A1: names[0], A2: names[1], B1: names[2], B2: names[3], span: 1 };
    case 21: // A1|A2单端
      return { A1: names[0], A2: names[1], span: 1 };
    case 23: // A1|A2两端
      return { A1: names[0], A2: names[0], span: 2 };
    case 24: // B1|B2两端
      return { B1: names[0], B2: names[0], span: 2 };
    case 22: // A1|B1单端
      return { A1: names[0], B1: names[1], span: 1 };
    case 25: // A1|B1两端
      return { A1: names[0], B1: names[2], span: 2 };
    case 11: // A1单端
      return { A1: names[0], span: 1 };
    case 12: // B1单端
      return { B1: names[2], span: 1 };
    default:
      break;
  }
}
