import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { GroutingComponent } from './grouting.component';


const routes: Routes = [{path: '', component: GroutingComponent}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class GroutingRoutingModule { }
