import { Component, OnInit, OnChanges, ViewChild, ElementRef, Input, SimpleChanges } from '@angular/core';
import { ECharts } from 'echarts';
import { format } from 'date-fns';
import { ProcessData } from 'src/app/models/grouting';
// 引入 ECharts 主模块
const echarts = require('echarts');

const data: ProcessData = {
  hz: 1,
  intoPulpPressure: [
    0, 0.2, 0.3, 0.28, 0.3,
    0.4, 0.38, 0.41, 0.44, 0.45,
    0.42, 0.44, 0.45, 0.45, 0.48,
    0.52, 0.5, 0.51, 0.55, 0.6,
  ],
  outPulpPressure: [
    0.2, 0.1, 0.3, 0.58, 0.4,
    0.3, 0.24, 0.33, 0.22, 0.45,
    0.42, 0.44, 0.45, 0.45, 0.48,
    0.52, 0.5, 0.51, 0.55, 0.6,
  ],
  intoPulpvolume: [
    10, 20, 30, 40, 50,
    80, 90, 66, 77, 88,
    92, 99, 80, 60, 50,
    45, 32, 30, 26, 10,
  ],
  outPulpvolume: [
    0, 0, 0, 1, 2,
    80, 90, 66, 77, 88,
    92, 99, 80, 60, 50,
    45, 32, 30, 26, 10,
  ]
};
@Component({
  // tslint:disable-next-line:component-selector
  selector: 'echarts-dynamic-line-grouting',
  templateUrl: './dynamic-line-grouting.component.html',
  styleUrls: ['./dynamic-line-grouting.component.less']
})
export class DynamicLineGroutingComponent implements OnInit, OnChanges {
  @ViewChild('svg', { read: ElementRef, static: true }) svgDom: ElementRef;
  @Input() devs = [];
  @Input() live = 0;
  @Input() data : ProcessData;
  @Input() width: number | string = 'auto';
  @Input() height: number | string = '300';
  @Input() index: null;
  @Input() name: null;
  @Input() show: boolean;
  @Input() satrtDate: number;
  // /** 时间戳 */
  // date: string;
  // /** 进浆压力 */
  // intoPulpPressure: number;
  // /** 回浆压力 */
  // outPulpPressure: number;
  // /** 进浆量(L) */
  // intoPulpvolume: number;
  // /** 回浆量(L) */
  // outPulpvolume: number;
  color2 = {
    intoPulpPressure: '#ff4081',
    outPulpPressure: '#ff5722',

    intoPulpvolume: '#651fff',
    outPulpvolume: '#3d5afe',
  };
  color = {
    intoPulpPressure: '#ff4088',
    outPulpPressure: '#ff4000',

    intoPulpvolume: '#208fff',
    outPulpvolume: '#202fff',
  };
  series = [];
  myChart: ECharts = null;
  oldWidth;

  constructor() { }

