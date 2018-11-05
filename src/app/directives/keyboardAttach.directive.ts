
import { Directive, ElementRef, Input } from '@angular/core';
import { Content, Platform } from 'ionic-angular';
import 'rxjs/Rx';
import { Subscription } from 'rxjs/Subscription';
import { Keyboard } from '@ionic-native/keyboard';

@Directive({
  selector: '[icmp-keyboard-attach]'
})
export class IcmpKeyboardAttachDirective {

  @Input('icmp-keyboard-attach') content: Content;
  private onShowSubscription: Subscription;
  private onHideSubscription: Subscription;

  constructor(private elementRef: ElementRef, private platform: Platform, private keyboard: Keyboard) {
    if (this.platform.is('cordova') && this.platform.is('ios')) {
      this.onShowSubscription = this.keyboard.onKeyboardShow().subscribe(e => this.onShow(e));
      this.onHideSubscription = this.keyboard.onKeyboardHide().subscribe(() => this.onHide());
    }
  }

  ngOnDestroy() {
    if (this.onShowSubscription) {
      this.onShowSubscription.unsubscribe();
    }
    if (this.onHideSubscription) {
      this.onHideSubscription.unsubscribe();
    }
  }

  // 打开键盘事件
  private onShow(e) {
    setTimeout(() => {
      let keyboardHeight: number = e.keyboardHeight || (e.detail && e.detail.keyboardHeight);
      this.setElementPosition(keyboardHeight);
    }, 260);
  };

  // 关闭键盘事件
  private onHide() {
    this.setElementPosition(0);
  };

  // 关闭键盘事件
  private setElementPosition(pixels: number) {
    this.elementRef.nativeElement.style.paddingBottom = pixels + 'px';
    this.content.resize();
  }
}
