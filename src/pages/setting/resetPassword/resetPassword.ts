import { Component, Inject } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { UserInfoState, initUserInfo, UserService } from '../../../app/services/user.service';
import { TranslateService } from '@ngx-translate/core';
import { CryptoService } from '../../../app/services/crypto.service';
import { APP_CONSTANT, AppConstant } from '../../../app/constants/app.constant';
import { Http, Response } from '@angular/http';
import { ToastService } from '../../../app/services/toast.service';

/**
 * 重置密码页面
 */
@Component({
  selector: 'page-reset-password',
  templateUrl: 'resetPassword.html',
})
export class ResetPasswordPage {

  // 用户信息（用户名、密码、昵称等）
  private userInfo: UserInfoState = initUserInfo;
  // 国际化文字
  private transateContent: Object;

  /**
   * 构造函数
   */
  constructor(private navCtrl: NavController,
    private navParams: NavParams,
    private userService: UserService,
    @Inject(APP_CONSTANT) private appConstant: AppConstant,
    private cryptoService: CryptoService,
    private translate: TranslateService,
    private http: Http,
    private toastService: ToastService) {
    let translateKeys: string[] = ['CONFIRM', 'INPUT_OLD_PASSWORD', 'OLD_ERROR', 'INPUT_NEW_PASSWORD', 'INPUT_NEW_PASSWORD_AGAIN', 'DIFFERENCE', 'PASSWORD_RULES', 'SUCCESS_MODIFY'];
    this.translate.get(translateKeys).subscribe((res: Object) => {
      this.transateContent = res;
    });
  }
  reset(originPassword: HTMLInputElement, newPassword0: HTMLInputElement, newPassword1: HTMLInputElement) {
    this.userInfo = this.userService.getUserInfo();
    let reg = /^[A-Za-z\d]{6,20}$/;
    if (originPassword.value === '') {
      this.toastService.show(this.transateContent['INPUT_OLD_PASSWORD']);
    } else if (originPassword.value !== this.userInfo.password0) {
      this.toastService.show(this.transateContent['OLD_ERROR']);
    } else if (newPassword0.value === '') {
      this.toastService.show(this.transateContent['INPUT_NEW_PASSWORD']);
    } else if (newPassword1.value === '') {
      this.toastService.show(this.transateContent['INPUT_NEW_PASSWORD_AGAIN']);
    } else if (newPassword0.value !== newPassword1.value) {
      this.toastService.show(this.transateContent['DIFFERENCE']);
    } else if (!reg.test(newPassword1.value)) {
      this.toastService.show(this.transateContent['PASSWORD_RULES']);
    } else {
      this.modifyPassword(originPassword.value, newPassword1.value);
    }
  }
  // 修改密码
  modifyPassword(originPassword: string, newPassword: string): void {
    // 加密密码
    let md5password0: string = originPassword;
    let md5password1: string = newPassword;
    if (this.appConstant.oaConstant.md5Encryption) {
      md5password0 = this.cryptoService.hashMD5(md5password0, true);
      md5password1 = this.cryptoService.hashMD5(md5password1, true);
    }
    // 请求参数
    let params: Object = {
      'originPassword': md5password0,
      'newPassword': md5password1
    };
    this.http.put('/user/password', params).subscribe((res: Response) => {
      this.userInfo = {
        ...this.userInfo,
        password: md5password1,
        password0: newPassword,
        savePassword: false
      };
      this.userService.saveUserInfo(this.userInfo);
      this.toastService.show(this.transateContent['SUCCESS_MODIFY']);
      this.navCtrl.pop();
    }, (res: Response) => {
      this.toastService.show(res.text());
    });
  }
}
