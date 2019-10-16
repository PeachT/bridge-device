import { Component, OnInit, OnChanges, Input, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { FormGroup, FormArray, FormBuilder, AbstractControl, ValidatorFn, Validators, FormControl } from '@angular/forms';
import { TensionStage, getModeStr, TensionHoleTask } from 'src/app/models/tension';
import { Subscription } from 'rxjs';
import { holeNameShow } from 'src/app/Function/tension';
import { copyAny } from 'src/app/models/base';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'tension-hole-task-stage',
  templateUrl: './tension-hole-task-stage.component.html',
  styleUrls: ['./tension-hole-task-stage.component.less']
})
export class TensionHoleTaskStageComponent implements OnInit, OnChanges {
  @Input() formData: FormGroup;
  @Input() data: TensionHoleTask;
  @Input() holeName: string;
  holeNames: any;
  stageNumber: number;

  otherKey = [];
  chsub: Subscription = null;
  /** 张拉顶模式字符串 */
  strMode: Array<string>;
  get stageGroup(): FormGroup {
    return this.formData.controls.stage as FormGroup;
  }
  get knPercentageFormArray(): FormArray {
    if ('knPercentage' in this.stageGroup.controls) {
      return this.stageGroup.controls.knPercentage as FormArray;
    } else {
      return null;
    }
  }
  get msgFormArray(): FormArray {
    if ('msg' in this.stageGroup.controls) {
      return this.stageGroup.controls.msg as FormArray;
    } else {
      return null;
    }
  }
  get timeFormArray(): FormArray {
    if ('time' in this.stageGroup.controls) {
      return this.stageGroup.controls.time as FormArray;
    } else {
      return null;
    }
  }
  get tensionKn(): number {
    return this.formData.controls.tensionKn.value;
  }
  get twice(): number {
    return this.formData.controls.twice.value;
  }
  get superState(): number {
    return this.formData.controls.super.value;
  }
  get mend(): number {
    return this.formData.controls.mend.value;
  }

  @Output() updateHole = new EventEmitter();

  constructor(
    private fb: FormBuilder,
  ) { }

  ngOnInit() {

  }
  ngOnChanges(changes: SimpleChanges) {
    console.log(this.strMode);
    this.createForm(this.data.stage, this.data.mode);
  }

  /** 阶段验证 */
  stageValidator(index: number): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      if (control.value) {

        const values: Array<number> = this.knPercentageFormArray.getRawValue();


        for (let i = 0; i < values.length; i++) {
          if (i !== index && ((index === 0 && i !== 1) || index !== 0)) {
            if (
              !((index > i && control.value >= values[i]) ||
              (index < i && control.value <= values[i]))
             ) {
                console.log(i, index, control.value, values[i]);
                return { stage: `设置有误！` };
              }
          }
        }
      }
      return null;
    };
  }
  createForm(d: TensionStage, mode) {
    this.strMode = getModeStr(mode);
    this.holeNames = holeNameShow(this.holeName, mode);

    this.stageGroup.addControl('uploadPercentage', this.fb.control(d.uploadPercentage, Validators.required));
    this.stageGroup.addControl('uploadDelay', this.fb.control(d.uploadDelay, Validators.required));

    this.stageGroup.addControl('knPercentage', this.fb.array([]));
    this.stageGroup.addControl('msg', this.fb.array([]));
    this.stageGroup.addControl('time', this.fb.array([]));
    this.createStageForm(d.knPercentage, d.msg, d.time);

    if (!this.stageNumber) {
      this.stageNumber = this.knPercentageFormArray.value.length;
    }

    this.strMode.map(key => {
      this.stageGroup.addControl(key,
        this.fb.group(
          {
            wordMm: [d[key].wordMm, Validators.required],
            theoryMm: [d[key].theoryMm, Validators.required]
          }
        )
      );
    });
  }
  createStageForm(kn: Array<number>, msg: Array<string>, time: Array<number>) {

    kn.map((item, index) => {
      (this.stageGroup.get('knPercentage') as FormArray).push(new FormControl(item,[Validators.required, this.stageValidator(index)]));
      (this.stageGroup.get('msg') as FormArray).push(this.fb.control(msg[index]));
      (this.stageGroup.get('time') as FormArray).push(this.fb.control(time[index], Validators.required));
    })
  }
  /** 修改阶段值 */
  inputStage(event, i) {
    const value = event.target.valueAsNumber;
    if (i === 0) {
      this.knPercentageFormArray.at(1).setValue(value * 2);
      this.stageGroup.get('uploadPercentage').setValue(value);
    }
  }
  /** 修改张拉阶段数 */
  stageChange(state = false) {
    console.log('张拉段数', this.stageNumber,
    this.formData.controls.twice.value,
    this.formData.controls.super.value,
    this.formData.controls.mend.value,
    );

    this.knPercentageFormArray.clear();
    this.msgFormArray.clear();
    this.timeFormArray.clear();
    const kn =[[], [], [], [10, 20, 100], [10, 20, 50, 100], [10, 20, 50, 80, 100]][this.stageNumber];
    const msg =[[], [], [], ['初张拉', '阶段一', '终张拉'], ['初张拉', '阶段一', '阶段二', '终张拉'], ['初张拉', '阶段一', '阶段二', '阶段三', '终张拉']][this.stageNumber];
    const time =[[], [], [], [30, 30, 300], [30, 30, 30, 300], [30, 30, 30, 30, 300]][this.stageNumber];
    this.createStageForm(kn, msg, time)
    this.superStage(this.formData.value.super, '超张拉');
  }
  superStage(event, msg) {
    console.log(event);
    if (event) {
      const length = this.knPercentageFormArray.value.length;
      this.knPercentageFormArray.push(new FormControl(103, [Validators.required, this.stageValidator(length)]));
      this.msgFormArray.push(this.fb.control(msg));
      this.timeFormArray.push(this.fb.control(300));
    } else {
      let index = null;
      this.msgFormArray.value.filter((f, i) => {
        if (f === msg) {
          index = i;
        }
      })
      if (index !== null) {
        this.knPercentageFormArray.removeAt(index);
        this.msgFormArray.removeAt(index);
        this.timeFormArray.removeAt(index);
      }
    }
  }
  /** 二次张拉 */
  twiceChange(event) {
    if (event) {
      if (this.stageNumber === 3) {
        this.stageNumber = 4;
        this.stageChange();
      }
    }
  }
  /** 切换张拉模式 */
  selectMode(event) {
    const value = copyAny(this.stageGroup.value)
    console.log(event, value);
    this.knPercentageFormArray.clear();
    this.msgFormArray.clear();
    this.timeFormArray.clear();
    this.createForm(value, event);
  }
  /** 修改工作长度|理论申长量 */
  inputWordmm(event, keyi, key) {
    if (keyi === 0) {
      const value = event.target.valueAsNumber;
      this.strMode.map((m, i) => {
        if (i !== 0) {
          (this.stageGroup.get(m) as FormGroup).controls[key].setValue(value);
        }
      });
    }
  }
}
