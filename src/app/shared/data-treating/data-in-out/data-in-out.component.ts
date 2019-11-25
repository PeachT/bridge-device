import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Observable, from, pipe } from 'rxjs';
import { DbService, DbEnum } from 'src/app/services/db.service';
import { map, groupBy, mergeMap, toArray } from 'rxjs/operators';
import { Comp } from 'src/app/models/component';
import { AppService } from 'src/app/services/app.service';
import { Project } from 'src/app/models/project';
import { GroutingTask, GroutingInfo, GroutingHoleItem } from 'src/app/models/grouting';
import { Menu$, MenuItem } from 'src/app/models/app';
import { ElectronService } from 'ngx-electron';
import { unit } from 'src/app/Function/unit';
import { downloadFile } from 'src/app/Function/dowmloadFile';
import { inHMIFile } from './inHMIFile';
import { format } from 'date-fns';
import { utf8_to_b64 } from 'src/app/Function/stringToBase64';
import { compress, decompress, compressToEncodedURIComponent, decompressFromEncodedURIComponent } from 'lz-string'
import { groutingHoleItemInit } from 'src/app/models/groutingInit';
import { copyAny } from 'src/app/models/baseInit';

@Component({
  selector: 'app-data-in-out',
  templateUrl: './data-in-out.component.html',
  styleUrls: ['./data-in-out.component.less']
})
export class DataInOutComponent implements OnInit {
  operation: string;
  operationMode: string;
  tempPath = '没有选择路径';
  savePath = '没有选择路径';
  inFilePath = '没有选择路径';
  datas: Array<any> = [];
  selectList: Array<any> = [];
  projectId: number;
  projects$: Observable<Menu$>;
  tempId: number;
  templates$: Observable<Menu$>;
  componentName: string;
  component$: Observable<Menu$>;
  bridge$: Observable<Menu$>;
  bridges: Array<any> = [];
  exportData = {
    state: false,
    num: 0,
    add: [],
    merge: [],
    jump: [],
    success: false,
    error: null,
    errorState: false,
    percentage: null
  }
  inHMIData: any;

  constructor(
    public db: DbService,
    public appS: AppService,
    public e: ElectronService,
    private cdr: ChangeDetectorRef,
  ) { }

  ngOnInit() {
    this.getProjectMenu();
  }
  createSavePath(path: string): string {
    let obj = null;
    if (this.e.isWindows) {
      obj = path.lastIndexOf(`\\`);
    } else if (this.e.isLinux) {
      obj = path.lastIndexOf(`/`);
    }
    return path.substr(0, obj);
  }
  /** 获取项目菜单 */
  async getProjectMenu() {
    this.projects$ = await this.db.pageData<Project>(
      DbEnum.project,
      p => this.appS.userInfo.jurisdiction >= p.jurisdiction,
    );
    this.projects$.subscribe(r => {
      if (r.data.length === 1) {
        this.projectId = r.data[0].value;
        this.selectOperation();
      }
    })
  }
  /** 选择项目 */
  selectProject() {
    console.log('1231213', this.operationMode);

    this.componentName = null;
    this.tempId = null;
    this.selectOperation();
  }
  /** 获取模板菜单 */
  async getTemplateMenu() {
    if (!this.projectId) { return; }
    this.templates$ = await this.db.pageData<GroutingTask>(
      DbEnum.grouting,
      (g) => this.projectId === g.project && g.template
    );
    this.templates$.subscribe(r => {
      if (r.data.length === 1) {
        this.tempId = r.data[0].value;
      }
    })
  }

