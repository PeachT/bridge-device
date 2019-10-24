/** 凌桥 */
export interface LQ {
  /** 服务器地址 */
  url: string;
  /** 用户名 */
  user: string;
  /** 密码 */
  password: string;
}
/** 西安璐江 */
export interface XALJ {
  /** 服务器地址 */
  url: string;
  /** 用户名 */
  user: string;
  /** 密码 */
  password: string;
  /** 分配序列号 */
  deviceNo: string;
}

export interface HZXF {
  url: string;
  VENDORNO: string;
  DEVICENOZL: string;
  DEVICENOYJ: string;
  debug?: boolean;
  serviceData?: {
    TOKEN: any;
    PROJECTID: any;
    PLATFORMDEVICEID: any;
    VENDORNO: any;
    DEVICENO: any;
  };
}
