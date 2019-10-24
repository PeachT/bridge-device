import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ProjectRoutingModule } from './project.routing';
import { SharedModule } from 'src/app/shared/shared.module';
import { ProjectComponent } from './project.component';
import { PersonInfoComponent } from './person-info/person-info.component';
import { XaljUpComponent } from './xalj-up/xalj-up.component';
import { HzxfUpComponent } from './hzxf-up/hzxf-up.component';

@NgModule({
  declarations: [ProjectComponent, PersonInfoComponent, XaljUpComponent, HzxfUpComponent],
  imports: [
    SharedModule,
    ProjectRoutingModule
  ],
  exports: [
    ProjectRoutingModule
  ]
})
export class ProjectModule { }
