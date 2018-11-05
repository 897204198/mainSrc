import { Component } from '@angular/core';
import { Platform } from 'ionic-angular';
import { Keyboard } from '@ionic-native/keyboard';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { TabsPage } from '../pages/tabs/tabs';
import { LoginPage } from '../pages/login/login';
import { TranslateService } from '@ngx-translate/core';
import { UserService } from './services/user.service';
import { DeviceService } from './services/device.service';
import { PushService } from './services/push.service';

@Component({
  templateUrl: 'app.html'
})
export class MyApp {

  // app页面
  rootPage: any;

  /**
   * 构造函数
   */
  constructor(
    statusBar: StatusBar,
    splashScreen: SplashScreen,
    keyboard: Keyboard,
    private platform: Platform,
    private userService: UserService,
    private deviceService: DeviceService,
    private pushService: PushService,
    private translate: TranslateService) {

    // 判断是否已登录
    if (this.userService.isLogin()) {
      localStorage.setItem('tabs', '1');
      this.rootPage = TabsPage;
    } else {
      localStorage.setItem('login', '1');
      this.rootPage = LoginPage;
    }

    // noinspection TypeScriptUnresolvedFunction
    this.platform.ready().then(() => {
      keyboard.disableScroll(true);
      statusBar.styleDefault();
      splashScreen.hide();

      // 设置设备信息
      this.deviceService.setDeviceInfo();
      // 初始化推送插件
      this.pushService.init();
    });

    // 初始国际化
    this.translate.setDefaultLang('zh-cn');
  }
}
