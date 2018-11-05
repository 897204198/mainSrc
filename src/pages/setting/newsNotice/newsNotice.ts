import { Component, NgZone } from '@angular/core';
import { NativeStorage } from '@ionic-native/native-storage';
import { DeviceService, DeviceInfoState } from '../../../app/services/device.service';

/**
 * 新消息通知设置
 */
@Component({
  selector: 'page-news-notice',
  templateUrl: 'newsNotice.html'
})
export class NewsNoticePage {

  openVoice: boolean = false;
  openVibrate: boolean = false;
  isAndroid: boolean = false;

  /**
   * 构造函数
   */
  constructor(
    private zone: NgZone,
    private nativeStorage: NativeStorage,
    private deviceService: DeviceService) {
    this.nativeStorage.getItem('openVoice').then(data => {
      this.openVoice = data;
    });
    this.nativeStorage.getItem('openVibrate').then(data => {
      this.openVibrate = data;
    });
    const deviceInfo: DeviceInfoState = this.deviceService.getDeviceInfo();
    if (deviceInfo.deviceType === 'android') {
      (<any>window).huanxin.phoneBrand('', (data) => {
        this.zone.run(() => {
          if (data !== 'phone') {
            this.isAndroid = true;
          }
        });
      });
    }
  }

  /**
   * 声音开关
   */
  changeVoice() {
    this.nativeStorage.setItem('openVoice', this.openVoice);
  }

  /**
   * 震动开关
   */
  changeVibrate() {
    this.nativeStorage.setItem('openVibrate', this.openVibrate);
  }

  /**
   * 开启自动启动
   */
  openAutoRun() {
    (<any>window).huanxin.autorun('');
  }

  /**
   * 允许后台运行
   */
  allowBackstageRun() {
    (<any>window).huanxin.backstagerun('');
  }

}
