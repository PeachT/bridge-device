import { Md5 } from "ts-md5";
import { format } from 'date-fns';
import { GroutingTask } from '../models/grouting';
import { uuid } from './unit';
import { Project } from '../models/project';
import { OtherInfo } from '../models/common';


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
    if (g.uploading) {
      return;
    }
    console.log(g);
    let datas = [];
    if (g.groups[0].processDatas && g.groups[0].processDatas.intoPulpPressure && g.groups[0].processDatas.intoPulpPressure.length > 0) {
      datas = g.groups[0].processDatas.intoPulpPressure.map((item, i) => {
        return {
          timeSeconds: `${i}`,
          state: '',
          intoPulpPressure: g.groups[0].processDatas.intoPulpPressure.length >= i ? g.groups[0].processDatas.intoPulpPressure[i] || 0 : 0,
          outPulpPressure: g.groups[0].processDatas.outPulpPressure.length >= i ? g.groups[0].processDatas.outPulpPressure[i] || 0 : 0,
          intoPulpvolume: g.groups[0].processDatas.intoPulpvolume.length >= i ? g.groups[0].processDatas.intoPulpvolume[i] || 0 : 0,
          outPulpvolume: g.groups[0].processDatas.outPulpvolume.length >= i ? g.groups[0].processDatas.outPulpvolume[i] || 0 : 0,
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
      stepsTimes: data.otherInfo && data.otherInfo.length >= 1 ? data.otherInfo[0].value : '',
      /** 步骤参数 */
      stepParameters: data.otherInfo && data.otherInfo.length >= 2 ? data.otherInfo[1].value : '',
      /** 初始流动速度（s） */
      initFlowVelocity: data.otherInfo && data.otherInfo.length >= 3 ? data.otherInfo[2].value : '',
      /** 流动度 */
      fluidity: data.otherInfo && data.otherInfo.length >= 4 ? data.otherInfo[3].value : '',
      /** 值班人员 */
      dutyPersonnel: data.operator || '',
      /** 梁号 */
      beamNO: data.name,
      /** 孔道号 */
      holeNO: g.name,
      /** 压浆模式 */
      groutingModel: data.otherInfo && data.otherInfo.length >= 5 ? data.otherInfo[4].value : '',
      /** 张拉日期 yyyy-MM dd */
      stretchDrawDate: format(new Date(data.tensionDate), 'yyyy-MM-dd') || '',
      /** 钢绞线股数 */
      SteelStrandNum: g.steelStrandNum || '',
      /** 孔道内径 */
      holeDiameter: g.holeDiameter || '',
      /** 孔道长度 */
      holeLength: g.holeLength || '',
      /** 压浆日期 yyyy-MM dd */
      groutingDate: format(new Date(g.groups[0].startDate), 'yyyy-MM-dd') || '',
      /** 配合比 */
      // tslint:disable-next-line:max-line-length
      mixingProportion: `${data.proportionInfo.proportions[2].value}:${data.proportionInfo.proportions[1].value}:${data.proportionInfo.proportions[0].value}`,
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
/** 杭州西复线上传链接 */
function hzxfUrl(data, name: string) {
  const token = data[name].TOKEN;
  return `${data.url}TOKEN=${token}`;
}
/**
 * 杭州西复线上传数据
 *
 * @param {GroutingTask} data 压浆数据
 * @param {*} sd 服务链接数据
 * @returns
 */
function hzxfDataYJ(data: GroutingTask, proj: Project) {
  const sd = proj.uploadingLinkData;
  // console.log(data.proportions, data.proportions[1].type, data.proportions.length >= 2);
  console.log(data);
  return data.groutingInfo.map(g => {
    if (g.uploading) {
      return;
    }
    console.log(g);
    const base = {
      ID: uuid(),
      TOKEN: sd.serviceData.TOKEN,
      PLATFORMDEVICEID: sd.serviceData.PLATFORMDEVICEID,
      VENDORNO: sd.VENDORNO,
      DEVICENO: sd.DEVICENOYJ,
      COMPONENTID: data.uuid ,
      ENGINEERINGNAME: getOtherValue(proj.otherInfo, '工程名称'),
      ENGINEERINGSITE: getOtherValue(proj.otherInfo, '工程部位'),
      COMPONENTPARTS: data.name,
      BEAMTYPE: data.component,
      // 砼设计强度
      CONCRETESTRENGTH: getOtherValue(data.otherInfo, '砼设计强度'),
      // 弹性模量
      MODULUSOFELASTICITY:  getOtherValue(data.otherInfo, '弹性模量'),
      // 初始流动速度
      FLOWVELOCITY: getOtherValue(data.otherInfo, '初始流动速度'),
      // 流动速度
      FLUIDITY: getOtherValue(data.otherInfo, '流动速度'),
      // 压浆顺序
      PULPINGORDER: data.sort || '未设置',
      // 操作员
      USERID: data.operator || '无',
      // tslint:disable-next-line:max-line-length
      MIXPROPORTION: `${data.proportionInfo.proportions[2].value}:${data.proportionInfo.proportions[1].value}:${data.proportionInfo.proportions[0].value}`,
    }
    return {
      ...base,
      STEELBEAMNO: g.name,
      STEELSTRAND: g.steelStrandNum || '未设置',
      PULPINGORIENTATION: g.groups[0].direction || '未设置',
      WATERRATIO: data.proportionInfo.waterBinderRatio || '未设置',
      STIRRINGTIME: (data.mixingInfo && data.mixingInfo.length) > 0 ? data.mixingInfo[0].mixingTime : 300,
      STARTDATE: format(new Date(g.groups[0].startDate), 'yyyy-MM-dd HH:mm:ss'),
      ENDDATE: format(new Date(g.groups[0].endDate), 'yyyy-MM-dd HH:mm:ss'),
      VACUUMDEGREE: g.groups[0].setVacuumPumpPressure || 0,
      CYCLETIME: g.groups[0].cycletime || 0,
      STABILIZINGPRESSURE: g.groups[0].vacuumPumpPressure || 0,
      PULPINGVOLUME: g.groups[0].intoPulpvolume || 0,
      STANDARDVOLUME: g.groups[0].setPulpvolume || 0,
      PULPINGPRESSUREIN: g.groups[0].intoPulpPressure || 0,
      PULPINGPRESSUREOUT: g.groups[0].outPulpPressure || 0,
      HOLDINGTIME: g.groups[0].steadyTime || 0,
      VOLUMECURVE: g.groups[0].processDatas ? g.groups[0].processDatas.intoPulpvolume.join(',') : '0,0', // 进浆量曲线
      PRESSUREINCURVE: g.groups[0].processDatas ? g.groups[0].processDatas.intoPulpPressure.join(',') : '0,0', // 进浆压力曲线
      PRESSUREOUTCURVE: g.groups[0].processDatas ? g.groups[0].processDatas.outPulpPressure.join(',') : '0,0',// 出浆压力曲线
      RESULT: '0',
      OTHERINFORMATION: g.groups[0].remarks || ''
    }

  })
}

function getOtherValue(other: Array<OtherInfo>, name) {
  if (other) {
    const item = other.filter(f => f.key === name);
    if (item.length > 0) {
      return item[0].value;
    }
  }
  return '未设置';
}

/**
 * 创建添加其他数据
 *
 * @export
 * @param {Array<OtherInfo>} other 原数据
 * @param {Array<string>} names 添加的key
 * @returns {Array<OtherInfo>}
 */
function createOtherFormData(other: Array<OtherInfo>, names: Array<string>): Array<OtherInfo> {
  const addOther = [];
  names.map(name => {
    const count = other.filter(o => o.key === name)[0];
    if (!count) {
      console.log(count);
      addOther.push({key: name, value: ''})
    }
  });
  return [...addOther, ...other];
}


export const uploadingData = {
  weepal,
  xalj,
  xaljData,
  hzxfUrl,
  hzxfDataYJ,
  createOtherFormData,
}
