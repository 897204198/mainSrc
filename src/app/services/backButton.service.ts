import { Injectable } from '@angular/core';
import { Platform, App, NavController, Tabs } from 'ionic-angular';
import { ToastService } from './toast.service';
import { TranslateService } from '@ngx-translate/core';
import { AppMinimize } from '@ionic-native/app-minimize';

/**
 * 安卓物理返回键服务
 */
@Injectable()
export class BackButtonService {

  // 返回按钮是否触发
  backButtonPressed: boolean = false;
  // 国际化文字
  private transateContent: Object;

  /**
   * 构造函数
   */
  constructor(public platform: Platform,
              public appCtrl: App,
              private toastService: ToastService,
              private translate: TranslateService,
              private appMinimize: AppMinimize) {
    this.translate.get(['BACKBUTTON_PROMPT']).subscribe((res: Object) => {
      this.transateContent = res;
    });
  }

  /**
   * 注册返回按钮
   */
  registerBackButtonAction(tabRef: Tabs): void {
    this.platform.registerBackButtonAction(() => {
      let activeNav: NavController = this.appCtrl.getActiveNav();
      if (activeNav.canGoBack() && tabRef != null) {
        activeNav.pop();
      } else {
        // 登录页两次弹窗退出 
        // tab 页直接最小化
        if (tabRef == null) {
          this.showExit();
        } else {
          this.appMinimize.minimize();
        }
      }
    });
  }

  /**
   * 点击两次退出应用
   */
  private showExit(): void {
    if (this.backButtonPressed) {
      this.platform.exitApp();
    } else {
      this.toastService.show(this.transateContent['BACKBUTTON_PROMPT']);
      this.backButtonPressed = true;
      setTimeout(() => this.backButtonPressed = false, 2000);
    }
  }
}
