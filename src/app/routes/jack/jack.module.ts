import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { JackRoutingModule } from './jack.routing';
import { JackComponent } from './jack.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { JackItemComponent } from './jack-item/jack-item.component';


@NgModule({
  declarations: [JackComponent, JackItemComponent],
  imports: [
    SharedModule,
    JackRoutingModule
  ]
})
export class JackModule { }
