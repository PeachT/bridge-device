import { Component, OnInit } from '@angular/core';
import { AppService } from 'src/app/services/app.service';

@Component({
  selector: 'app-data-treating',
  templateUrl: './data-treating.component.html',
  styleUrls: ['./data-treating.component.less'],
})
export class DataTreatingComponent implements OnInit {

  constructor( public apps: AppService,) { }

  ngOnInit() {

  }

}
