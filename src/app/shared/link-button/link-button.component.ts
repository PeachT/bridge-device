import { Component, OnInit, ChangeDetectorRef, Input } from '@angular/core';
import { PLCService } from 'src/app/services/plc.service';
import { Store } from '@ngrx/store';
import { NgrxState } from 'src/app/ngrx/reducers';
import { Observable } from 'rxjs';
import { TcpLive } from 'src/app/models/tensionLive';
import { resetTcpLive } from 'src/app/ngrx/actions/tcpLink.action';
import { AppService } from 'src/app/services/app.service';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'link-button',
  templateUrl: './link-button.component.html',
  styleUrls: ['./link-button.component.less'],
  animations: [
    trigger('slideInOut', [
      transition(':enter', [
        style({transform: 'translateY(-100%)'}),
        animate('200ms ease-in', style({transform: 'translateY(0%)'}))
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({transform: 'translateY(-100%)'}))
      ]),
      transition('* => moveRight', [
        animate('.3s ease-in', style({transform: 'translateX(100%)'}))
      ]),
      transition('moveRight => *', [
        style({transform: 'translateX(100%)'}),
        animate('.3s ease-in', style({transform: 'translateX(0)'}))
      ])
    ]),
    trigger('slideInRight', [
      transition(':enter', [
        style({transform: 'translateX(100%)'}),
        animate('.3s ease-in', style({transform: 'translateX(0%)'}))
      ]),
      transition(':leave', [
        animate('.3s ease-in', style({transform: 'translateX(100%)'}))
      ])
    ])
  ]
})
export class LinkButtonComponent implements OnInit {
  // tcpLink$ = new Observable<TcpLive>();
  /** 显示链接操作 */
  visible = false;
  move = '';
  get animationTime() {
    if (this.PLCS.socketInfo.linkDelay < 150) {
      return '0.2s';
    } else if (this.PLCS.socketInfo.linkDelay > 150 && this.PLCS.socketInfo.linkDelay < 500) {
      return '0.5s';
    } else if (this.PLCS.socketInfo.linkDelay > 500 && this.PLCS.socketInfo.linkDelay < 1001) {
      return '1s';
    } else if (this.PLCS.socketInfo.linkDelay > 0) {
      return '2s';
    } else {
      return '0s'
    }
  }
  get plcState() {
    return this.PLCS.socketInfo.state === 'success';
  }

  constructor(
    public appS: AppService,
    public PLCS: PLCService,
    // private store$: Store<NgrxState>,
    private crd: ChangeDetectorRef,
  ) { }

  ngOnInit() {
    // this.store$.dispatch(resetTcpLive(null))
    // this.tcpLink$ = this.store$.select(state => state.tcpLive);
    // this.tcpLink$.subscribe((r) => {
    //   console.warn(r, this.PLCS.tcp.linkMsg);
    //   this.crd.detectChanges();
    // });
    this.PLCS.LinkState$.subscribe(r => {
      this.crd.detectChanges();
    });
  }
  cancelLink() {
    this.visible = false;
    this.move = null;
    setTimeout(() => {
      this.PLCS.cancelLink();
    }, 10);
  }
}
