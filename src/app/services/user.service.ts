import { Injectable } from '@angular/core';
import { SecureStorageService } from './secureStorage.service';

export interface UserInfoState {
  account: string;
  loginName: string;
  password: string;
  userName: string;
  password0: string;
  userId: string;
  headImage: string;
  jobNumber: string;
  phone: string;
  email: string;
  outter: string;
  sexCode: string;
  sex?: string;
  savePassword: boolean;
  status: string;
}

export let initUserInfo: UserInfoState = {
  account: '',
  loginName: '',
  password: '',
  userName: '',
  password0: '',
  userId: '',
  headImage: '',
  jobNumber: '',
  phone: '',
  email: '',
  outter: '',
  sexCode: '',
  sex: '',
  savePassword: true,
  status: ''
};

/**
 * 用户服务
 */
@Injectable()
export class UserService {

  // 设备信息存储键
  static SEC_KEY_USER_INFO = 'userInfo';

  /**
   * 构造函数
   */
  constructor(private secureStorageService: SecureStorageService) { }

  /**
   * 判断是否登录
   */
  isLogin(): boolean {
    if (localStorage.getItem('autoLogin') === '1') {
      return true;
    } else {
      return false;
    }
  }

  /**
   * 登录
   */
  login(): void {
    localStorage.setItem('autoLogin', '1');
  }

  /**
   * 退出登录
   */
  logout(): void {
    localStorage.setItem('autoLogin', '0');
  }

  /**
   * 保存用户信息
   */
  saveUserInfo(userInfo: UserInfoState): void {
    this.secureStorageService.putObject(UserService.SEC_KEY_USER_INFO, userInfo);
  }

  /**
   * 取得用户信息
   */
  getUserInfo(): UserInfoState {
    return this.secureStorageService.getObject(UserService.SEC_KEY_USER_INFO);
  }

  /**
   * 取得用户信息
   */
  imIsOpen(): boolean {
    if (localStorage.getItem('imIsOpen') === '1') {
      return true;
    } else {
      return false;
    }
  }
}
