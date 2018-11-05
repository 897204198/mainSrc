import { Injectable } from '@angular/core';

/**
 * 加密算法相关的服务
 */
@Injectable()
export class CryptoService {

  private static KEY = 'propersoft31353260';

  /**
   * 构造函数
   */
  constructor() { }

  /**
   * MD5加密字符串
   * @param input 输入字符串
   * @param upperCaseResult 返回值是否转为大写
   */
  public hashMD5(input: string, upperCaseResult: boolean = false): string {
    if (!input) {
      return null;
    }
    let rtn: string = '' + CryptoJS.MD5(input);
    if (upperCaseResult) {
      rtn = rtn.toUpperCase();
    }
    return rtn;
  }

  /**
   * 加密
   */
  public encrypt(input: string): string {
    if (!input) {
      return null;
    }
    return CryptoJS.AES.encrypt(input, CryptoService.KEY);
  }

  /**
   * 解密
   */
  public decrypt(input: string): string {
    if (!input) {
      return null;
    }
    let bytes = CryptoJS.AES.decrypt(input, CryptoService.KEY);
    let plaintext = bytes.toString(CryptoJS.enc.Utf8);
    return plaintext;
  }
}
