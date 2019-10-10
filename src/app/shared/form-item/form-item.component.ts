import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-form-item',
  templateUrl: './form-item.component.html',
  styleUrls: ['./form-item.component.less']
})
export class FormItemComponent implements OnInit {
  @Input() colnzXs = 24;
  @Input() colnzSm = 12;
  @Input() colnzMd =  8;
  @Input() colnzLg =  8;
  @Input() colnzXl =  8;
  @Input() colnzXXl =  6;
  @Input() row = false;
  @Input() label: string;
  @Input() errors: any;
  @Input() errorMsg: any = null;
  constructor() { }

  ngOnInit() {
    if (this.row) {
      this.colnzXs = 24;
      this.colnzSm = 24;
      this.colnzMd = 24;
      this.colnzLg = 24;
      this.colnzXl = 24;
      this.colnzXXl = 24;
    }
  }

}
