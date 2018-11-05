import { Component } from '@angular/core';

/**
 * 通用设置
 */
@Component({
  selector: 'page-general',
  templateUrl: 'general.html',
})
export class GeneralPage {

  /**
   * 构造函数
   */
  constructor() { }

  /**
   * 首次进入页面
   */
  ionViewDidLoad(): void { }

  /**
   * 打开、关闭 扬声器模式
   */
  loudspeaker(speaker: HTMLInputElement): void { }

}