  /** 获取构建菜单 */
  async getComponentMenu() {
    if (!this.projectId) { return; }
    // tslint:disable-next-line:max-line-length
    this.component$ = from(await (this.db.pageData<GroutingTask>(DbEnum.grouting, (o1) => true, { label: 'component', value: 'component' }))).pipe(
      map(m => {
        const data: Array<MenuItem> = []
        from(m.data).pipe(
          groupBy((g: MenuItem) => g.label),
          // 为每个分组返回一个数组
          mergeMap(group => group.pipe(toArray()))
        ).subscribe(r => {
          data.push(r[0]);
        })
        return { data, count: data.length };
      })
    );
    this.component$.subscribe(r => {
      if (r.data.length === 1) {
        this.componentName = r.data[0].value;
        this.selectComponent();
      }
    })
  }
  /** 获取梁菜单 */
  async getBridge() {
    if (!this.componentName) { return; }
    this.bridge$ = await this.db.pageData<GroutingTask>(
      DbEnum.grouting,
      (g) => this.projectId === g.project && g.component === this.componentName,
      {
        label: 'name', value: 'id',
        state: g => {
          return g.groutingInfo.map(item => {
            return { name: item.name, state: item.state }
          })
        }
      }
    );
  }
  /** 选择构建 */
  selectComponent() {
    console.log(this.componentName);
    this.getBridge();
  }
  /** 操作选择 */
  selectOperation(state = false) {
    if (state) {
      this.savePath = '';
      this.inFilePath = '';
      this.tempPath = '';
    }
    this.reset();
    if (this.operation.indexOf('in') > -1) {
      this.initBridge('in', state);
      if (this.operation === 'inHMI' && !this.tempId) {
        this.getTemplateMenu();
      }
    } else {
      this.initBridge('out');
      if (!this.componentName) {
        this.getComponentMenu();
      }
    }
    // this.selectOperation();
  }
  initBridge(start: string, state = false) {
    console.log(this.operationMode);
    if (this.operationMode !== start || (start === 'in' && state)) {
      this.bridge$ = from([0]).pipe(
        map((item: any) => null),
      );
      this.bridges = [];
    }
    this.operationMode = start;
    console.log(this.operationMode);
  }
  /** 选择模板路径 */
  async selectTempPath() {
    this.tempPath = await this.e.remote.dialog.showOpenDialogSync({
      title: '选择导出模板',
      properties: ['openFile'],
      buttonLabel: '确认模板',
      filters: [{ name: '模板', extensions: ['yjtmp'] }]
    })[0];

    this.savePath = this.createSavePath(this.tempPath);
    console.log(this.tempPath, this.savePath);
  }
  /** 选择保存路径 */
  selectSavePath() {
    this.savePath = this.e.remote.dialog.showOpenDialog({ properties: ['openDirectory'] })[0];
  }
  /** 选择导入文件 */
  selectInFilePath(e) {
    const file = e.srcElement.files[0];
    e.target.value = '';
    console.log(file, e);
    if (file) {
      const fr = new FileReader();
      fr.onload = () => {
        let itemMenus = [];
        if (this.operation === 'inHMI') {
          // console.log(fr.result);
          // console.log(new TextDecoder('utf-8').decode(fr.result as any));
          // console.log(new TextDecoder('unicode').decode(fr.result as any));
          // console.log(new TextDecoder('utf-16').decode(fr.result as any));
          const str = new TextDecoder('unicode').decode(fr.result as any);

          this.inHMIData = inHMIFile(str);
          itemMenus = this.inHMIData.map(item => {
            const state = item.groups.map(g => ({ name: `${g.name}${g.groups.length > 1 ? `^${g.groups.length}` : ''}`, state: 2 }));
            return { label: item.name, value: item.name, state };
          });
        }
        if (this.operation === 'inData') {
          const str = new TextDecoder('utf-8').decode(fr.result as any);
          const comstr = decompressFromEncodedURIComponent(str);
          this.inHMIData = JSON.parse(comstr);
          itemMenus = this.inHMIData.map((item: GroutingTask) => {
            const state = item.groutingInfo.map(g => ({ name: g.name, state: g.state }));
            return { label: item.name, value: item.name, state };
          })
        }
        console.log(this.inHMIData);
        console.log(itemMenus);


        this.bridge$ = from([0]).pipe(
          map((item: any) => ({ data: itemMenus, count: itemMenus.length })),
        );
        console.log(this.bridge$);
        this.inFilePath = file.path;
        // downloadFile('download.txt', snippet);
      }
      if (this.operation === 'inHMI') {
        fr.readAsArrayBuffer(file);
      }
      if (this.operation === 'inData') {
        fr.readAsArrayBuffer(file);
      }
    }
  }

