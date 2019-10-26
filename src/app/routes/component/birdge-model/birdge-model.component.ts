import { Component, OnInit, OnChanges, Input, SimpleChanges, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { FormGroup, FormArray, FormBuilder, Validators, ValidatorFn, AbstractControl, FormControl } from '@angular/forms';
import { PersonInfo } from 'src/app/models/project';
import { AppService } from 'src/app/services/app.service';
import { Hole } from 'src/app/models/component';
import { DomSanitizer } from '@angular/platform-browser';
import { onImg } from 'src/app/models/base64';
import { NzMessageService } from 'ng-zorro-antd';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'component-birdge-model',
  templateUrl: './birdge-model.component.html',
  styleUrls: ['./birdge-model.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BirdgeModelComponent implements OnInit, OnChanges {
  @Input() formGroup: FormGroup;
  /** 候选的KEY */
  @Input() keys = [];
  @Input() data: Array<Hole> = [];
  /** 上传图片地址 */
  imgsrc: string;
  imgBase64: any;
  onImg = onImg;

  get forFormArr(): FormArray {
    return this.formGroup.get('hole') as FormArray;
  }

  constructor(
    public appS: AppService,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef,
    private message: NzMessageService
  ) { }

  ngOnInit() {
  }

  ngOnChanges(changes: SimpleChanges) {
    this.createForm(this.data).map(si => {
      this.forFormArr.push(si)
    })
  }

  /** 其他信息 */
  createForm(data: Array<Hole> = []) {
    return data.map((item, i) => {
      return this.createControl(i, item);
    });
  }
  /** 其他form */
  createControl(index: number, item: Hole = { name: null, holes: [], imgBase64: null }): FormGroup {
    return this.fb.group({
      /** 名字 */
      name: [item.name, [Validators.required, this.arrayValidator(index)]],
      holes: [item.holes, [Validators.required]],
      imgBase64: [item.imgBase64]
    });
  }
  /** 添加其他数据 */
  add() {
    const length = this.forFormArr.value.length;
    this.forFormArr.push(this.createControl(length));
  }
  /** 删除其他数据 */
  remove(index: number) {
    this.forFormArr.removeAt(index);
  }
  /** 添加孔号 */
  addHoleName(control: FormGroup, event) {
    const name = event.target.value;
    console.log(control, name);
    if (name && control.value.holes.indexOf(name) !== -1) {
      console.error(name, '已存在');
      return;
    }
    control.controls.holes.setValue([...control.value.holes, name])
    event.target.value = null;
    console.log(control.value.holes);
  }
  /** 输入孔号 */
  addHoleInput(control: FormGroup, name: string) {
    console.log(control);

    if (control.value.holes.indexOf(name) !== -1) {
      console.log(name, '已存在');
      control.controls.holes.setErrors({valueRepetition: `${name} 已存在`})
    } else {
      control.controls.holes.updateValueAndValidity();
    }
  }
  /** 删除孔号 */
  delHoleName(control: FormGroup, i) {
    console.log(i);
    const holes = [...control.value.holes];
    holes.splice(i,1);
    control.controls.holes.setValue(holes);
  }
  /** key过滤 */
  bridgeOtherKeySelect() {
    const arr = this.forFormArr.value.map(v => v.key);
    return this.keys.filter(v => arr.indexOf(v) === -1);
  }
  holeNameSelect(name) {
    return ['N1','N2','N3','N4','N5','N6','N7','N8','N9','N10'].filter(v => name.indexOf(v) === -1);
  }
  /**
   * 数组判断某个key重复
   *
   * @export
   * @param {number} index 下标
   * @param {string} arrKey 数组key
   * @param {string} [key='name'] 比较key
   * @returns {ValidatorFn}
   */
  arrayValidator(index: number): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      if (control.value) {
        const values: Array<Hole> = this.forFormArr.getRawValue();
        for (let i = 0; i < values.length; i++) {
          if (i !== index && values[i].name === control.value) {
            return { reperition: `${control.value} 已存在!!` };
          }
        }
      }
      return null;
    };
  }
  /** 上传图片 */
  fileChange(e, controls: FormGroup) {
    const file = e.srcElement.files[0]; // 获取图片这里只操作一张图片
    // this.imgsrc = window.URL.createObjectURL(file); // 获取上传的图片临时路径
    // if(!/image\/\w+/.test(file.type)){
    //     alert("请确保文件为图像类型");
    //     return false;
    // }
    console.log(file, file.size);

    if (!/image\/\w+/.test(file.type)) {
      this.message.error('请确保文件为图像类型');
      return;
    } else if (file.size > 1024 * 1024) {
      this.message.error('图片文件太大，只能上传小于1M的图片'); // 149 551 2 102 400
      return;
    } else {
      const reader =new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        this.imgBase64 = reader.result;
        controls.get('imgBase64').setValue(reader.result);
        this.cdr.detectChanges();
      }
    }
  }
}
