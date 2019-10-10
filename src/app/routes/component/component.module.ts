import { NgModule } from '@angular/core';

import { ComponentRoutingModule } from './component.routing';
import { ComponentComponent } from './component.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { BirdgeModelComponent } from './birdge-model/birdge-model.component';

@NgModule({
  declarations: [ComponentComponent, BirdgeModelComponent],
  imports: [
    SharedModule,
    ComponentRoutingModule
  ]
})
export class ComponentModule { }
