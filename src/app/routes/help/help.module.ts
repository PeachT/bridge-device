import { NgModule } from '@angular/core';

import { SharedModule } from 'src/app/shared/shared.module';
import { HelpComponent } from './help.component';
import { HelpRoutingModule } from './help.routing';


@NgModule({
  declarations: [HelpComponent],
  imports: [
    SharedModule,
    HelpRoutingModule
  ]
})
export class HelpModule { }
