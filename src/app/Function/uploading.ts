import { Md5 } from "ts-md5";
import { GroutingTask } from '../models/grouting';
import { format } from 'date-fns';


/** 广州市微柏上传链接测试 */
function weepal(data: any): FormData {
  const password = Md5.hashStr(data.password);
  const formData = new FormData();
  formData.append('userId', data.user);
  formData.append('userPass', password.toString());
  formData.append('loginTag', '0');
  return formData;
}

/** 西安璐江上传链接测试 */
function xalj(data) {
  return `${data.url}uname=${data.user}&password=${data.password}&deviceNo=${data.deviceNo}`;
}
function xaljData(data: GroutingTask) {
  console.log(data.proportions, data.proportions[1].type, data.proportions.length >= 2);
  console.log(format(new Date(), 'yyyy-MM-dd'));


  return data.groups.map(g => {
    return {
      cementName: data.proportions[1].type || '',
      groutingAgent: data.proportions.length >= 3 ? data.proportions[2].type : '',
      beamBoardType: data.component,
      holeNum: data.groups.length,
      groutingDirection: g.direction,
      stepsTimes: '',
      stepParameters: '',
      initFlowVelocity: data.mobility,
      fluidity: data.mobility,
      dutyPersonnel: data.user,
      beamNO: data.name,
      holeNO: g.name,
      groutingModel: '',
      stretchDrawDate: format(new Date(), 'yyyy-MM-dd'),
      SteelStrandNum: '',
      holeDiameter: '',
      holeLength: '',
      groutingDate: format(new Date(g.startDate), 'yyyy-MM-dd'),
      mixingProportion: '',
      waterGlueProportion: g.proportion,
      mixingTime: g.stirTime,
      SlurryTemperature: data.groutingTemperature || '',
      envTemperature: data.airTemperature,
      startTime: format(new Date(g.startDate), 'yyyy-MM-dd HH:mm:ss'),
      endTime: format(new Date(g.endDate), 'yyyy-MM-dd HH:mm:ss'),
      intoPulpPressure: g.steadyMpa,
      outPulpPressure: '',
      pressureHoldingTime: g.stayTime || '',
      intoPulpvolume: '',
      outPulpvolume: '',
      vacuumPumpPressure: '',
      Datas: [
        {
          timeSeconds:"0",
          intoPulpPressure:"0",
          outPulpvolume:"0",
          state1:"保压"
        }
      ]
    };
  })
}

export const uploadingData = {
  weepal,
  xalj,
  xaljData
}
