import { Md5 } from "ts-md5";
import { format } from 'date-fns';
import { GroutingTask } from '../models/grouting';


/** 广州市微柏上传链接测试 */
function weepal(data: any): FormData {
  const password = Md5.hashStr(data.password);
  const formData = new FormData();
  formData.append('userId', data.user);
  formData.append('userPass', password.toString());
  formData.append('loginTag', '0');
  return formData;
}

/** 西安璐江上传链接 */
function xalj(data) {
  return `${data.url}uname=${data.user}&password=${data.password}&deviceNo=${data.deviceNo}`;
}
/** 西安璐江上传数据 */
function xaljData(data: GroutingTask) {
  // console.log(data.proportions, data.proportions[1].type, data.proportions.length >= 2);
  console.log(data);
  return data.groutingInfo.map(g => {
    let datas = [];
    if (g.groups[0].processDatas && g.groups[0].processDatas.date && g.groups[0].processDatas.date.length > 0) {
      datas = g.groups[0].processDatas.date.map((item, i) => {
        return {
          timeSeconds: i,
          state: '',
          intoPulpPressure: g.groups[0].processDatas.intoPulpPressure[i] || 0,
          outPulpPressure: g.groups[0].processDatas.outPulpPressure[i] || 0,
          intoPulpvolume: g.groups[0].processDatas.intoPulpvolume[i] || 0,
          outPulpvolume: g.groups[0].processDatas.outPulpvolume[i] || 0,
        }
      })
    } else {
      datas = [
        {
          timeSeconds: '0',
          state: '',
          intoPulpPressure: 0,
          outPulpPressure:  0,
          intoPulpvolume: 0,
          outPulpvolume: 0,
        }
      ]
    }
    return {
      /** 水泥名称 */
      cementName: data.proportionInfo.proportions[2].type || '',
      /** 压浆剂 */
      groutingAgent: data.proportionInfo.proportions[1].type || '',
      /** 梁板类型 */
      beamBoardType: data.component || '',
      /** 孔道数 */
      holeNum: data.groutingInfo.length || '',
      /** 压浆方向 */
      groutingDirection: g.groups[0].direction || '',
      /** 步骤次数 */
      stepsTimes: '',
      /** 步骤参数 */
      stepParameters: '',
      /** 初始流动速度（s） */
      initFlowVelocity: '',
      /** 流动度( ) */
      fluidity: '',
      /** 值班人员 */
      dutyPersonnel: data.operator || '',
      /** 梁号 */
      beamNO: data.name,
      /** 孔道号 */
      holeNO: g.name,
      /** 压浆模式 */
      groutingModel: '' || '',
      /** 张拉日期 yyyy-MM dd */
      stretchDrawDate: format(new Date(data.tensinDate), 'yyyy-MM-dd') || '',
      /** 钢绞线股数 */
      SteelStrandNum: g.steelStrandNum || '',
      /** 孔道内径 */
      holeDiameter: g.holeDiameter || '',
      /** 孔道长度 */
      holeLength: g.holeLength || '',
      /** 压浆日期 yyyy-MM dd */
      groutingDate: format(new Date(g.groups[0].startDate), 'yyyy-MM-dd') || '',
      /** 配合比 */
      mixingProportion: '',
      /** 水胶比 */
      waterGlueProportion: data.proportionInfo.waterBinderRatio || '',
      /** 搅拌时长(s) */
      mixingTime: (data.mixingInfo && data.mixingInfo.length) > 0 ? data.mixingInfo[0].mixingTime : '',
      /** 浆液温度 */
      SlurryTemperature: g.groups[0].slurryTemperature || '',
      /** 环境温度 */
      envTemperature: g.groups[0].envTemperature || '',
      /** 开始时间 yyyy-MM-dd HH:mm ss */
      startTime: format(new Date(g.groups[0].startDate), 'yyyy-MM-dd HH:mm:ss') || '',
      /** 结束时间 yyyy-MM-dd HH:mm ss */
      endTime: format(new Date(g.groups[0].endDate), 'yyyy-MM-dd HH:mm:ss') || '',
      /** 进浆压力( ) */
      intoPulpPressure: g.groups[0].intoPulpPressure || '',
      /** 返浆压力( ) */
      outPulpPressure: g.groups[0].outPulpPressure || '',
      /** 持压时长( ) */
      pressureHoldingTime: g.groups[0].steadyTime || '',
      /** 进浆量( ) */
      intoPulpvolume: g.groups[0].intoPulpvolume || '',
      /** 返浆量( ) */
      outPulpvolume: g.groups[0].outPulpvolume || '',
      /** 真空泵压力( ) */
      vacuumPumpPressure: g.groups[0].vacuumPumpPressure || '',
      Datas: datas
    };
  })
}

export const uploadingData = {
  weepal,
  xalj,
  xaljData
}
