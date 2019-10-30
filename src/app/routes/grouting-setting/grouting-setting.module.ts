import { NgModule } from '@angular/core';

import { GroutingSettingRoutingModule } from './grouting-setting.routing';
import { GroutingSettingComponent } from './grouting-setting.component';
import { SharedModule } from 'src/app/shared/shared.module';


@NgModule({
  declarations: [GroutingSettingComponent],
  imports: [
    SharedModule,
    GroutingSettingRoutingModule
  ]
})
export class GroutingSettingModule { }
