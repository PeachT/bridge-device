import { getModeStr, kn2Mpa } from './tension';
import { TensionTask } from '../models/tension';

export function ifHMIData(data: TensionTask, holeIndex: number): {state: boolean, downMsg: Array<string>} {
  console.log('下载的数据', data.tensionHoleInfos[holeIndex]);
  const downMsg = [];
  const task = data.tensionHoleInfos[holeIndex].tasks[0];
  const stage = data.tensionHoleInfos[holeIndex].tasks[0].stage.knPercentage;

  getModeStr(task.mode).map(n => {
    const mpa0 = kn2Mpa((task.tensionKn * (stage[0] / 100)), task.device, n);
    const mpa1 = kn2Mpa((task.tensionKn * (stage[stage.length -1] / 100)), task.device, n);
    if (mpa0 < 0.5) {
      downMsg.push(`${n}初张拉压力过低`)
    }
    if (mpa1 > 55) {
      downMsg.push(`${n}终张拉压力过高`)
    }
    if (task.stage[n].theoryMm < 1) {
      downMsg.push(`${n}理论伸长量设置太小`)
    }
    if (task.stage[n].wordMm < 0.1) {
      downMsg.push(`${n}工作长度设置太小`)
    }
    if (task.stage[n].reboundMm < 0.1) {
      downMsg.push(`${n}回缩量设置太小`)
    }
  })
  task.stage.time.find(t => {
    if (t < 5) {
      downMsg.push('持荷时间设置不能小于5s！')
      return true;
    }
  })
  if (downMsg.length > 0) {
    return {state: true, downMsg};
  } else {
    return {state: false, downMsg};
  }
}
