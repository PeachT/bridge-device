import { Project } from './project'

import { iBaseInit } from './base'

export const projectBase = {
  name: null,
  /** 监理 */
  supervisions: [],
  /** 质检员信息 */
  qualityInspector: [],
  /** 项目权限 */
  jurisdiction: 0,
  /** 其他信息 */
  otherInfo: [],
  /** 上传服务器名称 */
  uploadingName: null,
  /** 上传方式 */
  uploadingMode: false,
  /** 链接服务器数据 */
  uploadingLinkData: null
}

export const projectInit: Project = {
  ...iBaseInit,
  name: null,
  /** 监理 */
  supervisions: [],
  /** 质检员信息 */
  qualityInspectors: [],
  /** 项目权限 */
  jurisdiction: 0,
  /** 其他信息 */
  otherInfo: [],
  /** 上传服务器名称 */
  uploadingName: null,
  /** 上传方式 */
  uploadingMode: false,
  /** 链接服务器数据 */
  uploadingLinkData: null
}
