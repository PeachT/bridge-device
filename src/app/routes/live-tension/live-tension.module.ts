import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { LiveTensionRoutingModule } from './live-tension.routing';
import { LiveTensionComponent } from './live-tension.component';
import { SharedModule } from 'src/app/shared/shared.module';


@NgModule({
  declarations: [LiveTensionComponent],
  imports: [
    SharedModule,
    LiveTensionRoutingModule
  ]
})
export class LiveTensionModule { }
