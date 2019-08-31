import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { DefaultComponent } from "./layout/default/default.component";
import { HeaderComponent } from "./layout/header/header.component";
import { GlobalEditGuard } from "./models/edit-guard";

const routes: Routes = [
  {
    path: "",
    component: DefaultComponent,
    children: [
      { path: "", redirectTo: "login", pathMatch: "full" },
      {
        path: "login",
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
        loadChildren: () =>
          import("./routes/task/task.module").then(m => m.TaskModule),
        data: { title: "张拉" },
        canDeactivate: [GlobalEditGuard]
      },
      {
        path: "grouting",
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
        loadChildren: () =>
          import("./routes/jack/jack.module").then(m => m.JackModule),
        data: { title: "千斤顶" },
        canDeactivate: [GlobalEditGuard]
      },
      {
        path: "project",
        loadChildren: () =>
          import("./routes/project/project.module").then(m => m.ProjectModule),
        data: { title: "项目" },
        canDeactivate: [GlobalEditGuard]
      },
      {
        path: "component",
        loadChildren: () =>
          import("./routes/component/component.module").then(
            m => m.ComponentModule
          ),
        data: { title: "构建" },
        canDeactivate: [GlobalEditGuard]
      },
      {
        path: "user",
        loadChildren: () =>
          import("./routes/user/user.module").then(m => m.UserModule),
        data: { title: "用户" },
        canDeactivate: [GlobalEditGuard]
      },
      {
        path: "help",
        loadChildren: () =>
          import("./routes/help/help.module").then(m => m.HelpModule),
        data: { title: "帮助" },
        canDeactivate: [GlobalEditGuard]
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
