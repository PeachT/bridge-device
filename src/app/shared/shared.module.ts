import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

// 动态表单
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { NgZorroAntdModule } from 'ng-zorro-antd';
import { LeftComponent } from './left/left.component';
import { ProjectComponent } from './project/project.component';
import { ValidatorErrorPipe } from '../pipes/error.pipe';
import { ToFixedrPipe } from '../pipes/toFixed.pipe';
import { GetPathNamePipe } from '../pipes/path.pipe';
import { LeftMenuComponent } from './left-menu/left-menu.component';
import { OperatComponent } from './operat/operat.component';
import { AddOtherComponent } from './add-other/add-other.component';
import { TimeSecComponent } from './time-sec/time-sec.component';
import { DataTreatingComponent } from './data-treating/data-treating.component';
import { DeleteModalComponent } from './delete-modal/delete-modal.component';
import { TaskMenuComponent } from './task-menu/task-menu.component';
import { GroutingTemplateComponent } from './grouting-template/grouting-template.component';
import { FormItemComponent } from './form-item/form-item.component';
import { DynamicLineGroutingComponent } from './echarts/dynamic-line-grouting/dynamic-line-grouting.component';
import { DataInOutComponent } from './data-treating/data-in-out/data-in-out.component';
import { Kn2mpaPipe, Mpa2knPipe, HoleNamePipe } from '../pipes/tension.pipe';
import { ScrollMenuComponent } from './scroll-menu/scroll-menu.component';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { DynamicLineTensionComponent } from './echarts/dynamic-line-tension/dynamic-line-tension.component';
import { LinkBaseComponent } from './link-base/link-base.component';
import { LinkButtonComponent } from './link-button/link-button.component';


// pipe

const MODULES = [
  RouterModule,
  NgZorroAntdModule,
  FormsModule,
  ReactiveFormsModule,
  CommonModule,
  ScrollingModule,
];

const COMPONENTS = [
  LeftComponent,
  ProjectComponent,
  LeftMenuComponent,
  OperatComponent,
  AddOtherComponent,
  TimeSecComponent,
  DataTreatingComponent,
  DeleteModalComponent,
  TaskMenuComponent,
  GroutingTemplateComponent,
  DynamicLineGroutingComponent,
  DynamicLineTensionComponent,
  FormItemComponent,
  DataInOutComponent,
  ScrollMenuComponent,
  LinkBaseComponent,
  LinkButtonComponent,
];
const PIPE = [
  ToFixedrPipe,
  ValidatorErrorPipe,
  GetPathNamePipe,
  Kn2mpaPipe,
  Mpa2knPipe,
  HoleNamePipe
];

@NgModule({
  declarations: [
    ...COMPONENTS,
    ...PIPE,
  ],
  imports: [
    ...MODULES,
  ],
  exports: [
    ...COMPONENTS,
    ...MODULES,
    ...PIPE,
  ],
  entryComponents: []
})
export class SharedModule { }
