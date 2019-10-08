import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { GroutingRoutingModule } from './grouting.routing';
import { GroutingComponent } from './grouting.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { GroutingRecordComponent } from './components/grouting-record/grouting-record.component';
import { ProportionComponent } from './components/proportion/proportion.component';
import { GroutingMianComponent } from './components/mian/mian.component';
import { GroutingRecordItemComponent } from './components/grouting-record-item/grouting-record-item.component';
import { MixingInfoComponent } from './components/mixing-info/mixing-info.component';


@NgModule({
  declarations: [
    GroutingComponent,
    GroutingRecordComponent,
    GroutingRecordItemComponent,
    ProportionComponent,
    MixingInfoComponent,
    GroutingMianComponent,
  ],
  imports: [
    SharedModule,
    GroutingRoutingModule,
  ]
})
export class GroutingModule { }
