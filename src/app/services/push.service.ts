import { Injectable, Inject } from '@angular/core';
import { AppConstant, APP_CONSTANT, ProperPushConstant } from '../constants/app.constant';
import { ConfigsService } from './configs.service';

/**
 * 推送插件服务
 */
@Injectable()
export class PushService {

  // 推送插件对象
  private targetObj: any;

  /**
   * 构造函数
   */
  constructor(@Inject(APP_CONSTANT) private appConstant: AppConstant, private configsService: ConfigsService) { }

  /**
   * 初始化目标对象
   */
  private initTargetObject(): void {
    if ((<any>window).plugins != null) {
      this.targetObj = (<any>window).plugins.properpush;
    }
  }

  /**
   * 初始化推送插件
   */
  init(): void {
    this.initTargetObject();
    if (this.targetObj) {
      let properPushConstant: ProperPushConstant = this.appConstant.properPushConstant;
      properPushConstant.pushUrl = this.configsService.getBaseUrl();
      this.targetObj.init(properPushConstant, () => { }, () => { });
    }
  }

  /**
   * 获取设备信息
   */
  getDeviceInfo(): Promise<any> {
    let self = this;
    return new Promise<any>(function (resolve, reject) {
      if (self.targetObj) {
        self.targetObj.getDeviceInfo(function (success) {
          resolve(success);
        }, function (error) {
          reject(error);
        });
      } else {
        let kvs = { 'uniqueId': '', 'type': 'web', 'jsonStr': '{}' };
        resolve(kvs);
      }
    });
  }

  /**
   * 绑定用户
   */
  bindUserid(userid: string): void {
    if (this.targetObj) {
      let kvs = { userid: userid, otherInfo: '', unbindOtherDevice: true };
      this.targetObj.bindUserid(kvs);
    }
  }

  /**
   * 取消与用户绑定
   */
  unBindUserid(userid: string): void {
    if (this.targetObj) {
      let kvs = { userid: userid, otherInfo: '' };
      this.targetObj.bindUserid(kvs, () => { }, () => { });
    }
  }

  /**
   * 本地设置角标及通知
   * 如果title,content,customDic为空，则只设置应用的角标，不发送通知
   * Properpush插件版本>=1.1.1，支持角标功能
   *
   * @param badgeNumber 角标数，=0时，清空角标,>0设置角标
   * @param title 通知标题
   * @param content 通知内容
   * @param customDic 通知对应的自定义键值对
   * @return {Promise<any>}
   */
  public sendBadgeNotification(badgeNumber: number, title?: string, content?: string, customDic?: any): Promise<any> {
    let self = this;
    if (badgeNumber < 0) {
      badgeNumber = 0;
    }
    return new Promise<any>(function (resolve, reject) {
      if (self.targetObj) {
        self.targetObj.sendBadgeNotification(badgeNumber, title, content, customDic, function (success) {
          resolve(success);
        }, function (error) {
          reject(error);
        });
      } else {
        resolve({});
      }
    });
  }
}
