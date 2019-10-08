import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { DbService } from 'src/app/services/db.service';
import { NzMessageService } from 'ng-zorro-antd';
import { Observable, from } from 'rxjs';
import { map } from 'rxjs/operators';
import { Project } from 'src/app/models/project';
import { GroutingTask } from 'src/app/models/grouting';

@Component({
  selector: 'app-grouting-template',
  templateUrl: './grouting-template.component.html',
  styleUrls: ['./grouting-template.component.less']
})
export class GroutingTemplateComponent implements OnInit {
  /** 选择项目 */
  @Input() projectId: number;
  projectMenu$: Observable<Array<{label: string; value: any;}>>;
  templateMenu$: Observable<Array<{label: string; value: any;}>>;
  data: any = [];
  select = null;

  @Output() selectOut = new EventEmitter();
  @Output() cancel = new EventEmitter();

  constructor(
    private db: DbService,
    private message: NzMessageService,
  ) { }

  async ngOnInit() {
    if (!this.projectId) {
      this.getProject();
    }
    console.log(this.data);
  }
  getProject() {
    this.projectMenu$ = from(this.db.db.project.toArray()).pipe(
      map(comps => {
        const arr = [];
        comps.map((item: Project) => {
          arr.push({ label: item.name, value: item.id });
        });
        return arr;
      })
    );
  }
  getTemplate() {
    this.templateMenu$ = from(this.db.db.grouting.filter(f => f.project === this.projectId && f.template).toArray()).pipe(
      map(comps => {
        const arr = [];
        comps.map((item: GroutingTask) => {
          arr.push({ label: `${item.component}-${item.name}`, value: item.id });
        });
        return arr;
      })
    );
  }
  selectProject() {
    this.select = null;
    this.getTemplate();
  }
  ok() {
    if (this.select) {
      this.selectOut.emit(this.select);
    } else {
      this.message.error('请选择模板');
    }
  }

}
