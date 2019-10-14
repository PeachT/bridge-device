import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { format } from 'date-fns';

@Component({
  selector: 'app-time-sec',
  templateUrl: './time-sec.component.html',
  styleUrls: ['./time-sec.component.less'],
  // changeDetection: ChangeDetectionStrategy.OnPush
})
export class TimeSecComponent implements OnInit {
  time = (format(new Date(), 'MM-dd hh:mm:ss'));
  constructor(private cdr: ChangeDetectorRef) { }

  ngOnInit() {
    setInterval(() => {
      this.time = (format(new Date(), 'MM-dd hh:mm:ss'));
      localStorage.setItem('lastTime', `${new Date().getTime()}`);
      this.cdr.markForCheck();
    }, 1000);
  }

}
