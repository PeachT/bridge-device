import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { DefaultComponent } from "./layout/default/default.component";
import { HeaderComponent } from "./layout/header/header.component";
import { GlobalEditGuard } from "./models/edit-guard";
import { TaskComponent } from './routes/task/task.component';
import { GroutingComponent } from './routes/grouting/grouting.component';
import { JackComponent } from './routes/task/components/jack/jack.component';
import { ProjectComponent } from './routes/task/components/project/project.component';
import { ComponentComponent } from './routes/component/component.component';
import { UserComponent } from './routes/user/user.component';
import { HelpComponent } from './routes/help/help.component';
import { LoginComponent } from './routes/login/login.component';

const routes: Routes = [
  {
    path: "",
    component: DefaultComponent,
    children: [
      { path: "", redirectTo: "login", pathMatch: "full" },
      {
        path: "login",
        // component: LoginComponent
        loadChildren: () =>
          import("./routes/login/login.module").then(m => m.LoginModule),
        data: { title: "登录" }
      },
      {
        path: "auto",
        loadChildren: () =>
          import("./routes/auto/auto.module").then(m => m.AutoModule),
        data: { title: "自动" }
      }
    ]
  },
  {
    path: "",
    component: HeaderComponent,
    children: [
      {
        path: "task",
        // component: TaskComponent,
        loadChildren: () =>
          import("./routes/task/task.module").then(m => m.TaskModule),
        data: { title: "张拉" },
        canDeactivate: [GlobalEditGuard]
      },
      {
        path: "grouting",
        // component: GroutingComponent,
        loadChildren: () =>
          import("./routes/grouting/grouting.module").then(
            m => m.GroutingModule
          ),
        data: { title: "压浆" },
        canDeactivate: [GlobalEditGuard]
      },
      {
        path: "manual",
        loadChildren: () =>
          import("./routes/manual/manual.module").then(m => m.ManualModule),
        data: { title: "手动" }
      },
      {
        path: "setting",
        loadChildren: () =>
          import("./routes/setting/setting.module").then(m => m.SettingModule),
        data: { title: "设置" }
      },
      {
        path: "grouting-setting",
        loadChildren: () =>
          import("./routes/grouting-setting/grouting-setting.module").then(
            m => m.GroutingSettingModule
          ),
        data: { title: "压浆设置" }
      },
      {
        path: "jack",
        // component: JackComponent,
        loadChildren: () =>
          import("./routes/jack/jack.module").then(m => m.JackModule),
        data: { title: "千斤顶" },
        canDeactivate: [GlobalEditGuard]
      },
      {
        path: "project",
        // component: ProjectComponent,
        loadChildren: () =>
          import("./routes/project/project.module").then(m => m.ProjectModule),
        data: { title: "项目" },
        canDeactivate: [GlobalEditGuard]
      },
      {
        path: "component",
        // component: ComponentComponent,
        loadChildren: () =>
          import("./routes/component/component.module").then(
            m => m.ComponentModule
          ),
        // data: { title: "构建" },
        canDeactivate: [GlobalEditGuard]
      },
      {
        path: "user",
        // component: UserComponent,
        loadChildren: () =>
          import("./routes/user/user.module").then(m => m.UserModule),
        data: { title: "用户" },
        canDeactivate: [GlobalEditGuard]
      },
      {
        path: "help",
        // component: HelpComponent,
        loadChildren: () =>
          import("./routes/help/help.module").then(m => m.HelpModule),
        data: { title: "帮助" },
        canDeactivate: [GlobalEditGuard]
      }
    ]
  }
];

const COMPONENTS = [
  // LoginComponent,
  // HelpComponent
];
@NgModule({
  declarations: [
    ...COMPONENTS
  ],
  imports: [RouterModule.forRoot(routes)],
  exports: [
    RouterModule,
    ...COMPONENTS
  ]
})
export class AppRoutingModule {}
