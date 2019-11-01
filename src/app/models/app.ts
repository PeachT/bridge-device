export interface RouterInfo {
  url: string;
  state?: boolean;
}
/** 菜单 */
export interface MenuItem {
  label: string;
  value: any;
  state?: any;
}
export interface Menu$ {
  data: Array<any> | Array<MenuItem>;
  count?: number;
}
