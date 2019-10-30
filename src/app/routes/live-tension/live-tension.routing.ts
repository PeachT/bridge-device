import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LiveTensionComponent } from './live-tension.component';


const routes: Routes = [{path: '', component: LiveTensionComponent}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LiveTensionRoutingModule { }
