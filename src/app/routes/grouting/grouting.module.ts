import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { GroutingRoutingModule } from './grouting.routing';
import { GroutingComponent } from './grouting.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { GroutingRecordComponent } from './components/grouting-record/grouting-record.component';
import { ProportionComponent } from './components/proportion/proportion.component';


@NgModule({
  declarations: [
    GroutingComponent,
    GroutingRecordComponent,
    ProportionComponent
  ],
  imports: [
    SharedModule,
    GroutingRoutingModule
  ]
})
export class GroutingModule { }
