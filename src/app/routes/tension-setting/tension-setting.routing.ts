import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { TensionSettingComponent } from './tension-setting.component';


const routes: Routes = [{path: '', component: TensionSettingComponent}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TensionSettingRoutingModule { }
