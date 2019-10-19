import { TensionDevice } from '../models/jack';
import { TensionHoleTask, RecordCompute } from '../models/tension';
// 张拉模式  =42为4顶两端 =41为4顶单端  =21为2顶A1A2单端 =22为2顶A1B1单端 =23为2顶A1A2两端
// =24为2顶B1B2两端 =25为2顶A1B1两端  =11为1顶A1单端  =12为1顶B1单端 =13为A1A2B1单端
/** 张拉模式转换顶名称 */
export function getModeStr(i: number) {
  switch (i) {
    case 42: // 4顶两端
      return ['A1', 'A2', 'B1', 'B2']
    case 41: // 4顶单端
      return ['A1', 'B1', 'A2', 'B2']
    case 21: // A1|A2单端
    case 23: // A1|A2两端
      return ['A1', 'A2']
    case 24: // B1|B2两端
      return ['B1', 'B2']
    case 22: // A1|B1单端
    case 25: // A1|B1两端
      return ['A1', 'B1']
    case 11: // A1单端
      return ['A1']
    case 12: // B1单端
      return ['B1']
    default:
      break;
  }
}
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

export function recordCompute(data: TensionHoleTask) {
  const strMode = getModeStr(data.mode);
  // RecordCompute(this.data, key, index);
  const rc: RecordCompute = {
    stage: []
  };
  let ALZ = 0;
  let BLZ = 0;
  let ABLZ = 0;
  data.record.groups.map((group, index) => {
    const stage: any = {};
    strMode.map(name => {
      // 总伸长量LZ=(LK+L1-2L0)-NS-LQ
      // 伸长量偏差DR=(LZ-LL)/LL
      // 力筋回缩量Sn=(LK-LM)-(1-σ0/σk)LQ
      const dl = group[name].mm.length - 1;
      const L0 = group[name].mm[0];
      const L1 = group[name].mm[1];
      const LK = group[name].mm[dl];

      const σ0 = group[name].mpa[0];
      const σk = group[name].mpa[dl];
      const LM = group[name].initMm;

      const LL = data.stage[name].theoryMm;
      const LQ = data.stage[name].wordMm;
      const NS = 0;
      const LZ = Number((LK - (2 * L0) + L1 - LQ - NS).toFixed(2));
      const DR = Number(((LZ - LL) / LL).toFixed(2));
      const Sn = ((LK - LM) - (1 - σ0 / σk) * LQ).toFixed(2)	;
      console.log();
      console.log();
      stage[name] = {LZ, DR, Sn};
      if (data.mode === 42 || data.mode === 23) {
        if (name.indexOf('A') > -1) {
          ALZ += LZ;
        }
      }
      if (data.mode === 42 || data.mode === 24) {
        if (name.indexOf('B') > -1) {
          BLZ += LZ;
        }
      }
      if (data.mode === 25) {
        ABLZ += LZ;
      }
    });
    rc.stage.push(stage);
  })
  if (data.mode === 42 || data.mode === 23) {
    const ALL = data.stage.A1.theoryMm;
    const ADR = Number(((ALZ - ALL) / ALL * 100).toFixed(2));
    console.log(ALZ, ALL, ADR, (ALZ - ALL), ((ALZ - ALL) / ALL));

    rc.A1LZ = ALZ;
    rc.A1DR = ADR;
  }
  if (data.mode === 42 || data.mode === 24) {
    const BLL = data.stage.B1.theoryMm;
    const BDR = Number(((BLZ - BLL) / BLL * 100).toFixed(2));
    rc.B1LZ = BLZ;
    rc.B1DR = BDR;
  }
  if (data.mode === 25) {
    const LL = data.stage.A1.theoryMm;
    const ABDR = Number(((ABLZ - LL) / LL * 100).toFixed(2));
    rc.A1LZ = ABLZ;
    rc.A1DR = ABDR;
  }
  console.log(rc);

  return rc;
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
