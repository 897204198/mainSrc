import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'page-oop-storm',
  templateUrl: 'oopStorm.html'
})
export class OopStormPage {

  // 国际化文字
  private translateArray: string[] = ['OOPSTORM_CONTANT'];
  // 版本号
  versionNumber: string = '';
  // 版本码
  versionCode: string = '';
  // 热部署版本 
  chcpVersion: string = '';
  // 描述
  description: string = '';

  constructor(public navCtrl: NavController, public navParams: NavParams, private translate: TranslateService) {
    translate.get(this.translateArray).subscribe((res: object) => {
      this.description = res['OOPSTORM_CONTANT'];
    });
    this.versionNumber = this.navParams.get('versionNumber');
    this.versionCode = this.navParams.get('versionCode');
    this.chcpVersion = this.navParams.get('chcpVersion');
  }

  close() {
    this.navCtrl.pop();
  }
}
