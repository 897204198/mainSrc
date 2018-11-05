import { Component, Input } from '@angular/core';
import { NavController, ModalController } from 'ionic-angular';
import { HomeMenusManagerPage } from '../../homeMenusManager/homeMenusManager';
import { MenuFolderComponent } from '../../../../app/component/menuFolder/menuFolder.component';
import { RoutersService } from '../../../../app/services/routers.service';

@Component({
  selector: 'icmp-home-custom',
  templateUrl: 'homeCustom.component.html'
})
export class HomeCustomComponent {

  // 用户配置的全部应用
  @Input() menus: Object;
  // 应用所占的宽度
  private menuWidth: string;

  /**
   * 构造函数
   */
  constructor(public navCtrl: NavController,
              private modalCtrl: ModalController,
              private routersService: RoutersService) {
    if (screen.width <= 375) {
      this.menuWidth = 25 + '%';
    } else if (screen.width > 375 && screen.width <= 590) {
      this.menuWidth = 20 + '%';
    } else {
      this.menuWidth = 16.6 + '%';
    }
  }

  /**
   * 打开应用第一步
   * 1.如果是文件夹就先展开文件夹
   * 2.如果是应用就进行第二步
   */
  openApp(menu: any): void {
    if (menu['appType'] === 'folder') {
      let modal = this.modalCtrl.create(MenuFolderComponent, {name: menu});
      modal.onDidDismiss(data => {
        if (data) {
          this.routersService.pageForward(this.navCtrl, data);
        }
      });
      modal.present();
    } else {
      this.routersService.pageForward(this.navCtrl, menu);
    }
  }

  /**
   * 查看全部应用
   * 管理应用
   */
  goHomeMenusManager(): void {
    this.navCtrl.push(HomeMenusManagerPage);
  }
}
