import { Component } from '@angular/core';
import { ViewController, NavParams } from 'ionic-angular';

@Component({
  selector: 'page-image-preview',
  templateUrl: 'imagePreview.html'
})
export class ImagePreviewPage {

  pictureUrl: string = '';
  transformNumber: number = 0;
  transform: string = 'rotate(0deg)';

  constructor(
    private viewCtrl: ViewController,
    private navParams: NavParams) {
    this.pictureUrl = this.navParams.get('pictureUrl');
  }

  // 关闭页面
  closeView() {
    this.viewCtrl.dismiss();
  }

  // 左旋转
  leftTransform() {
    this.transformNumber -= 90;
    this.transform = 'rotate(' + this.transformNumber + 'deg)';
  }

  // 右旋转
  rightTransform() {
    this.transformNumber += 90;
    this.transform = 'rotate(' + this.transformNumber + 'deg)';
  }
}
