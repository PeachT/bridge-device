import { TensionDevice } from '../models/jack';
import { TensionHoleTask, RecordCompute, TensionTask, TensionStage, TensionHoleInfo, GroupsName } from '../models/tension';
import { getDatetimeS, getJSDate } from './unit';
import { stringUnicode2Int16 } from './convertData';
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

/** 张拉结果数据计算 */
export function recordCompute(data: TensionHoleTask, length: number = null) {
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
      const dl = length === null ? group[name].mm.length - 1 : length;
      const L0 = Number(group[name].mm[0]);
      const L1 = Number(group[name].mm[1]);
      const LK = Number(group[name].mm[dl]);

      const σ0 = Number(group[name].mpa[0]);
      const σk = Number(group[name].mpa[dl]);
      const LM = Number(group[name].initMm);

      const LL = Number(data.stage[name].theoryMm);
      const LQ = Number(data.stage[name].wordMm);
      const NS = Number(data.stage[name].reboundMm);
      const LZ = Number((LK - (2 * L0) + L1 - LQ - NS).toFixed(2));
      const DR = Number(((LZ - LL) / LL).toFixed(2));
      let Sn = NaN;
      if (LM) {
        Sn = Number(((LK - LM) - (1 - σ0 / σk) * LQ).toFixed(2))	;
      }
      // console.log(LK, L0, L1, LQ, NS);
      // console.log(LZ, DR, Sn);
      stage[name] = {LZ, DR, Sn};
      if (data.mode === 42 || data.mode === 23) {
        if (name.indexOf('A') > -1) {
          Number((ALZ += LZ).toFixed(2));
        }
      }
      if (data.mode === 42 || data.mode === 24) {
        if (name.indexOf('B') > -1) {
          Number((BLZ += LZ).toFixed(2));
        }
      }
      if (data.mode === 25) {
        Number((ABLZ += LZ).toFixed(2));
      }
    });
    rc.stage.push(stage);
  })
  if (data.mode === 42 || data.mode === 23) {
    const ALL = data.stage.A1.theoryMm;
    const ADR = Number(((ALZ - ALL) / ALL * 100).toFixed(2));
    // console.log(ALZ, ALL, ADR, (ALZ - ALL), ((ALZ - ALL) / ALL));

    rc.A1LZ = Number((ALZ).toFixed(2));
    rc.A1DR = Number((ADR).toFixed(2));
  }
  if (data.mode === 42 || data.mode === 24) {
    const BLL = data.stage.B1.theoryMm;
    const BDR = Number(((BLZ - BLL) / BLL * 100).toFixed(2));
    rc.B1LZ = Number((BLZ).toFixed(2));
    rc.B1DR = Number((BDR).toFixed(2));
  }
  if (data.mode === 25) {
    const LL = data.stage.A1.theoryMm;
    const ABDR = Number(((ABLZ - LL) / LL * 100).toFixed(2));
    rc.A1LZ = Number((ABLZ).toFixed(2));
    rc.A1DR = Number((ABDR).toFixed(2));
  }
  return rc;
}

