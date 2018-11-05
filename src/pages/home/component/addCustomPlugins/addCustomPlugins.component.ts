import { Component, Input } from '@angular/core';
import { NavController } from 'ionic-angular';
import { HomePluginsManagerPage } from '../../homePluginsManager/homePluginsManager';

/**
 * 首页插件组件
 */
@Component({
  selector: 'icmp-add-custom-plugins',
  templateUrl: 'addCustomPlugins.component.html'
})
export class AddCustomPluginsComponent {

  // 用户配置显示的插件
  @Input() plugins: Object[] = [];

  /**
   * 构造函数
   */
  constructor(public navCtrl: NavController) {}

  /**
   * 跳转到插件管理页
   */
  goHomePluginsManager(): void {
    this.navCtrl.push(HomePluginsManagerPage);
  }
}
