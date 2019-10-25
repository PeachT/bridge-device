import { Component, OnInit, Output, EventEmitter, Input, ChangeDetectionStrategy } from '@angular/core';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Observable, from } from 'rxjs';
import { map } from 'rxjs/operators';
import { DbService } from 'src/app/services/db.service';
import { TensionDevice } from 'src/app/models/jack';
import { NzMessageService } from 'ng-zorro-antd';
import { ManualGroup } from 'src/app/models/tension';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'tension-manual-group',
  templateUrl: './tension-manual-group.component.html',
  styleUrls: ['./tension-manual-group.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TensionManualGroupComponent implements OnInit {
  @Input() holes: Array<string>;

  jackMneu$: Observable<Array<{ label: string; value: any; }>>;
  selectJack = null;
  selectMode = null;
  strMode: any;
  groupKey: any = {};
  groupItem: any = [];
  groupOk: Array<ManualGroup> = [];
  residue: any;
  residueNumber = 0;

  @Output() outOK = new EventEmitter<Array<ManualGroup>>();
  @Output() outCancel = new EventEmitter();
  constructor(
    private db: DbService,
    private message: NzMessageService
  ) { }

  ngOnInit() {
    this.getJaskMenu();
    this.residue = this.holes;
    this.residueNumber = this.holes.length
  }

  getJaskMenu() {
    this.jackMneu$ = from(this.db.db.jack.toArray()).pipe(
      map(comps => {
        const arr = [];
        comps.map((item: TensionDevice) => {
          arr.push({ label: item.name, value: item.id });
        });
        return arr;
      })
    );
  }
  /** 取消 */
  cancel() {
    this.outCancel.emit();
  }
  /** 确定 */
  Ok() {
    if (this.residueNumber === 0) {
      console.log(this.groupOk);
      this.outOK.emit(this.groupOk);
      return;
    }
    this.message.error('完成所有孔号分组才能完成操作！')
  }
  getmodeStr(mode) {
    switch (mode) {
      case 42: // 4顶两端
        return ['A1/A2', 'B1/B2']
      case 41: // 4顶单端
        return ['A1', 'B1', 'A2', 'B2']
      case 21: // A1|A2单端
        return ['A1', 'A2']
      case 23: // A1|A2两端
        return ['A1/A2']
      case 24: // B1|B2两端
        return ['B1/B2']
      case 22: // A1|B1单端
        return ['A1', 'B1']
      case 25: // A1|B1两端
        return ['A1/B1']
      case 11: // A1单端
        return ['A1']
      case 12: // B1单端
        return ['B1']
      default:
        break;
    }
  }
  /** 孔输入框显示 */
  modeChange() {
    this.strMode = this.getmodeStr(this.selectMode);
    this.groupKey = {};
    this.holeChange();
  }

  /** 选择孔号 */
  holeChange() {
    let arr = []
    this.groupOk.map(item => {
      arr = [...arr, ...item.hole];
    })
    const s = [];
    this.strMode.map(key => {
      if (this.groupKey[key]) {
        s.push(this.groupKey[key]);
      }
    })
    arr = [...arr, ...s];
    this.residue = this.holes.filter(h => arr.indexOf(h) === -1);
    return this.residue.length;
  }
  /** 确定分组 */
  groupSave() {
    let state = false;
    this.strMode.map(item => {
      if (!this.groupKey[item]) {
        state = true;
      }
    })
    if (!state && this.selectJack && this.selectMode) {
      const s = this.strMode.map(key => {
        return this.groupKey[key];
      })
      this.groupKey = {};
      this.groupOk.push({ deviceId: this.selectJack, mode: this.selectMode, hole: s });
      const gokl = this.holeChange();
      this.residueNumber = gokl;
      console.log(this.groupOk);
      if (this.residueNumber < this.strMode.length) {
        this.selectMode = null;
      }
    } else {
      this.message.error('填写有错误！');
    }
  }
  /** 删除张拉分组 */
  delGroupItem(i) {
    this.groupOk.splice(i, 1);
    this.holeChange();
  }
  /** 排序 */
  groupMove(i, state) {
    if (state) {
      moveItemInArray(this.groupOk, i, i - 1);
    } else {
      moveItemInArray(this.groupOk, i, i + 1);
    }
  }
  /**
   * 移动item的时候，item之间的位置变换
   * @param event
   */
  drop(event: CdkDragDrop<string[]>) {
    console.log(event.previousIndex, event.currentIndex);
    moveItemInArray(this.groupOk, event.previousIndex, event.currentIndex);

  }

}