/**
 * 孔号显示处理
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
      return { A1: names[0], A2: names[0], B1: names[1], B2: names[1], span: 2, keys: 'A1B1' };
    case 41: // 4顶单端
      return { A1: names[0], A2: names[1], B1: names[2], B2: names[3], span: 1, keys: 'A1A2B1B2' };
    case 21: // A1|A2单端
      return { A1: names[0], A2: names[1], span: 1, keys: 'A1A2' };
    case 23: // A1|A2两端
      return { A1: names[0], A2: names[0], span: 2, keys: 'A1' };
    case 24: // B1|B2两端
      return { B1: names[0], B2: names[0], span: 2, keys: 'B1' };
    case 22: // A1|B1单端
      return { A1: names[0], B1: names[1], span: 1, keys: 'A1B1' };
    case 25: // A1|B1两端
      return { A1: names[0], B1: names[0], span: 2, keys: 'A1' };
    case 11: // A1单端
      return { A1: names[0], span: 1, keys: 'A1' };
    case 12: // B1单端
      return { B1: names[0], span: 1, keys: 'B1' };
    default:
      break;
  }
}

/** mode构建张拉顶数据 */
export function createHoleTask(mode: number): TensionStage {
  console.log(mode);

  const jacks: any = {}
  getModeStr(mode).map(key => {
    jacks[key] = { reboundMm: 3.5, wordMm: 5, theoryMm: 0}
  })
  return  {
    /** 张拉阶段应力百分比 */
    knPercentage: [10, 20, 50, 100],
    /** 阶段说明（初张拉 阶段一 超张拉 补张拉...） */
    msg: ['初张拉', '阶段一', '阶段二', '终张拉'],
    /** 阶段保压时间 */
    time: [30, 30, 30, 300],
    /** 卸荷比例 */
    uploadPercentage: 10,
    /** 卸荷延时 */
    uploadDelay: 10,
    /** 顶计算数据 */
    ...jacks
  }
}
/** HMI阶段数据处理 */
export function HMIstage(data: TensionTask, index: number) {
  const holeData: TensionHoleInfo = data.tensionHoleInfos[index];
  const task: TensionHoleTask = holeData.tasks[0];

  const modeStr = holeNameShow(holeData.name, task.mode);
  const jackNames = getModeStr(task.mode);
  const hn = {
    A1: [...Array(10)].map(_ => 0),
    A2: [...Array(10)].map(_ => 0),
    B1: [...Array(10)].map(_ => 0),
    B2: [...Array(10)].map(_ => 0),

  };
  const jn = {
    A1: [...Array(37)].map(_ => 0),
    A2: [...Array(37)].map(_ => 0),
    B1: [...Array(37)].map(_ => 0),
    B2: [...Array(37)].map(_ => 0),
    unicode: []
  };
  jackNames.map((key) => {
    hn[key] = stringUnicode2Int16(modeStr[key], 10);
  });
  jn.unicode = [
    ...stringUnicode2Int16(data.component, 12),
    ...stringUnicode2Int16(data.name, 30),
    ...hn.A1,
    ...hn.A2,
    ...hn.B1,
    ...hn.B2
  ]
  const d2082 = [
    // 是否二次张拉
    Number(task.twice),
    // 张拉状态
    task.record ? task.record.state : 0,
    // 张拉模式
    task.mode,
    // 备用1
    0,
    // 识别码1
    // 识别码2
    // 年月日初
    // 时分秒初
    // 年月日终
    // 时分秒终
    // 备用2
    // 备用3
    // 备用4

  ]
  const stageP = [...task.stage.knPercentage];
  const stageTime = [...task.stage.time];
  console.log(stageP);
  if (!task.super) {
    stageP.push(0);
    stageTime.push(0);
  }
  if (!task.mend) {
    stageP.push(0);
    stageTime.push(0);
  }
  console.log(stageP, stageP.length);
  if (stageP.length === 5) {
    stageP.splice(2, 0, 0, 0)
    stageTime.splice(2, 0, 0, 0)
  }
  if (stageP.length === 6) {
    stageP.splice(3, 0, 0)
    stageTime.splice(3, 0, 0)
  }
  stageP.push(task.stage.uploadPercentage);
  stageTime.push(task.stage.uploadDelay);


  jackNames.map((key) => {
    const kns = [];
    const mpas = [];
    stageP.map((item, i) => {
      let kn = 0;
      let mpa = 0;
      if (item !== 0) {
        const knp = task.tensionKn * (item / 100);
        kn = (knp);
        mpa = Number(kn2Mpa(knp, task.device, key));
      }
      kns.push(kn);
      mpas.push(mpa);
    })
    jn[key] = [
      task.tensionKn,
      0,
      task.device[key].a,
      task.device[key].b,
      task.device[key].a,
      task.device[key].b,
      ...kns,
      ...mpas,
      ...stageTime,
      // A1理论伸长值
      task.stage[key].theoryMm,
      // A1预张理论伸长
      0,
      // A1运行状态
      0,
      // A1张拉状态
      0,
      // A1压力暂存
      0,
      // A1位移暂存
      0,
      // A1千斤顶吨位
      0
    ]
  });
  const reboundWord = [
    task.stage.A1 ? task.stage.A1.reboundMm : 0,
    task.stage.A2 ? task.stage.A2.reboundMm : 0,
    task.stage.B1 ? task.stage.B1.reboundMm : 0,
    task.stage.B2 ? task.stage.B2.reboundMm : 0,
    0,
    0,
    0,
    0,
    task.stage.A1 ? task.stage.A1.wordMm : 0,
    task.stage.A2 ? task.stage.A2.wordMm : 0,
    task.stage.B1 ? task.stage.B1.wordMm : 0,
    task.stage.B2 ? task.stage.B2.wordMm : 0,
  ]
  return {percentage: stageP, time: stageTime, ...jn, reboundWord, d2082};
}

/** 张拉组状态 */
export function createGroupsName(data: TensionTask): Array<GroupsName> {
  console.log(data.tensionHoleInfos);

  return data.tensionHoleInfos.map(m => {
    let state = 0;
    const length = m.tasks.length - 1;
    if (m.tasks[length].record && m.tasks[length].record.groups) {
      state = m.tasks[length].record.state;
    }
    console.log(m.tasks);

    return { name: m.name, state, uploading: m.uploading}
  });
}
