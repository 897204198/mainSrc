import { Component } from '@angular/core';
import { NavController, NavParams, ViewController } from 'ionic-angular';

/**
 * 首页应用文件夹组件
 */
@Component({
  selector: 'icmp-menu-folder',
  templateUrl: 'menuFolder.component.html'
})
export class MenuFolderComponent {

  // 该文件夹的所有信息，标题、数量都在这里取
  private folder: Object;
  // 该文件夹中的所有应用
  private folderMenus: Object[];
  // 翻页按钮，超过9个的时候出现
  private showPager: boolean = false;

  /**
   * 构造函数
   */
  constructor(public navCtrl: NavController,
              public navParams: NavParams,
              public viewCtrl: ViewController) {
    this.folder = this.navParams.get('name');
    this.getMyMenus();
  }

  /**
   * 获取文件夹中的应用
   */
  getMyMenus(): void {
    this.folderMenus = [];
    let myMenu = [];
    for (let i = 0; i < this.folder['apps'].length; i++) {
      let menu = this.folder['apps'][i];
      if (i !== 0 && i % 9 === 0) {
        this.folderMenus.push(myMenu);
        myMenu = [];
      } else {
        myMenu.push(menu);
      }
    }
    if (myMenu.length > 0) {
      this.folderMenus.push(myMenu);
    }
    if (this.folderMenus.length > 1) {
      this.showPager = true;
    }
  }

  /**
   * 打开文件夹内的应用
   */
  menusClk(menu: any): void {
    this.viewCtrl.dismiss(menu);
  }

  /**
   * 翻页事件
   */
  slidesClk(event: any): void {
    event.stopPropagation();
  }

  /**
   * 关闭文件夹窗口
   */
  dismiss() {
    this.viewCtrl.dismiss();
  }
}
