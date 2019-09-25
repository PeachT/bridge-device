import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { DbService } from 'src/app/services/db.service';
import { NzMessageService } from 'ng-zorro-antd';

@Component({
  selector: 'app-grouting-template',
  templateUrl: './grouting-template.component.html',
  styleUrls: ['./grouting-template.component.less']
})
export class GroutingTemplateComponent implements OnInit {
  @Input() projectId: number;
  data: any = [];
  select = null;

  @Output() selectOut = new EventEmitter();
  @Output() cancel = new EventEmitter();

  constructor(
    private db: DbService,
    private message: NzMessageService,
  ) { }

  async ngOnInit() {
    console.log(this.projectId);

    const arr = await this.db.db.grouting.filter(g => g.project === this.projectId && g.template).toArray();
    console.log(arr);

    arr.map(g => {
      console.log(g);

      this.data.push({name: `${g.component}-${g.name}`, id: g.id});
    });
    console.log(this.data);

    // .each(g => {
    //   console.log(this.data, g);
    // });

  }
  ok() {
    if (this.select) {
      this.selectOut.emit(this.select);
    } else {
      this.message.error('请选择模板');
    }
  }

}
