import { Component, Input, Output, OnInit, EventEmitter } from '@angular/core';
import { Store } from '@ngrx/store';
import { RequestResetAction } from '../../redux/actions/request.action';
import { REQUEST_INDEX_STATE } from '../../redux/app.reducer';

@Component({
  selector: 'icmp-spinner',
  templateUrl: 'spinner.component.html',
  styleUrls: ['/app/component/spinner/spinner.component.scss']
})
export class IcmpSpinnerComponent implements OnInit {

  @Input() isShow: boolean;
  @Output() onTerminated: EventEmitter<boolean> = new EventEmitter();

  constructor(private store: Store<number>) {
    this.store.dispatch(new RequestResetAction());
  }

  ngOnInit(): void {
    if (this.isShow == null) {
      // 监控http请求变化
      this.store.select(REQUEST_INDEX_STATE).subscribe((data: number) => {
        this.isShow = (data > 0);
      });
    }
  }

  // 双击取消遮蔽罩
  hideSpinner(): void {
    this.store.dispatch(new RequestResetAction());
    this.onTerminated.emit(true);
  }
}
