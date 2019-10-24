import { GroutingTask } from '../models/grouting';
import { getDatetimeS, getJSDate } from './unit';

/** 搅拌数据时间转时间戳 */
export function gouringDate2Number(data: GroutingTask): GroutingTask {
  data.groutingInfo.map(g => {
    // g.uploading = false;
    g.groups.map(gg => {
      gg.endDate = getDatetimeS(gg.endDate);
      gg.startDate = getDatetimeS(gg.startDate);
    })
  });
  data.mixingInfo.map(m => {
    if ('startTime' in data) {
      m.startDate = (m as any).startTime;
      delete (m as any).startTime
    }
    m.startDate = getDatetimeS(m.startDate);
    m.endDate = getDatetimeS(m.endDate);
  })
  data.tensionDate = getDatetimeS(data.tensionDate);
  data.castingDate = getDatetimeS(data.castingDate);
  // data.createdDate = getDatetimeS(data.createdDate);
  return data;
}
/** 搅拌数据时间转控件显示时间 */
export function gouringOther2Date(data: GroutingTask): GroutingTask {
  data.groutingInfo.map(g => {
    // g.uploading = false;
    g.groups.map(gg => {
      gg.endDate = getJSDate(gg.endDate);
      gg.startDate = getJSDate(gg.startDate);
    })
  });
  data.mixingInfo.map(m => {
    m.startDate = getJSDate(m.startDate);
    m.endDate = getJSDate(m.endDate);
  })
  data.tensionDate = getJSDate(data.tensionDate);
  data.castingDate = getJSDate(data.castingDate);
  data.createdDate = getJSDate(data.createdDate);
  data.modificationDate = getJSDate(data.modificationDate);
  return data;
}

/** startTime设置给startDate */
export function startTimeSETstartDate() {

}
