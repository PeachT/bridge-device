import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TensionSettingRoutingModule } from './tension-setting.routing';
import { TensionSettingComponent } from './tension-setting.component';
import { SharedModule } from 'src/app/shared/shared.module';


@NgModule({
  declarations: [TensionSettingComponent],
  imports: [
    SharedModule,
    TensionSettingRoutingModule
  ]
})
export class TensionSettingModule { }
