import { Component, OnInit, OnDestroy, ViewChild, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { TensionTask, ManualGroup, TensionHoleInfo } from 'src/app/models/tension';
import { FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';
import { DbService } from 'src/app/services/db.service';
import { NzMessageService } from 'ng-zorro-antd';
import { AppService } from 'src/app/services/app.service';
import { HttpService } from 'src/app/services/http.service';
import { nameRepetition } from 'src/app/Validator/async.validator';
import { getModelBase, baseEnum } from 'src/app/models/base';
import { Observable, from } from 'rxjs';
import { map } from 'rxjs/operators';
import { Comp } from 'src/app/models/component';
import { TensionDevice } from 'src/app/models/jack';
import { TensionHolesComponent } from './tension-holes/tension-holes.component';
import { getModeStr, holeNameShow, HMIstage, kn2Mpa } from 'src/app/Function/tension';
import { ScrollMenuComponent } from 'src/app/shared/scroll-menu/scroll-menu.component';
import { PLCService } from 'src/app/services/plc.service';
import { stringUnicode2Int16 } from 'src/app/Function/convertData';
import { FC } from 'src/app/models/socketTCP';
import { PLC_D } from 'src/app/models/IPCChannel';
import { Router } from '@angular/router';
import { tensionBase } from 'src/app/models/tensionBase';
import { createForm, holeGroupForm_item, holeForm_item } from './CreateFormGroup.worker';
import { sleep } from 'sleep-ts';

@Component({
  selector: 'app-tension',
  templateUrl: './tension.component.html',
  styleUrls: ['./tension.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TensionComponent implements OnInit, OnDestroy {
  dbName = 'tension';
  @ViewChild('menu', null) menuDom: ScrollMenuComponent;
  @ViewChild('holes', null) holesDom: TensionHolesComponent;
  /** 构建选择菜单 */
  componentMneu$: Observable<Array<{ label: string; value: any; }>>;
  componentHoles = [];
  nowComponentHoleInfo: any;

  data: TensionTask = tensionBase;
  formData: FormGroup;
  /** 删除数据 */
  deleteShow = false;

  /** 选项卡显示index */
  tabsetShow = 0;
  /** 上传 */
  uploading = false;
  /** 手动分组 */
  mamualGroupState = false;
  /** 孔张拉数据 */
  holeIndex: number = null;
  /** 下载状态 */
  downState = false;
  /** 下载进度 */
  upProgress = 0;
  downMsg: Array<string> = [];
  /** 添加数据判断 */
  addFilterFun = (o1: any, o2: any) => o1.name === o2.name
    && o1.component === o2.component && o1.project === o2.project
  /** 修改数据判断 */
  updateFilterFun = (o1: TensionTask, o2: TensionTask) => o1.name === o2.name
    && o1.component === o2.component && o1.project === o2.project && o1.id !== o2.id
  /** 菜单梁状态 */
  menuStateFunc = (g: TensionTask) => {
    // console.log(g);
    return g.tensionHoleInfos.map(item => {
      return item.state
    })
  }



  constructor(
    public db: DbService,
    public appS: AppService,
    public PLCS: PLCService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private message: NzMessageService,
  ) {

  }

  ngOnInit() {
    this.getComponent();
    // setTimeout(() => {
    // }, 300);
    this.formInit();

    // if (typeof Worker !== 'undefined') {
    //   // Create a new
    //   const worker = new Worker('./CreateFormGroup.worker.ts', { type: 'module' });
    //   worker.onmessage = ({ data }) => {
    //     console.error(`web worker: ${data}`);
    //   };
    //   worker.postMessage('hello');
    // } else {
    //   console.error('web worker');
    //   // Web Workers are not supported in this environment.
    //   // You should add a fallback so that your program still executes correctly.
    // }
  }
  sortJoin(data) {
    if (data) {
      return data.join(' → ');
    } else {
      return null;
    }
  }
  /** 初始化数据 */
  formInit() {
    const data = this.data;
    // const fb = new FormBuilder();
    // this.formData = fb.group({
    //   id: [data.id],
    //   project: [data.project],
    //   /** 梁号 */
    //   name: [data.name, [Validators.required]],
    //   /** 构建 */
    //   component: [data.component, [Validators.required]],
    //   /** 梁长度 */
    //   beamLength: [data.beamLength],
    //   /** 张拉日期 */
    //   tensionDate: [data.tensionDate],
    //   /** 浇筑日期 */
    //   castingDate: [data.castingDate, [Validators.required]],
    //   /** 张拉顺序 */
    //   sort: [data.sort],
    //   /** 设备编号 */
    //   deviceNo: [data.deviceNo],
    //   /** 是否作为模板 */
    //   template: [data.template],
    //   /** 其他数据信息 */
    //   otherInfo: fb.array([]),
    //   /** 施工员 */
    //   operator: [data.operator],
    //   /** 监理员 */
    //   supervisors: [data.supervisors],
    //   /** 自检员 */
    //   qualityInspector: [data.qualityInspector],
    //   tensionHoleInfos: fb.array([], [Validators.required]),
    // });

    // this.formData.setValue(data);
    createForm(data).then(c => {
      this.formData = c;
      console.log('初始化数据', data, !data.id && data.name);
      this.formData.controls.name.setAsyncValidators([nameRepetition(this.db, this.dbName, this.updateFilterFun)]);
      this.nameValueAndValidity();
      this.formData = c;
    });
  }
  /** 获取构建菜单 */
  getComponent() {
    this.componentMneu$ = from(this.db.db.comp.toArray()).pipe(
      map(comps => {
        const arr = [];
        this.componentHoles = [];
        comps.map((item: Comp) => {
          item.hole.map((h) => {
            const value = `${item.name}/${h.name}`;
            arr.push({ label: value, value });
            this.componentHoles.push({ value, holes: h.holes })
          });
        });
        return arr;
      })
    );
  }
  /** 构建选择 */
  conponentChange(value) {
    console.log(value, this.componentHoles);
    this.nameValueAndValidity();
  }
  test() {
    // tslint:disable-next-line:forin
    for (const i in this.formData.controls) {
      console.log(
        this.formData.controls[i].valid,
        i
      );
    }
    console.log(this.formData,
      this.formData.getRawValue(),
      this.formData.valid
      // this.mixingInfoForm.value,
      // this.groutingInfoForm.value,
    );
  }
  ngOnDestroy() {
    console.log('退出');
  }
  /** 切换显示项 */
  changeTabs(value) {
    console.log(value.index);
    this.tabsetShow = value.index;
  }

  /** 切换梁 */
  async selectBridge(data: TensionTask) {
    if (!data) { return; }
    this.data = data;
    this.uploading = this.data.tensionHoleInfos.findIndex(g => !g.uploading) === -1;
    this.formInit();
    console.log('梁梁梁梁', this.data, this.uploading);
  }

  /**
   * *编辑/添加
   */
  onEdit(data: TensionTask, modification = false) {
    if (!modification) {
      /** 复制 */
      if (!data) {
        data = { ...this.data };
        data.id = null;
        data.tensionDate = null;
        data.castingDate = null;
        data.template = false;
        for (const g of data.tensionHoleInfos) {
          g.state = 0;
          g.uploading = false;
          g.tasks.map(t => {
            t.record = null;
          })
          console.log(g);
        }
        console.log(data);
        this.data = data;
        /** 添加 */
      } else {
        this.data = getModelBase(baseEnum.tension);
        this.data.project = this.menuDom.projectId;
      }
      console.log('添加', this.data);
    }
    this.formInit();
  }
  /**
   * *编辑完成
   */
  editOk(data) {
    console.log(data, this.menuDom.bridgeId);
    if (data && data.bridgeId && data.bridgeId !== this.menuDom.bridgeId) {
      this.menuDom.reset({
        projectId: data.projectId,
        componentName: data.componentName,
        bridgeId: data.bridgeId
      });
    } else {
      this.menuDom.selectBridge(this.menuDom.bridgeId);
    }
  }
  cancelEdit() {
    this.menuDom.selectBridge(this.menuDom.bridgeId);
  }
  /** 删除 */
  async delete() {
    const id = this.appS.leftMenu;
    this.deleteShow = true;
    console.log('删除', id, '任务');
  }
  async deleteOk(state = false) {
    if (state) {
      const msg = await this.db.db.tension.delete(this.appS.leftMenu);
      console.log('删除了', msg);
      this.appS.leftMenu = null;
      // this.menuDom.getBridge();
      this.menuDom.getBridgeMenu();
    }
    this.deleteShow = false;
  }
  /** 下载张拉数据 */
  async downHMI() {
    this.downMsg = [];
    if (this.downState) {
      return;
    }
    this.downState = true;
    this.upProgress = 0;
    console.log('下载的数据', this.data.tensionHoleInfos[this.holeIndex]);
    const task = this.data.tensionHoleInfos[this.holeIndex].tasks[0];
    const stage = this.data.tensionHoleInfos[this.holeIndex].tasks[0].stage.knPercentage;

    getModeStr(task.mode).map(n => {
      const mpa0 = kn2Mpa((task.tensionKn * (stage[0] / 100)), task.device, n);
      const mpa1 = kn2Mpa((task.tensionKn * (stage[stage.length -1] / 100)), task.device, n);
      if (mpa0 < 0.5) {
        this.downMsg.push(`${n}初张拉压力过低`)
      }
      if (mpa1 > 55) {
        this.downMsg.push(`${n}终张拉压力过高`)
      }
      if (task.stage[n].theoryMm < 1) {
        this.downMsg.push(`${n}理论伸长量设置太小`)
      }
      if (task.stage[n].wordMm < 0.1) {
        this.downMsg.push(`${n}工作长度设置太小`)
      }
      if (task.stage[n].reboundMm < 0.1) {
        this.downMsg.push(`${n}回缩量设置太小`)
      }
    })
    task.stage.time.find(t => {
      if (t < 5) {
        this.downMsg.push('持荷时间设置有误！')
        return;
      }
    })
    if (this.downMsg.length > 0) {
      this.message.error('数据设置有误');
      return;
    }
    const HMIData = HMIstage(this.data, this.holeIndex);
    console.log(HMIData);
    const cmdarrs = [
      { request: FC.FC16_int16, address: PLC_D(2000), value: HMIData.unicode.slice(0, 40)},
      { request: FC.FC16_int16, address: PLC_D(2040), value: HMIData.unicode.slice(40)},
      { request: FC.FC16_float, address: PLC_D(2082), value: HMIData.d2082},
      { request: FC.FC16_float, address: PLC_D(2108), value: HMIData.percentage},
      { request: FC.FC16_float, address: PLC_D(2124), value: HMIData.A1},
      { request: FC.FC16_float, address: PLC_D(2198), value: HMIData.A2},
      { request: FC.FC16_float, address: PLC_D(2272), value: HMIData.B1},
      { request: FC.FC16_float, address: PLC_D(2346), value: HMIData.B2},
      { request: FC.FC16_float, address: PLC_D(2460), value: HMIData.reboundWord},
    ];

    // tslint:disable-next-line:prefer-for-of
    for (let index = 0; index < cmdarrs.length; index++) {
      const item = cmdarrs[index]
      await this.PLCS.ipc({
        request: item.request,
        address: item.address,
        value: item.value,
        callpack: 'tensionup'
      }).then(r => console.log(r));
      if (!this.next()) {
        return;
      }
      console.log('456');
    }
    console.log('123');

    // await this.PLCS.ipc({
    //   request: FC.FC16_int16, address: PLC_D(2000),
    //   value: HMIData.unicode.slice(0, 40),
    //   callpack: 'tensionuphmi2000'
    // }).then(r => console.log(r));
    // await this.PLCS.ipc({
    //   request: FC.FC16_int16, address: PLC_D(2040),
    //   value: HMIData.unicode.slice(40),
    //   callpack: 'tensionuphmi2000'
    // }).then(r => console.log(r));
    // await this.PLCS.ipc({
    //   request: FC.FC16_float, address: PLC_D(2082),
    //   value: HMIData.d2082,
    //   callpack: 'tensionuphmi2082'
    // }).then(r => console.log(r));
    // await this.PLCS.ipc({
    //   request: FC.FC16_float, address: PLC_D(2108),
    //   value: HMIData.percentage,
    //   callpack: 'tensionuphmi2108'
    // }).then(r => console.log(r));
    // await this.PLCS.ipc({
    //   request: FC.FC16_float, address: PLC_D(2124),
    //   value: HMIData.A1,
    //   callpack: 'tensionuphmi2124'
    // }).then(r => console.log(r));
    // await this.PLCS.ipc({
    //   request: FC.FC16_float, address: PLC_D(2198),
    //   value: HMIData.A2,
    //   callpack: 'tensionuphmi2198'
    // }).then(r => console.log(r));
    // await this.PLCS.ipc({
    //   request: FC.FC16_float, address: PLC_D(2272),
    //   value: HMIData.B1,
    //   callpack: 'tensionuphmi2272'
    // }).then(r => console.log(r));
    // await this.PLCS.ipc({
    //   request: FC.FC16_float, address: PLC_D(2346),
    //   value: HMIData.B2,
    //   callpack: 'tensionuphmi2346'
    // }).then(r => console.log(r));
    // await this.PLCS.ipc({
    //   request: FC.FC16_float, address: PLC_D(2460),
    //   value: HMIData.reboundWord,
    //   callpack: 'tensionuphmi2460'
    // }).then(r => console.log(r));

    this.PLCS.data = this.data;
    this.PLCS.holeIndex = this.holeIndex;
    this.downState = false;
    this.router.navigate(['/live-tension']);
  }
  /** 下载下一组数据 */
  async next() {
    this.upProgress++;
    this.cdr.detectChanges();
    await sleep(5);
    return this.downState;
  }
  downHMITest() {
    this.PLCS.data = this.data;
    this.PLCS.holeIndex = this.holeIndex;
    this.router.navigate(['/live-tension']);
  }

  /** 上传 */
  async upload() {
    //   const proj = await this.odb.getOneAsync('project', (p: Project) => p.id === this.taskMenuDom.project.select.id);
    //   console.log(this.data, proj);
    //   let url = null;
    //   let data = null;
    //   switch (proj.uploadingName) {
    //     case 'weepal':

    //       break;
    //     case 'xalj':
    //       url = uploadingData.xalj(proj.uploadingLinkData);
    //       data = uploadingData.xaljData(this.data);
    //       break;
    //     default:
    //       break;
    //   }
    //   console.log(data);
    //   const ups = [];
    //   data.map(g => {
    //     this.http.post(url, { Data: g }).subscribe(r => {
    //       console.log(r);
    //     }, err => {
    //       const result: any = decodeURI(err.error.text);
    //       ups.push({success: result, name: g.holeNO});
    //       console.log(result, ups);
    //       if (result.indexOf('压浆数据上传完成') !== -1) {
    //         this.message.success(`${g.holeNO}上传成功`);
    //       } else {
    //         this.message.error(`${g.holeNO}上传失败 \n错误：${result}`);
    //       }
    //       if (ups.length === data.length) {
    //         console.log('更新数据');

    //         this.data.groutingInfo.map(hg => {
    //           const up = ups.filter(f => f.name === hg.name);
    //           console.log('123', up);
    //           if (up.length > 0 && up[0].success.indexOf('压浆数据上传完成') !== -1) {
    //             hg.uploading = true;
    //           }
    //         });
    //         this.odb.updateAsync('grouting', this.data, (o: any) => this.updateFilterFun(o, this.data), true);
    //       }
    //     });
    //   });
    //   // const uphttp = data.map(g => this.http.post(url, { Data: g }));
    //   // forkJoin(uphttp).subscribe(val => {
    //   //     console.log('上传返回成功', val)
    //   //   }, err => {
    //   //     console.log('上传返回错误', err)
    //   //   }
    //   // );
  }
  /** 确认分组 */
  manualGroup() {
    this.mamualGroupState = true;
    const value = this.formData.get('component').value;
    this.nowComponentHoleInfo = this.componentHoles.filter(f => f.value === value)[0].holes;
    console.log('分组', value, this.nowComponentHoleInfo);

  }
  /** 取消分组 */
  manualGroupCancel() {
    this.mamualGroupState = false;
  }
  /** 创建分组数据 */
  manualGroupOk(groupInfo: Array<ManualGroup>) {
    this.mamualGroupState = false;
    console.log(groupInfo);
    let device: TensionDevice = null;
    const sort = [];
    (this.formData.get('tensionHoleInfos') as FormArray).clear();
    groupInfo.map(async (g) => {
      const holeName = g.hole.join('/');
      sort.push(holeName);
      if (!device || device.id !== g.deviceId) {
        device = await this.db.db.jack.filter(f => f.id === g.deviceId).first();
      }
      const jacks: any = {}
      getModeStr(g.mode).map(key => {
        jacks[key] = { reboundMm: 3.5, wordMm: 5, theoryMm: 0 }
      })
      const tensionHoleInfo: TensionHoleInfo = {
        /** 孔号 */
        name: holeName,
        // tslint:disable-next-line:max-line-length
        /** 张拉工艺(先张，后张，分级张拉第一级，分级张拉第二级等) */
        stretchDrawProcess: '后张',
        /** 张拉长度 */
        length: null,
        /** 钢绞线数量 */
        steelStrandNum: null,
        /** 张拉状态   =0 未张拉    =1一次张拉完成   =2 已张拉 */
        state: 0,
        /** 上传状态 */
        uploading: false,
        otherInfo: [],
        /** task */
        tasks: [
          {
            /** 二次张拉 */
            twice: false,
            /** 超张拉 */
            super: false,
            /** 补张拉 */
            mend: false,
            /** 设置张拉应力 */
            tensionKn: 0,
            /** 张拉设备 */
            device,
            // tslint:disable-next-line:max-line-length
            /** 张拉模式  =42为4顶两端 =41为4顶单端  =21为2顶A1A2单端 =22为2顶A1B1单端 =23为2顶A1A2两端  =24为2顶B1B2两端 =25为2顶A1B1两端  =11为1顶A1单端  =12为1顶B1单端 =13为A1A2B1单端 */
            mode: g.mode,
            otherInfo: [],
            /** 张拉阶段 */
            stage: {
              /** 张拉阶段应力百分比 */
              knPercentage: [10, 20, 50, 100],
              /** 阶段说明（初张拉 阶段一 超张拉 补张拉...） */
              msg: ['初张拉', '阶段一', '阶段二', '终张拉'],
              /** 阶段保压时间 */
              time: [30, 30, 30, 300],
              /** 卸荷比例 */
              uploadPercentage: 10,
              /** 卸荷延时 */
              uploadDelay: 10,
              /** 顶计算数据 */
              ...jacks
            },
            /** 张拉记录 */
            record: {
              state: 0,
              groups: []
            },
          }
        ]
      };
      (this.formData.get('tensionHoleInfos') as FormArray).push(holeForm_item(tensionHoleInfo));
    });
    this.formData.get('sort').setValue(sort);
    this.data.tensionHoleInfos = this.formData.get('tensionHoleInfos').value;
    this.holesDom.redraw();
    // this.successGroup(holeItem);
  }
  /** 分组完成更新数据 */
  successGroup(group) {
    // tslint:disable-next-line:forin
    for (const i in this.formData.controls) {
      console.log(
        this.formData.controls[i].valid,
        i
      );
    }
    console.log(group);
    this.data.tensionHoleInfos = group;
    this.holesDom.initForm();
    // this.nameValueAndValidity();
  }
  nameValueAndValidity() {
    setTimeout(() => {
      this.formData.controls.name.markAsDirty();
      this.formData.controls.name.updateValueAndValidity();
      this.cdr.detectChanges();
    }, 10);
  }
}
