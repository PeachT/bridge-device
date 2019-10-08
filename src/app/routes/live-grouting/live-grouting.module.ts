import { NgModule } from '@angular/core';

import { LiveGroutingRoutingModule } from './live-grouting.routing';
import { LiveGroutingComponent } from './live-grouting.component';
import { SharedModule } from 'src/app/shared/shared.module';


@NgModule({
  declarations: [LiveGroutingComponent],
  imports: [
    SharedModule,
    LiveGroutingRoutingModule
  ]
})
export class LiveGroutingModule { }
