import { OtherInfo } from './common';
import { IBase } from './base';

/**
 * 项目
 *
 * @export
 * @interface Project
 * @extends {Base}
 */
export interface Project extends IBase {
  /** 监理 */
  supervisions?: Array<PersonInfo>;
  /** 质检员信息 */
  qualityInspectors?: Array<PersonInfo>;
  /** 项目权限 */
  jurisdiction?: number;
  /** 其他信息 */
  otherInfo: Array<OtherInfo>;
  /** 上传服务器名称 */
  uploadingName: string;
  /** 上传方式 */
  uploadingMode: boolean;
  /** 上传服务器数据 */
  uploadingLinkData: any;
}

/** 项目索引 */
export const projectIndex = '++id,&name';

export interface PersonInfo {
  /** 名字 */
  name: string;
  /** 联系方式 */
  phone: string;
  /** 监理公司 */
  unit: string;
  /** 头像 */
  imgBase64?: any;
}