  ngOnInit() {
    this.carterSvg();
  }
  ngOnChanges(changes: SimpleChanges) {
    console.log('数据变更', this.width, this.data);
    if (!this.data) {
      this.carterSvg();
    } else {
      if (this.myChart && this.width !== 0 && this.oldWidth !== this.width) {
        if (this.width < 500) {
          this.width = 500;
        }
        this.oldWidth = this.width;
        this.myChart.resize({ width: this.width })
      }
    }
    if (this.data && this.width === this.oldWidth) {
      console.log('data变更', this.data);
      this.carterSvg();
    }
    // this.update();
  }
  carterSvg() {
    if (!this.data) {
      this.data = data;
    }
    // 基于准备好的dom，初始化echarts实例
    this.myChart = echarts.init(this.svgDom.nativeElement, null, {width: this.width, height: this.height});
    // 绘制图表
    this.myChart.setOption(
      {
        title: {
          text: '压力 | 流量曲线',
          // textAlign: 'center',
          // x: 'center',
        },
        grid: {
          x: 40, // 默认是80px
          y: 60, // 默认是60px
          x2: 40, // 默认80px
          // y2: 20 // 默认60px
        },
        // toolbox: {
        //   feature: {
        //     dataZoom: {
        //       yAxisIndex: 'none'
        //     },
        //     restore: {},
        //     saveAsImage: {}
        //   }
        // },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross',
          }
        },
        legend: {
          data: ['进浆压力', '回浆压力', '进浆量', '回浆量'],
          x: 'center'
        },
        // dataZoom: [
        //   {
        //     show: true,
        //     realtime: true,
        //     start: 65,
        //     end: 85
        //   },
        //   {
        //     type: 'inside',
        //     realtime: true,
        //     start: 65,
        //     end: 85
        //   }
        // ],
        xAxis: [
          {
            type: 'category',
            boundaryGap: false,
            axisLine: { onZero: false },
            data: this.data.intoPulpPressure.map((str, i) => {
              console.log(this.satrtDate);
              const date = new Date(this.satrtDate).getTime() + (i * (1000 / this.data.hz))
              return format(new Date(date), 'HH:mm:ss');
            })
          }
        ],
        yAxis: [
          {
            name: '压力(MPa)',
            type: 'value',
            max: Math.max(...this.data.intoPulpPressure, ...this.data.outPulpPressure)
          },
          {
            name: '流量(m³/s)',
            type: 'value',
            max: Math.max(...this.data.intoPulpvolume, ...this.data.outPulpvolume)
          }
        ],
        series: [
          {
            name: '进浆压力',
            type: 'line',
            symbol: 'none',
            data: this.data.intoPulpPressure
          },
          {
            name: '回浆压力',
            type: 'line',
            symbol: 'none',
            data: this.data.outPulpPressure
          },
          {
            name: '进浆量',
            type: 'line',
            symbol: 'none',
            yAxisIndex: 1,
            data: this.data.intoPulpvolume
          },
          {
            name: '回浆量',
            type: 'line',
            symbol: 'none',
            yAxisIndex: 1,
            data: this.data.outPulpvolume
          },
        ]
      }, true
    )

  }
  // carterSvg() {
  //   // 基于准备好的dom，初始化echarts实例
  //   this.myChart = echarts.init(this.svgDom.nativeElement, null, {width: this.width, height: this.height});
  //   // 绘制图表
  //   this.myChart.setOption({

  //     grid: {
  //       x: 40, // 默认是80px
  //       y: 60, // 默认是60px
  //       x2: 40, // 默认80px
  //       // y2: 20 // 默认60px
  //     },
  //     title: {
  //       text: this.name,
  //     },
  //     legend: {
  //       data: this.devs,
  //       type: 'scroll',
  //       top: 25,
  //       itemGap: 20,
  //       itemWidth: 15,
  //       itemHeight: 20,
  //       textStyle: {
  //         fontSize: 16
  //       },
  //       // 使用回调函数
  //       formatter: (name) => {
  //         return nameConvert(name);
  //       }
  //     },
  //     tooltip: {
  //       trigger: 'axis',
  //       showContent: false
  //     },
  //     dataset: {
  //       source: this.data
  //     },
  //     xAxis: {
  //       type: 'category',
  //       boundaryGap: false,
  //       splitLine: {
  //         show: false
  //       },
  //       axisLabel: {
  //         formatter: (value, index) => {
  //           return DateFormat(new Date(value), 'hh:mm:ss');
  //         }
  //       }
  //     },
  //     yAxis: {
  //       boundaryGap: [0, '5%'],
  //       scale: true,
  //       splitLine: {
  //         show: false
  //       }
  //     },
  //     // 缩放
  //     dataZoom: [
  //       {
  //         id: 'dataZoomX',
  //         type: 'inside',
  //         xAxisIndex: [0],
  //         filterMode: 'weakFilter', // 设定为 'filter' 从而 X 的窗口变化会影响 Y 的范围。
  //         startValue: 0,
  //         endValue: 0
  //       },
  //     ],

  //     series: this.series
  //   });
  // }
}
