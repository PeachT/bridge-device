import { Component, OnInit, OnChanges, ViewChild, ElementRef, Input, SimpleChanges } from '@angular/core';
import { ECharts } from 'echarts';
import { format } from 'date-fns';
import { Process } from 'src/app/models/tension';
// 引入 ECharts 主模块
const echarts = require('echarts');

const data: Process = {
  hz: 1,
  A1: {
    mpa: [0.5, 1.5, 2.5, 3.5, 4.5, 5.5, 6.5 ,7.5, 8.5, 9.5],
    mm: [0.5, 1.5, 2.5, 3.5, 4.5, 5.5, 6.5 ,7.5, 8.5, 9.5],
  },
  A2: {
    mpa: [0.5, 1.5, 2.5, 3.5, 4.5, 5.5, 6.5 ,7.5, 8.5, 9.5].map(m => m * 4.5),
    mm: [0.5, 1.5, 2.5, 3.5, 4.5, 5.5, 6.5 ,7.5, 8.5, 9.5].map(m => m * 4.2),
  },
  B1: {
    mpa: [0.5, 1.5, 2.5, 3.5, 4.5, 5.5, 6.5 ,7.5, 8.5, 9.5].map(m => m * 3.9),
    mm: [0.5, 1.5, 2.5, 3.5, 4.5, 5.5, 6.5 ,7.5, 8.5, 9.5].map(m => m * 2),
  },
  B2: {
    mpa: [0.5, 1.5, 2.5, 3.5, 4.5, 5.5, 6.5 ,7.5, 8.5, 9.5].map(m => m * 3),
    mm: [0.5, 1.5, 2.5, 3.5, 4.5, 5.5, 6.5 ,7.5, 8.5, 9.5].map(m => m * 3),
  }
};
@Component({
  // tslint:disable-next-line:component-selector
  selector: 'echarts-dynamic-line-tension',
  templateUrl: './dynamic-line-tension.component.html',
  styleUrls: ['./dynamic-line-tension.component.less']
})
export class DynamicLineTensionComponent implements OnInit, OnChanges {
  @ViewChild('svg', { read: ElementRef, static: true }) svgDom: ElementRef;
  @Input() devs = [];
  @Input() live = 0;
  @Input() data : Process;
  @Input() width: number | string = 'auto';
  @Input() height: number | string = '300';
  @Input() index: null;
  @Input() name: null;
  @Input() show: boolean;

  @Input() satrtDate: number = new Date().getTime();
  @Input() strMode: Array<string> = ['A1', 'A2', 'B1', 'B2'];
  @Input() key = 'mpa'
  @Input() text = '压力';

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
    A1: '#ff4081',
    A2: '#ff5722',

    B1: '#651fff',
    B2: '#3d5afe',
  };
  color = {
    A1: '#ff4088',
    A2: '#ff4000',

    B1: '#208fff',
    B2: '#202fff',
  };
  series = [];
  myChart: ECharts = null;
  oldWidth;
  maxs: any[] = [];

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
      this.series = this.strMode.map(name => {
        this.maxs = [...this.maxs, ...this.data[name][this.key]]
        return {
          name,
          type: 'line',
          symbol: 'none',
          data: this.data[name][this.key]
        };
      })
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
          text: this.text,
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
          data: this.strMode,
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
            data: this.data[this.strMode[0]][this.key].map((str, i) => {
              console.log(this.satrtDate);
              const date = new Date(this.satrtDate).getTime() + (i * (1000 / this.data.hz))
              return format(new Date(date), 'HH:mm:ss');
            })
          }
        ],
        yAxis: [
          {
            name: `${this.text}(MPa)`,
            type: 'value',
            max: Math.max(...this.maxs)
          },
        ],
        series: this.series
      }, true
    )
  }
}
