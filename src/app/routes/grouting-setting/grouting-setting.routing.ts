import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { GroutingSettingComponent } from './grouting-setting.component';


const routes: Routes = [{path: '', component: GroutingSettingComponent}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class GroutingSettingRoutingModule { }
