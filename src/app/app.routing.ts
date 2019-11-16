import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { DefaultComponent } from "./layout/default/default.component";
import { HeaderComponent } from "./layout/header/header.component";
import { GlobalEditGuard, TaskGuard } from "./models/edit-guard";

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
      // {
      //   path: "live-grouting",
      //   loadChildren: () =>
      //     import("./routes/live-grouting/live-grouting.module").then(m => m.LiveGroutingModule),
      //   data: { title: "压浆监控" }
      // }
    ]
  },
  {
    path: "",
    component: HeaderComponent,
    children: [
      {
        path: "tension",
        // component: TaskComponent,
        loadChildren: () =>
          import("./routes/tension/tension.module").then(m => m.TensionModule),
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
        path: "tension-setting",
        loadChildren: () =>
          import("./routes/tension-setting/tension-setting.module").then(
            m => m.TensionSettingModule
          ),
        data: { title: "张拉设置" }
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
        data: { title: "构建" },
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
      },
      {
        path: "live-grouting",
        loadChildren: () =>
          import("./routes/live-grouting/live-grouting.module").then(m => m.LiveGroutingModule),
        data: { title: "压浆监控" },
        canDeactivate: [GlobalEditGuard],
        canActivate:[TaskGuard]
      },
      {
        path: "live-tension",
        loadChildren: () =>
          import("./routes/live-tension/live-tension.module").then(m => m.LiveTensionModule),
        data: { title: "张拉监控" },
        canDeactivate: [GlobalEditGuard],
        canActivate:[TaskGuard]
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
