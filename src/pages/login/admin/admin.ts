import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { ToastService } from '../../../app/services/toast.service';
import { TranslateService } from '@ngx-translate/core';
import { ConfigsService } from '../../../app/services/configs.service';

/**
 * 开发者设置页面
 */
@Component({
  selector: 'page-admin',
  templateUrl: 'admin.html'
})
export class AdminPage {

  // 服务器地址
  private baseUrl: string;
  // 推送服务器地址
  private pushUrl: string;
  // 推送服务器地址
  private chatKey: string;
  // 国际化文字
  private transateContent: Object;

  /**
   * 构造函数
   */
  constructor(public navCtrl: NavController,
              private toastService: ToastService,
              private configsService: ConfigsService,
              private translate: TranslateService) {
    this.translate.get(['SETTING_SUCCESS']).subscribe((res: Object) => {
      this.transateContent = res;
    });
  }

  /**
   * 每次次进入页面
   */
  ionViewDidEnter(): void {
    this.baseUrl = this.configsService.getBaseUrl();
    this.pushUrl = this.configsService.getPushUrl();
    this.chatKey = this.configsService.getChatKey();
  }

  /**
   * 保存url
   */
  saveUrl(): void {
    this.configsService.setBaseUrl(this.baseUrl);
    this.configsService.setPushUrl(this.pushUrl);
    this.configsService.setChatKey(this.chatKey);
    this.showToastAndPop();
  }

  /**
   * 重置url
   */
  resetUrl(): void {
    this.configsService.setBaseUrl('');
    this.configsService.setPushUrl('');
    this.configsService.setChatKey('');
    this.showToastAndPop();
  }

  /**
   * 显示Toast然后离开页面
   */
  private showToastAndPop(): void {
    this.toastService.show(this.transateContent['SETTING_SUCCESS']);
    this.navCtrl.pop();
  }
}
