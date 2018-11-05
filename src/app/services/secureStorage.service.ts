import { Injectable } from '@angular/core';
import { CryptoService } from './crypto.service';

/**
 * 加密信息存储，用于存储帐号密码，服务端地址，个人信息等这些数据量不大，但比较敏感的信息
 */
@Injectable()
export class SecureStorageService {

  // 存储键前缀
  static Secure_PREFIX: string = '__proper_SecureStorage';

  /**
   * 构造函数
   */
  constructor(private cryptoService: CryptoService) {}

  /**
   * 获取存储数据键
   */
  private getRealStoreKey(key: string): string {
    return SecureStorageService.Secure_PREFIX + '_' + key;
  }

  /**
   * 保存的值
   */
  put(key: string, value: string): void {
    let realKey = this.getRealStoreKey(key);
    let encryptVal = this.cryptoService.encrypt(value);
    localStorage.setItem(realKey, encryptVal);
  }

  /**
   * 取值
   */
  get(key: string): string {
    let realKey = this.getRealStoreKey(key);
    let val: string = localStorage.getItem(realKey);
    return this.cryptoService.decrypt(val);
  }

  /**
   * 删除值
   */
  remove(key: string): void {
    localStorage.removeItem(this.getRealStoreKey(key));
  }

  /**
   * 获取对象
   */
  getObject(key: string): any {
    let val: string = this.get(key);
    if (val == null || val === '') {
      return null;
    } else {
      return JSON.parse(val);
    }
  }

  /**
   * 保存对象
   */
  putObject(key: string, value: any): void {
    if (value) {
      this.put(key, JSON.stringify(value));
    }
  }
}
