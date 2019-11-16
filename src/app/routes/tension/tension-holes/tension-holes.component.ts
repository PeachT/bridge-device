import { Component, OnInit, OnChanges, Input, Output, EventEmitter, SimpleChanges, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { TensionHoleInfo, TensionTask, GroupsName } from 'src/app/models/tension';
import { FormGroup, FormArray, FormBuilder } from '@angular/forms';
import { Subscription } from 'rxjs';
import { AppService } from 'src/app/services/app.service';
import { trigger, transition, query, style, animate, group, stagger } from '@angular/animations';
import { sleep } from 'sleep-ts';
import { createGroupsName } from 'src/app/Function/tension';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'tension-holes',
  templateUrl: './tension-holes.component.html',
  styleUrls: ['./tension-holes.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('pageAnimations', [
      transition('* => *', [
        group([
          query(':leave', [style({ opacity: 0 })], { optional: true }),
          query(':enter', [
            style({ transform: 'translateY(-100%)', opacity: 0 }),
            stagger(80, [ animate(200, style({ transform: 'translateY(0)', opacity: 1 })) ])
          ],
          { optional: true })
        ])
      ])
    ]),
    trigger('showAnimations', [
      transition('* => *', [
        group([
          query(':leave', [style({ opacity: .5 })], { optional: true }),
          query(':enter', [
            style({opacity: .5 }),
            animate(200, style({ opacity: 1 }))
          ],
          { optional: true })
        ])
      ])
    ]),
  ]
})
export class TensionHolesComponent implements OnInit, OnChanges {
  @Input() show = false;
  @Input() edit = true;

  @Input() data: TensionTask;
  @Input() formData: FormGroup;
  @Input() upDataState = false;

  @Output() outSelectHole = new EventEmitter();
  /** 上一次数据id */
  bid = null;
  groupsName: Array<GroupsName>;

  get tensionHoleInfosFormArray(): FormArray {
    return this.formData.get('tensionHoleInfos') as FormArray;
  }
  get nowFromGroup() {
    return this.tensionHoleInfosFormArray.at(this.groupIndex);
  }
  get tensionHoleInfos(): Array<TensionHoleInfo> {
    return this.tensionHoleInfosFormArray.value;
  }
  // get holeNames(): Array<any> {
  //   return this.formData.get('sort').value;
  // }
  otherKey = [];
  chsub: Subscription = null;
  groupItem: TensionHoleInfo;
  groupIndex: number = null;

  @Output() updateHole = new EventEmitter();

  constructor(
    public appS: AppService,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef,
  ) { }

  ngOnInit() {
  }
  ngOnChanges(changes: SimpleChanges) {
    // this.initForm();
    this.getGroupsName();
  }
  getGroupsName(data = this.data) {
    console.log('12345789数据变更', this.groupsName, this.tensionHoleInfos, this.formData.get('tensionHoleInfos'));
    this.groupsName = createGroupsName(data);
    this.switchHole(0);
    this.cdr.detectChanges();
  }
  initForm() {
    this.tensionHoleInfosFormArray.clear();
    this.createForm(this.tensionHoleInfos).map(si => {
      this.tensionHoleInfosFormArray.push(si);
    })
    // this.formData.controls.name.updateValueAndValidity();
    setTimeout(() => {
      this.formData.controls.name.markAsDirty();
      this.formData.controls.name.updateValueAndValidity();
    }, 10);
    this.cdr.detectChanges();
  }
  createForm(arrData: Array<TensionHoleInfo> = []): FormGroup[] {
    return arrData.map(d => {
      return this.corateFormGroup(d);
    })
  }
  corateFormGroup(data: TensionHoleInfo) {
    return this.fb.group({
      /** 孔号 */
      name: [data.name],
      /** 张拉工艺(先张，后张，分级张拉第一级，分级张拉第二级等) */
      stretchDrawProcess: [data.stretchDrawProcess],
      /** 张拉长度 */
      length: [data.length],
      /** 钢绞线数据 */
      steelStrandNum: [data.steelStrandNum],
      /** 张拉状态 */
      state: [data.state],
      /** 上传状态 */
      uploading: [data.uploading],
      /** 其他数据 */
      otherInfo: this.fb.array([]),
      tasks: this.fb.array([]),
    });
  }
  /** 切换孔 */
  switchHole(index: number) {
    console.log(index);
    this.groupIndex = null;
    setTimeout(() => {
      this.groupIndex = index;
      this.groupItem = this.tensionHoleInfos[index];
      if (!this.appS.edit) {
        this.outSelectHole.emit({index, item: this.groupsName[index]});
      }
      this.redraw();
    }, 0);
  }
  redraw() {
    this.cdr.detectChanges();
  }

}
