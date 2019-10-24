import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { TensionTask, ManualGroup, TensionHoleInfo } from 'src/app/models/tension';
import { TaskMenuComponent } from 'src/app/shared/task-menu/task-menu.component';
import { FormArray, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { DbService } from 'src/app/services/db.service';
import { NzMessageService } from 'ng-zorro-antd';
import { AppService } from 'src/app/services/app.service';
import { GroutingService } from 'src/app/services/grouting.service';
import { HttpService } from 'src/app/services/http.service';
import { nameRepetition } from 'src/app/Validator/async.validator';
import { getModelBase, baseEnum } from 'src/app/models/base';
import { GroutingTask, GroutingHoleItem } from 'src/app/models/grouting';
import { Observable, from } from 'rxjs';
import { map, toArray } from 'rxjs/operators';
import { Comp } from 'src/app/models/component';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { TensionDevice } from 'src/app/models/jack';
import { TensionHolesComponent } from './tension-holes/tension-holes.component';
import { getModeStr, tensionOther2Date } from 'src/app/Function/tension';
import { ScrollMenuComponent } from 'src/app/shared/scroll-menu/scroll-menu.component';

@Component({
  selector: 'app-tension',
  templateUrl: './tension.component.html',
  styleUrls: ['./tension.component.less']
})
export class TensionComponent implements OnInit, OnDestroy {
  dbName = 'tension';
  @ViewChild('menu', null) menuDom: ScrollMenuComponent;
  @ViewChild('holes', null) holesDom: TensionHolesComponent;
  /** 构建选择菜单 */
  componentMneu$: Observable<Array<{label: string; value: any;}>>;
  componentHoles = [];
  nowComponentHoleInfo: any;

  data: TensionTask = {
    id: null,
    name: '测试base',
    createdDate: null,
    modificationDate: null,
    user: null,
    project: null,
    component: null,
    /** 梁长度 */
    beamLength: null,
    /** 张拉日期 */
    tensionDate: null,
    /** 浇筑日期 */
    castingDate: null,
    /** 压浆顺序 */
    sort: null,
    /** 压浆开始日期 */
    startDate: null,
    /** 压浆完成日期 */
    endDate: null,
    /** 设备编号 */
    deviceNo: null,
    /** 是否作为模板 */
    template: false,
    /** 其他数据信息 */
    otherInfo: [
      { key: '123', value: '123' }
    ],
    /** 施工员 */
    operator: null,
    /** 监理员 */
    supervisors: null,
    /** 自检员 */
    qualityInspector: null,
    tensionHoleInfos: [
      {
        /** 孔号 */
        name: 'N1/N2',
        // tslint:disable-next-line:max-line-length

        /** 张拉工艺(先张，后张，分级张拉第一级，分级张拉第二级等) */
        stretchDrawProcess: '后张',
        /** 张拉长度 */
        length: 20,
        /** 钢绞线数量 */
        steelStrandNum: 5,
        /** 张拉状态   =0 未张拉    =1一次张拉完成   =2 已张拉 */
        state: 0,
        /** 上传状态 */
        uploading: false,
        otherInfo: [
          { key: '其他一', value: '其他一' }
        ],
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
            tensionKn: 100,
            /** 张拉设备 */
            device: getModelBase(baseEnum.jack),
            // tslint:disable-next-line:max-line-length
            /** 张拉模式  =42为4顶两端 =41为4顶单端  =21为2顶A1A2单端 =22为2顶A1B1单端 =23为2顶A1A2两端  =24为2顶B1B2两端 =25为2顶A1B1两端  =11为1顶A1单端  =12为1顶B1单端 =13为A1A2B1单端 */
            mode: 41,
            otherInfo: [
              { key: '123', value: '123' }
            ],
            /** 张拉阶段 */
            stage: {
              /** 张拉阶段应力百分比 */
              knPercentage: [10, 20 , 50, 100],
              /** 阶段说明（初张拉 阶段一 超张拉 补张拉...） */
              msg: ['初张拉', '阶段一', '阶段二', '终张拉'],
              /** 阶段保压时间 */
              time: [30, 30, 30, 300],
              /** 卸荷比例 */
              uploadPercentage: 15,
              /** 卸荷延时 */
              uploadDelay: 15,
              A1: { reboundMm: 3.5, wordMm: 5, theoryMm: 208},
              A2: { reboundMm: 3.5, wordMm: 4, theoryMm: 208},
              B1: { reboundMm: 3.5, wordMm: 3, theoryMm: 208},
              B2: { reboundMm: 3.5, wordMm: 2, theoryMm: 208},
            },
            /** 张拉记录 */
            record: {
              /** 张拉状态 =1一次张拉完成   =2 已张拉 */
              state: 2,
              /** 过程记录 */
              groups: [
                {
                  /** 张拉阶段应力百分比 */
                  knPercentage: [10, 20 , 50, 100],
                  /** 阶段名称 */
                  msg: ['初张拉', '阶段一', '阶段二', '终张拉'],
                  /** 阶段保压时间 */
                  time: [1,2,3,4],
                  /** 卸荷比例 */
                  uploadPercentage: 15,
                  /** 卸荷延时 */
                  uploadDelay: 15,
                  /** 阶段记录 */
                  A1: {
                    /** 阶段压力 */
                    mpa: [1,2,3,4],
                    /** 阶段位移 */
                    mm: [4,3,2,1],

                    /** 回油压力 */
                    initMpa: 1,
                    /** 回油位移 */
                    initMm: 1,
                  },
                  A2: {
                    /** 阶段压力 */
                    mpa: [1,2,3,4],
                    /** 阶段位移 */
                    mm: [4,3,2,1],
                    /** 回油压力 */
                    initMpa: 1,
                    /** 回油位移 */
                    initMm: 1,
                  },
                  B1: {
                    /** 阶段压力 */
                    mpa: [1,2,3,4],
                    /** 阶段位移 */
                    mm: [4,3,2,1],
                    /** 回油压力 */
                    initMpa: 1,
                    /** 回油位移 */
                    initMm: 1,
                  },
                  B2: {
                    /** 阶段压力 */
                    mpa: [1,2,3,4],
                    /** 阶段位移 */
                    mm: [4,3,2,1],
                    /** 回油压力 */
                    initMpa: 1.4,
                    /** 回油位移 */
                    initMm: 1.44
                  },
                  /** 张拉过程数据 */
                  datas: {
                    hz: 1,
                    A1: {
                      mpa: [
                        3.5, 1.5, 2.5, 3.5, 4.5, 5.5, 6.5 ,7.5, 8.5, 9.5,
                        3.5, 1.5, 2.5, 3.5, 4.5, 5.5, 6.5 ,7.5, 8.5, 9.5,
                        3.5, 1.5, 2.5, 3.5, 4.5, 5.5, 6.5 ,7.5, 8.5, 9.5,
                        3.5, 1.5, 2.5, 3.5, 4.5, 5.5, 6.5 ,7.5, 8.5, 9.5,
                        3.5, 1.5, 2.5, 3.5, 4.5, 5.5, 6.5 ,7.5, 8.5, 9.5,
                        3.5, 1.5, 2.5, 3.5, 4.5, 5.5, 6.5 ,7.5, 8.5, 9.5,
                        3.5, 1.5, 2.5, 3.5, 4.5, 5.5, 6.5 ,7.5, 8.5, 9.5,
                        3.5, 1.5, 2.5, 3.5, 4.5, 5.5, 6.5 ,7.5, 8.5, 9.5,
                        3.5, 1.5, 2.5, 3.5, 4.5, 5.5, 6.5 ,7.5, 8.5, 9.5,
                      ],
                      mm: [
                        3.5, 1.5, 2.5, 3.5, 4.5, 5.5, 6.5 ,7.5, 8.5, 9.5,
                        3.5, 1.5, 2.5, 3.5, 4.5, 5.5, 6.5 ,7.5, 8.5, 9.5,
                        3.5, 1.5, 2.5, 3.5, 4.5, 5.5, 6.5 ,7.5, 8.5, 9.5,
                        3.5, 1.5, 2.5, 3.5, 4.5, 5.5, 6.5 ,7.5, 8.5, 9.5,
                        3.5, 1.5, 2.5, 3.5, 4.5, 5.5, 6.5 ,7.5, 8.5, 9.5,
                        3.5, 1.5, 2.5, 3.5, 4.5, 5.5, 6.5 ,7.5, 8.5, 9.5,
                        3.5, 1.5, 2.5, 3.5, 4.5, 5.5, 6.5 ,7.5, 8.5, 9.5,
                        3.5, 1.5, 2.5, 3.5, 4.5, 5.5, 6.5 ,7.5, 8.5, 9.5,
                        3.5, 1.5, 2.5, 3.5, 4.5, 5.5, 6.5 ,7.5, 8.5, 9.5,
                      ],
                    },
                    A2: {
                      mpa: [
                        5.5, 1.5, 2.5, 3.5, 4.5, 5.5, 6.5 ,7.5, 8.5, 9.5,
                        5.5, 1.5, 2.5, 3.5, 4.5, 5.5, 6.5 ,7.5, 8.5, 9.5,
                        5.5, 1.5, 2.5, 3.5, 4.5, 5.5, 6.5 ,7.5, 8.5, 9.5,
                        5.5, 1.5, 2.5, 3.5, 4.5, 5.5, 6.5 ,7.5, 8.5, 9.5,
                        5.5, 1.5, 2.5, 3.5, 4.5, 5.5, 6.5 ,7.5, 8.5, 9.5,
                        5.5, 1.5, 2.5, 3.5, 4.5, 5.5, 6.5 ,7.5, 8.5, 9.5,
                        5.5, 1.5, 2.5, 3.5, 4.5, 5.5, 6.5 ,7.5, 8.5, 9.5,
                        5.5, 1.5, 2.5, 3.5, 4.5, 5.5, 6.5 ,7.5, 8.5, 9.5,
                        5.5, 1.5, 2.5, 3.5, 4.5, 5.5, 6.5 ,7.5, 8.5, 9.5,
                      ].map(m => Number((m * 4.5).toFixed(2))),
                      mm: [
                        5.5, 1.5, 2.5, 3.5, 4.5, 5.5, 6.5 ,7.5, 8.5, 9.5,
                        5.5, 1.5, 2.5, 3.5, 4.5, 5.5, 6.5 ,7.5, 8.5, 9.5,
                        5.5, 1.5, 2.5, 3.5, 4.5, 5.5, 6.5 ,7.5, 8.5, 9.5,
                        5.5, 1.5, 2.5, 3.5, 4.5, 5.5, 6.5 ,7.5, 8.5, 9.5,
                        5.5, 1.5, 2.5, 3.5, 4.5, 5.5, 6.5 ,7.5, 8.5, 9.5,
                        5.5, 1.5, 2.5, 3.5, 4.5, 5.5, 6.5 ,7.5, 8.5, 9.5,
                        5.5, 1.5, 2.5, 3.5, 4.5, 5.5, 6.5 ,7.5, 8.5, 9.5,
                        5.5, 1.5, 2.5, 3.5, 4.5, 5.5, 6.5 ,7.5, 8.5, 9.5,
                        5.5, 1.5, 2.5, 3.5, 4.5, 5.5, 6.5 ,7.5, 8.5, 9.5,
                      ].map(m => Number((m * 4.2).toFixed(2))),
                    },
                    B1: {
                      mpa: [
                        3.5, 1.5, 2.5, 3.5, 4.5, 5.5, 6.5 ,7.5, 8.5, 9.5,
                        3.5, 1.5, 2.5, 3.5, 4.5, 5.5, 6.5 ,7.5, 8.5, 9.5,
                        3.5, 1.5, 2.5, 3.5, 4.5, 5.5, 6.5 ,7.5, 8.5, 9.5,
                        3.5, 1.5, 2.5, 3.5, 4.5, 5.5, 6.5 ,7.5, 8.5, 9.5,
                        3.5, 1.5, 2.5, 3.5, 4.5, 5.5, 6.5 ,7.5, 8.5, 9.5,
                        3.5, 1.5, 2.5, 3.5, 4.5, 5.5, 6.5 ,7.5, 8.5, 9.5,
                        3.5, 1.5, 2.5, 3.5, 4.5, 5.5, 6.5 ,7.5, 8.5, 9.5,
                        3.5, 1.5, 2.5, 3.5, 4.5, 5.5, 6.5 ,7.5, 8.5, 9.5,
                        3.5, 1.5, 2.5, 3.5, 4.5, 5.5, 6.5 ,7.5, 8.5, 9.5,
                      ].map(m => Number((m * 3.9).toFixed(2))),
                      mm: [
                        2.5, 1.5, 2.5, 3.5, 4.5, 5.5, 6.5 ,7.5, 8.5, 9.5,
                        2.5, 1.5, 2.5, 3.5, 4.5, 5.5, 6.5 ,7.5, 8.5, 9.5,
                        2.5, 1.5, 2.5, 3.5, 4.5, 5.5, 6.5 ,7.5, 8.5, 9.5,
                        2.5, 1.5, 2.5, 3.5, 4.5, 5.5, 6.5 ,7.5, 8.5, 9.5,
                        2.5, 1.5, 2.5, 3.5, 4.5, 5.5, 6.5 ,7.5, 8.5, 9.5,
                        2.5, 1.5, 2.5, 3.5, 4.5, 5.5, 6.5 ,7.5, 8.5, 9.5,
                        2.5, 1.5, 2.5, 3.5, 4.5, 5.5, 6.5 ,7.5, 8.5, 9.5,
                        2.5, 1.5, 2.5, 3.5, 4.5, 5.5, 6.5 ,7.5, 8.5, 9.5,
                        2.5, 1.5, 2.5, 3.5, 4.5, 5.5, 6.5 ,7.5, 8.5, 9.5,
                      ].map(m => Number((m * 2).toFixed(2))),
                    },
                    B2: {
                      mpa: [
                        3.5, 1.5, 2.5, 3.5, 4.5, 5.5, 6.5 ,7.5, 8.5, 9.5,
                        3.5, 1.5, 2.5, 3.5, 4.5, 5.5, 6.5 ,7.5, 8.5, 9.5,
                        3.5, 1.5, 2.5, 3.5, 4.5, 5.5, 6.5 ,7.5, 8.5, 9.5,
                        3.5, 1.5, 2.5, 3.5, 4.5, 5.5, 6.5 ,7.5, 8.5, 9.5,
                        3.5, 1.5, 2.5, 3.5, 4.5, 5.5, 6.5 ,7.5, 8.5, 9.5,
                        3.5, 1.5, 2.5, 3.5, 4.5, 5.5, 6.5 ,7.5, 8.5, 9.5,
                        3.5, 1.5, 2.5, 3.5, 4.5, 5.5, 6.5 ,7.5, 8.5, 9.5,
                        3.5, 1.5, 2.5, 3.5, 4.5, 5.5, 6.5 ,7.5, 8.5, 9.5,
                        3.5, 1.5, 2.5, 3.5, 4.5, 5.5, 6.5 ,7.5, 8.5, 9.5,
                      ].map(m => Number((m * 3).toFixed(2))),
                      mm: [
                        8.5, 1.5, 2.5, 3.5, 4.5, 5.5, 6.5 ,7.5, 8.5, 9.5,
                        8.5, 1.5, 2.5, 3.5, 4.5, 5.5, 6.5 ,7.5, 8.5, 9.5,
                        8.5, 1.5, 2.5, 3.5, 4.5, 5.5, 6.5 ,7.5, 8.5, 9.5,
                        8.5, 1.5, 2.5, 3.5, 4.5, 5.5, 6.5 ,7.5, 8.5, 9.5,
                        8.5, 1.5, 2.5, 3.5, 4.5, 5.5, 6.5 ,7.5, 8.5, 9.5,
                        8.5, 1.5, 2.5, 3.5, 4.5, 5.5, 6.5 ,7.5, 8.5, 9.5,
                        8.5, 1.5, 2.5, 3.5, 4.5, 5.5, 6.5 ,7.5, 8.5, 9.5,
                        8.5, 1.5, 2.5, 3.5, 4.5, 5.5, 6.5 ,7.5, 8.5, 9.5,
                        8.5, 1.5, 2.5, 3.5, 4.5, 5.5, 6.5 ,7.5, 8.5, 9.5,
                      ].map(m => Number((m * 3).toFixed(2))),
                    }
                  }
                }
              ]
            },
          }
        ]
      },
      {
        /** 孔号 */
        name: 'N3/N4',
        // tslint:disable-next-line:max-line-length

        /** 张拉工艺(先张，后张，分级张拉第一级，分级张拉第二级等) */
        stretchDrawProcess: '后张',
        /** 张拉长度 */
        length: 20,
        /** 钢绞线数量 */
        steelStrandNum: 5,
        /** 张拉状态   =0 未张拉    =1一次张拉完成   =2 已张拉 */
        state: 0,
        /** 上传状态 */
        uploading: false,
        otherInfo: [
          { key: '其他一', value: '其他一' }
        ],
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
            tensionKn: 123,
            /** 张拉设备 */
            device: getModelBase(baseEnum.jack),
            // tslint:disable-next-line:max-line-length
            /** 张拉模式  =42为4顶两端 =41为4顶单端  =21为2顶A1A2单端 =22为2顶A1B1单端 =23为2顶A1A2两端  =24为2顶B1B2两端 =25为2顶A1B1两端  =11为1顶A1单端  =12为1顶B1单端 =13为A1A2B1单端 */
            mode: 42,
            otherInfo: [
              { key: '123', value: '123' }
            ],
            /** 张拉阶段 */
            stage: {
              /** 张拉阶段应力百分比 */
              knPercentage: [15, 30 , 50, 100],
              /** 阶段说明（初张拉 阶段一 超张拉 补张拉...） */
              msg: ['初张拉', '阶段一', '阶段二', '终张拉'],
              /** 阶段保压时间 */
              time: [33, 33, 33, 333],
              /** 卸荷比例 */
              uploadPercentage: 15,
              /** 卸荷延时 */
              uploadDelay: 15,
              A1: { reboundMm: 3.5, wordMm: 1, theoryMm: 222},
              A2: { reboundMm: 3.5, wordMm: 2, theoryMm: 222},
              B1: { reboundMm: 3.5, wordMm: 3, theoryMm: 222},
              B2: { reboundMm: 3.5, wordMm: 4, theoryMm: 222},
            },
            /** 张拉记录 */
            record: {
              /** 张拉状态 =1一次张拉完成   =2 已张拉 */
              state: 2,
              /** 过程记录 */
              groups: [
                {
                  /** 张拉阶段应力百分比 */
                  knPercentage: [10, 20 , 50, 100],
                  /** 阶段名称 */
                  msg: ['初张拉', '阶段一', '阶段二', '终张拉'],
                  /** 阶段保压时间 */
                  time: [1,2,3,4],
                  /** 卸荷比例 */
                  uploadPercentage: 15,
                  /** 卸荷延时 */
                  uploadDelay: 15,
                  /** 阶段记录 */
                  A1: {
                    /** 阶段压力 */
                    mpa: [1,2,3,4],
                    /** 阶段位移 */
                    mm: [4,3,2,1],

                    /** 回油压力 */
                    initMpa: 1,
                    /** 回油位移 */
                    initMm: 1,
                  },
                  A2: {
                    /** 阶段压力 */
                    mpa: [1,2,3,4],
                    /** 阶段位移 */
                    mm: [4,3,2,1],
                    /** 回油压力 */
                    initMpa: 1,
                    /** 回油位移 */
                    initMm: 1,
                  },
                  B1: {
                    /** 阶段压力 */
                    mpa: [1,2,3,4],
                    /** 阶段位移 */
                    mm: [4,3,2,1],
                    /** 回油压力 */
                    initMpa: 1,
                    /** 回油位移 */
                    initMm: 1,
                  },
                  B2: {
                    /** 阶段压力 */
                    mpa: [1,2,3,4],
                    /** 阶段位移 */
                    mm: [4,3,2,1],
                    /** 回油压力 */
                    initMpa: 1.4,
                    /** 回油位移 */
                    initMm: 1.44
                  },
                  /** 张拉过程数据 */
                  datas: {
                    hz: 1,
                    A1: {
                      mpa: [55.5, 1.5, 2.5, 3.5, 4.5, 5.5, 6.5 ,7.5, 8.5, 9.5],
                      mm: [55.5, 1.5, 2.5, 3.5, 4.5, 5.5, 6.5 ,7.5, 8.5, 9.5],
                    },
                    A2: {
                      mpa: [7.5, 1.5, 2.5, 3.5, 4.5, 5.5, 6.5 ,7.5, 8.5, 9.5].map(m => m * 4.5),
                      mm: [7.5, 1.5, 2.5, 3.5, 4.5, 5.5, 6.5 ,7.5, 8.5, 9.5].map(m => m * 4.2),
                    },
                    B1: {
                      mpa: [4.5, 1.5, 2.5, 3.5, 4.5, 5.5, 6.5 ,7.5, 8.5, 9.5].map(m => m * 3.9),
                      mm: [4.5, 1.5, 2.5, 3.5, 4.5, 5.5, 6.5 ,7.5, 8.5, 9.5].map(m => m * 2),
                    },
                    B2: {
                      mpa: [9.5, 1.5, 2.5, 3.5, 4.5, 5.5, 6.5 ,7.5, 8.5, 9.5].map(m => m * 3),
                      mm: [9.5, 1.5, 2.5, 3.5, 4.5, 5.5, 6.5 ,7.5, 8.5, 9.5].map(m => m * 3),
                    }
                  }
                }
              ]
            },
          }
        ]
      },
    ]
  };
  formData: FormGroup;
  /** 删除数据 */
  deleteShow = false;

  /** 选项卡显示index */
  tabsetShow = 0;
  /** 上传 */
  uploading = false;
  /** 手动分组 */
  mamualGroupState = false;

  /** 添加数据判断 */
  addFilterFun = (o1: any, o2: any) => o1.name === o2.name
    && o1.component === o2.component && o1.project === o2.project
  /** 修改数据判断 */
  updateFilterFun = (o1: TensionTask, o2: TensionTask) => o1.name === o2.name
    && o1.component === o2.component && o1.project === o2.project && o1.id !== o2.id
  /** 菜单梁状态 */
  menuStateFunc = (g: TensionTask) => {
    console.log(g);
    return g.tensionHoleInfos.map(item => {
      return item.state
    })
  }

  constructor(
    public db: DbService,
    private message: NzMessageService,
    public appS: AppService,
    public GPLCS: GroutingService,
    private http: HttpService
  ) {

  }

  ngOnInit() {
    this.getComponent();
    this.formInit();
  }
  /** 初始化数据 */
  formInit() {
    const data = this.data;
    const fb = new FormBuilder();
    this.formData = fb.group({
      id: [data.id],
      project: [data.project],
      /** 梁号 */
      name: [data.name, [Validators.required]],
      /** 构建 */
      component: [data.component, [Validators.required]],
      /** 梁长度 */
      beamLength: [data.beamLength, [Validators.required]],
      /** 张拉日期 */
      tensionDate: [data.tensionDate, [Validators.required]],
      /** 浇筑日期 */
      castingDate: [data.castingDate, [Validators.required]],
      /** 张拉顺序 */
      sort: [data.sort],
      /** 设备编号 */
      deviceNo: [data.deviceNo],
      /** 是否作为模板 */
      template: [data.template],
      /** 其他数据信息 */
      otherInfo: fb.array([]),
      /** 施工员 */
      operator: [data.operator],
      /** 监理员 */
      supervisors: [data.supervisors],
      /** 自检员 */
      qualityInspector: [data.qualityInspector],
      tensionHoleInfos: fb.array([], [Validators.required]),
    });

    // this.formData.setValue(data);
    console.log('初始化数据', data, !data.id && data.name);
    this.formData.controls.name.setAsyncValidators([nameRepetition(this.db, this.dbName, this.updateFilterFun)]);
    this.nameValueAndValidity();
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
            arr.push({ label: value, value});
            this.componentHoles.push({value, holes: h.holes})
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
      this.formInit();
    }
  }
  /**
   * *编辑完成
   */
  editOk(data) {
    console.log(data, this.menuDom.bridgeId);
    if (data.bridgeId && data.bridgeId !== this.menuDom.bridgeId) {

      this.menuDom.reset({
        projectId: data.projectId,
        componentName: data.componentName,
        bridgeId: data.bridgeId
      });
    } else {
      this.menuDom.selectBridge(data.bridgeId);
    }
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
  manualGroupOk(event: Array<ManualGroup>) {
    this.mamualGroupState = false;
    console.log(event);
    const ccc = [];
    event.map(async (g) => {
      const device: TensionDevice = await this.db.db.jack.filter(f => f.id === g.deviceId).first();
      const jacks: any = {}
      getModeStr(g.mode).map(key => {
        jacks[key] = { reboundMm: 3.5, wordMm: 5, theoryMm: 0}
      })
      ccc.push({
          /** 孔号 */
          name: g.hole.join('/'),
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
              record: null,
            }
          ]
        });
      if (ccc.length === event.length) {
        this.successGroup(ccc);
      }
    });
  }
  /** 分组完成更新数据 */
  successGroup(group) {
    console.log(group);
    this.data.tensionHoleInfos = group;
    this.holesDom.initForm();
    this.nameValueAndValidity();
  }
  nameValueAndValidity() {
    setTimeout(() => {
      this.formData.controls.name.updateValueAndValidity();
    }, 10);
  }
}
