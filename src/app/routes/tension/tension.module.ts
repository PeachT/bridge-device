import { NgModule } from '@angular/core';

import { TensionRoutingModule } from './tension.routing';
import { TensionComponent } from './tension.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { TensionHolesComponent } from './tension-holes/tension-holes.component';
import { TensionHoleTaskComponent } from './tension-hole-task/tension-hole-task.component';
import { TensionHoleRecordComponent } from './tension-hole-record/tension-hole-record.component';
import { TensionHoleTaskStageComponent } from './tension-hole-task-stage/tension-hole-task-stage.component';
import { TensionManualGroupComponent } from './tension-manual-group/tension-manual-group.component';
import { DragDropModule } from '@angular/cdk/drag-drop';


@NgModule({
  declarations: [TensionComponent, TensionHolesComponent, TensionHoleTaskComponent, TensionHoleRecordComponent, TensionHoleTaskStageComponent, TensionManualGroupComponent],
  imports: [
    SharedModule,
    TensionRoutingModule,
    DragDropModule
  ]
})
export class TensionModule { }
