import { Injectable } from '@angular/core';
import { NavController, ViewController } from 'ionic-angular';

/**
 * 工具服务
 */
@Injectable()
export class UtilsService {

  /**
   * 构造函数
   */
  constructor() {}

  /**
   * 取得返回页面index
   */
  getPopToViewIndex(navCtrl: NavController, page: any): number {
    let index: number = -1;
    let views: ViewController[] = navCtrl.getViews();
    for (let i = views.length - 1 ; i >= 0 ; i--) {
      if (views[i].instance instanceof page) {
        index = i;
        break;
      }
    }
    return index;
  }

  /**
   * 日期补零
   */
  private paddNum(num: any): string {
    num += '';
    return num.replace(/^(\d)$/, '0$1');
  }

  /**
   * 日期格式化
   */
  formatDate(date: Date, format: string): string {
    let cfg = {
      YYYY : date.getFullYear(),
      YY : date.getFullYear().toString().substring(2),
      M  : date.getMonth() + 1,
      MM : this.paddNum(date.getMonth() + 1),
      D  : date.getDate(),
      DD : this.paddNum(date.getDate()),
      HH : date.getHours(),
      mm : date.getMinutes(),
      ss : date.getSeconds()
    };
    return format.replace(/([a-z])(\1)*/ig, function(m){return cfg[m]; });
  }

  /**
   * 年相差年数
   */
  getDifferYears(startDate: Date, endDate: Date): string {
    let years: number = endDate.getFullYear() - startDate.getFullYear();
    return years.toString();
  }

  /**
   * 日期相差年数
   */
  getDifferDates(startDate: Date, endDate: Date): string {
    let years: string = '';
    if (startDate != null && endDate != null) {
      let math: number = endDate.getFullYear() - startDate.getFullYear();
      if (endDate.getMonth() - startDate.getMonth() > 0) {
        math = math + 1;
      }
      if (endDate.getMonth() === startDate.getMonth() && endDate.getDate() - startDate.getDate() > 0) {
        math = math + 1;
      }
      years = math.toString();
    }
    return years;
  }

  /**
   * 数组是否相等
   */
  arraysEqual(a: Array<any>, b: Array<any>): boolean {
    if (a === b) {
      return true;
    } else if (a == null || b == null) {
      return false;
    } else if (a.length !== b.length) {
      return false;
    } else {
      for (let i = 0; i < a.length; ++i) {
        if (a[i].toString() !== b[i].toString()) {
          return false;
        }
      }
      return true;
    }
  }

  /**
   * 是否是正确的 Mac 地址
   */
  isMacAddress(value: string): boolean {
    let reg = /^[A-Fa-f\d]{2}:[A-Fa-f\d]{2}:[A-Fa-f\d]{2}:[A-Fa-f\d]{2}:[A-Fa-f\d]{2}:[A-Fa-f\d]{2}$/;
    if (reg.test(value)) {
      return true;
    } else {
      return false;
    }
  }
}
