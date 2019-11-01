import { Component, OnInit, ChangeDetectorRef, Input, Output, EventEmitter, OnChanges, SimpleChanges, ChangeDetectionStrategy } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { DbService } from 'src/app/services/db.service';
import { NzMessageService, NzModalService } from 'ng-zorro-antd';
import { AppService } from 'src/app/services/app.service';
import { GroutingService } from 'src/app/services/grouting.service';
import { ElectronService } from 'ngx-electron';
import { HttpService } from 'src/app/services/http.service';
import { GroutingTask } from 'src/app/models/grouting';
import { Observable, from } from 'rxjs';
import { map } from 'rxjs/operators';
import { Comp } from 'src/app/models/component';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'grouting-mian',
  templateUrl: './mian.component.html',
  styleUrls: ['./mian.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class GroutingMianComponent implements OnInit, OnChanges {
  @Input() groutingTask: GroutingTask;
  @Input() formData: FormGroup;
  @Input() edit = false;
  @Input() unDel = [];
  /** 构建选择菜单 */
  componentMneu$: Observable<Array<{label: string; value: any;}>>;
  componentHoles = [];

  @Output() outSelectComponent = new EventEmitter();


  addFilterFun = (o1: any, o2: any) => o1.name === o2.name
    && o1.component === o2.component && o1.project === o2.project
  updateFilterFun = (o1: GroutingTask, o2: GroutingTask) => o1.name === o2.name
    && o1.component === o2.component && o1.project === o2.project && o1.id !== o2.id

  constructor(
    public db: DbService,
    public appS: AppService,
    public GPLCS: GroutingService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.getComponent();
    this.cdr.detectChanges();
  }

  ngOnChanges(changes: SimpleChanges) {
    console.log('配比数据更新', changes);
    this.cdr.detectChanges();
    // this.piFormGroup.controls.waterBinderRatio.setValue(this.data.waterBinderRatio);
    // this.createForm(this.data.proportions).map(si => {
    //   this.proportionrFormArr.push(si)
    // })
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
  /** 初始化Form */
  createForm(data: GroutingTask) {
  }

  /** 构建选择 */
  conponentChange(value) {
    console.log(value, this.componentHoles);
    this.outSelectComponent.emit(this.componentHoles.filter(f => f.value === value)[0].holes);
  }



}
