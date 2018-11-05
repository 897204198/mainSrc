import { Directive, Output, HostListener, EventEmitter } from '@angular/core';

@Directive({
  selector: '[icmp-dblclick]'
})
export class IcmpDblclickDirective {

  @Output() icmpDblclick: EventEmitter<any> = new EventEmitter();
  firstClickTime: number;
  waitingSecondClick: boolean = false;

  constructor() {}

  // 监听点击事件
  @HostListener('click', ['$event']) dblclick(event: any): void {
    const dblclickInterval: number = 300;
    if (!this.waitingSecondClick) {
      this.firstClickTime = (new Date()).getTime();
      this.waitingSecondClick = true;
      setTimeout(() => {
        this.waitingSecondClick = false;
      }, dblclickInterval);
    } else {
      this.waitingSecondClick = false;
      let time = (new Date()).getTime();
      if (time - this.firstClickTime < dblclickInterval) {
        this.icmpDblclick.emit(event);
      }
    }
  }
}
