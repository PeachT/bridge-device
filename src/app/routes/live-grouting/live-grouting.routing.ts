import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LiveGroutingComponent } from './live-grouting.component';


const routes: Routes = [{path: '', component: LiveGroutingComponent}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LiveGroutingRoutingModule { }
