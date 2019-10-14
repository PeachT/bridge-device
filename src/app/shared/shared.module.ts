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


// pipe

const MODULES = [
  RouterModule,
  NgZorroAntdModule,
  FormsModule,
  ReactiveFormsModule,
  CommonModule,
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
  FormItemComponent,
];
const PIPE = [
  ToFixedrPipe,
  ValidatorErrorPipe,
  GetPathNamePipe,
];

@NgModule({
  declarations: [
    ...COMPONENTS,
    ...PIPE,
    DataInOutComponent,
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