  /** 选择梁 */
  selectBridge(value: string, ) {
    const index = this.bridges.indexOf(value);
    if (index > -1) {
      // 有则移出
      this.bridges.splice(index, 1);
    } else {
      // 无则添加
      this.bridges.push(value);
    }
    console.log(this.bridges);
  }
  ok() {
    this[`${this.operation}OK`]();
  }
  /** 重置 */
  reset() {
    this.exportData = {
      state: false,
      num: 0,
      add: [],
      merge: [],
      jump: [],
      success: false,
      error: null,
      errorState: false,
      percentage: null
    }
  }
  /** 确定导入HMI数据 */
  async inHMIOK() {
    const id = this.tempId;
    console.log(id);
    this.exportData.state = true;
    const tempdata: GroutingTask = await this.db.db.grouting.filter(g => g.id === id).first();
    this.inHMIData.filter(f => this.bridges.indexOf(f.name) !== -1).map(g => {
      const groutingInfo = g.groups.map(item => {
        const r: GroutingInfo = {
          ...tempdata.groutingInfo[0],
          name: item.name,
          state: 2,
          uploading: false,
          groups: item.groups.map(hs => {
            return {
              ...copyAny(groutingHoleItemInit),
              direction: tempdata.groutingInfo[0].groups[0].direction,
              setPulpvolume: tempdata.groutingInfo[0].groups[0].setPulpvolume,
              setVacuumPumpPressure: tempdata.groutingInfo[0].groups[0].setVacuumPumpPressure,
              setGroutingPressure: hs.setMpa,
              startDate: hs.startDate,
              endDate: hs.endDate,
              intoPulpPressure: hs.steadyMpa,
              steadyTime: hs.steadyTime
            }
          })
        }
        return r;
      })
      const bridge: GroutingTask = {
        ...tempdata,
        name: g.name,
        tensionDate: null,
        castingDate: null,
        template: false,
        mixingInfo: [],
        groutingInfo
      };
      delete bridge.id;
      this.saveDB(bridge);
    })
  }
  /** 导入数据 */
  inDataOK() {
    this.inHMIData.filter(f => this.bridges.indexOf(f.name) !== -1).map(g => {
      this.saveDB(g);
    })
  }
  /** 保存到数据库 */
  async saveDB(bridge: GroutingTask) {
    /** 重复判断 */
    const count = await this.db.repetitionAsync('grouting',
    (o: GroutingTask) => o.name === bridge.name && o.project === bridge.project && o.component === bridge.component);
    if (count) {
      this.exportData.jump.push(bridge.name);
      this.success(bridge.name, false);
      return;
    }
    const success = await this.db.addAsync('grouting', bridge,
      (o: GroutingTask) => o.name === bridge.name && o.project === bridge.project && o.component === bridge.component);
    this.success(bridge.name, success.success);
  }
  /** 导入导出结果 */
  success(name: string, state: boolean) {
    if (state) {
      this.exportData.add.push(name);
    } else {
      this.exportData.jump.push(name);
    }
    this.exportData.num++;
    if (this.exportData.num === this.bridges.length) {
      this.exportData.success = true;
    }
    this.exportData.percentage = (((this.exportData.num / this.bridges.length) || 0) * 100).toFixed(2);
  }
  /** 导出数据 */
  async outDataOK() {
    this.exportData.state = true;
    const datas = [];
    await this.db.db.grouting.filter(g => this.bridges.indexOf(g.id) > -1).each(item => {
      this.exportData.num++;
      datas.push(item);
    });
    const str = JSON.stringify(datas);
    const compressed64 = compressToEncodedURIComponent(str);
    downloadFile(`${format(new Date(), 'yyyy-MM-dd HH:mm:ss')}导出.yjdb`, compressed64);
  }
  /** 导出表格 */
  outExcelOK() {
    this.derivedExcel();
  }
  /** 压浆导出表格数据处理 */
  async groutingExecl(id) {
    const outdata: any = {};
    const data: GroutingTask = await this.db.db.grouting.filter(t => t.id === id).first();
    const project = await this.db.db.project.filter(p => p.id === this.projectId).first();
    outdata.project = project;

    outdata.bridgeInfo = {...data};
    outdata.bridgeInfo.groutingInfo = data.groutingInfo.map((g: GroutingInfo) => {
      return {...g, groups: g.groups.map((hg: GroutingHoleItem) => {
        // tslint:disable-next-line:max-line-length
        return {...hg, startDate: format(new Date(g.groups[0].startDate), 'HH:mm:ss'), endDate: format(new Date(g.groups[0].endDate), 'HH:mm:ss')}}
      )};
    });
    outdata.other = {};
    outdata.other.groutingDate = format(new Date(data.groutingInfo[0].groups[0].endDate), 'yyyy-MM-dd')
    console.log('导出处理后的数据', outdata);
    return outdata;
  }
  async derivedExcel() {
    if (this.exportData.num === 0) {
      this.savePath = `${this.savePath}/${format(new Date(), 'yyyy年MM月dd日hh时mm分ss秒')}导出`;
    }
    let outdata = null;
    const fileName = '压浆';
    outdata = await this.groutingExecl(this.bridges[this.exportData.num]);
    const channel = `ecxel${unit.constareChannel()}`;
    this.e.ipcRenderer.send('derivedExcel', {
      channel,
      templatePath: this.tempPath,
      outPath: this.savePath,
      data: outdata,
      fileName
    });
    this.e.ipcRenderer.once(channel, (event, data) => {
      if (data.success) {
        this.success(outdata.bridgeInfo.name, true);
        if (!(this.exportData.num === this.bridges.length)) {
          this.derivedExcel();
        }
      } else {
        this.exportData.error = '导出错误';
        this.exportData.errorState = true;
      }
      console.log('导出', data);
      this.cdr.detectChanges();
    });
  }
}
