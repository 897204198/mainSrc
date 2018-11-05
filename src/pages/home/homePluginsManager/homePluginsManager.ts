import { Component } from '@angular/core';
import { Http, Response } from '@angular/http';
import { FormControl } from '@angular/forms';
import { DragulaService } from 'ng2-dragula';
import { ToastService } from '../../../app/services/toast.service';

/**
 * 首页插件管理页面
 */
@Component({
  selector: 'page-home-plugins-manager',
  templateUrl: 'homePluginsManager.html'
})
export class HomePluginsManagerPage {

  // 全部插件
  private allPlugins: Object[] = [];
  // 我的插件
  private myPlugins: Object[] = [];
  // 是否进入管理模式
  private isManage: boolean = false;
  // 查询拦截器
  private titleFilter: FormControl = new FormControl();
  // 查询keyword
  private keyword: string;
  // 应用所占的宽度
  private menuWidth: string;

  /**
   * 构造函数
   */
  constructor(private dragulaService: DragulaService,
              public http: Http,
              private toastService: ToastService) {

    // 设置功能区列数
    if (screen.width <= 375) {
      this.menuWidth = 25 + '%';
    } else if (screen.width > 375 && screen.width <= 590) {
      this.menuWidth = 20 + '%';
    } else {
      this.menuWidth = 16.6 + '%';
    }

    this.titleFilter.valueChanges.debounceTime(500).subscribe(
      value => this.keyword = value
    );
  }

  /**
   * 进入页面
   */
  ionViewDidLoad(): void {
    this.getMyPlugins();
    this.getAllPlugins();
    this.dragulaService.drop.subscribe(() => {
      this.savePlugin();
    });
  }

  /**
   * 取得全部插件
   */
  getAllPlugins(): void {
    this.allPlugins = [];
    this.http.get('/sys/plugins').subscribe((res: any) => {
      if (res._body != null && res._body !== '') {
        this.allPlugins = res.json();
      }
    }, (res: Response) => {
      this.toastService.show(res.text());
    });
  };

  /**
   * 取得自己的插件
   */
  getMyPlugins(): void {
    this.myPlugins = [];
    this.http.get('/sys/plugins/user').subscribe((res: any) => {
      if (res._body != null && res._body !== '') {
        this.myPlugins = res.json();
      }
    }, (res: Response) => {
      this.toastService.show(res.text());
    });
  };

  // 取得发送长按事件的图标
  getPressIcon(target: any): any {
    if (target.className.indexOf('setting-menu') >= 0) {
      return target;
    } else {
      return target.offsetParent;
    }
  }

  /**
   * 长按启动管理按钮
   */
  pressEvent(event: any): void {
    if (!this.isManage) {
      this.isManage = true;
    }

    let target = this.getPressIcon(event.target);
    if (target != null) {
      target.className = target.className + ' pressActive';
    }
  }

  // 结束长按事件取消样式
  touchendEvent(event: any): void {
    let target = this.getPressIcon(event.target);
    if (target != null) {
      target.className = 'setting-menu';
    }
  }

  /**
   * 点击管理应用
   */
  manageMenus(): void {
    this.isManage = !this.isManage;
  }

  /**
   * 判断全部插件中是否选中
   */
  isPluginSelected(plugin: Object): boolean {
    let isSelected = false;
    for (let i = 0; i < this.myPlugins.length; i++) {
      if (this.myPlugins[i]['id'] === plugin['id']) {
        isSelected = true;
        break;
      }
    }
    return isSelected;
  }

  /**
   * 编辑时在全部插件中点击删除
   */
  menuRemove(plugin: Object): void {
    for (let i = 0; i < this.myPlugins.length; i++) {
      if (this.myPlugins[i]['id'] === plugin['id']) {
        this.myPlugins.splice(i, 1);
        this.savePlugin();
        break;
      }
    }
  }

  /**
   * 编辑时在全部插件中点击添加
   */
  menuAdd(plugin: Object): void {
    this.myPlugins.push(plugin);
    this.savePlugin();
  }

  /**
   * 添加时保存插件
   */
  savePlugin(): void {
    let ids = [];
    for (let i = 0; i < this.myPlugins.length; i++) {
      ids.push(this.myPlugins[i]['id']);
    }
    localStorage.mainPlugins = ids.join(',');

    let params: Object = {
      'ids': ids.join(',')
    };
    this.http.post('/sys/plugins/user', params).subscribe(() => {
    }, (res: Response) => {
      this.toastService.show(res.text());
    });
  }

  // 非管理模式阻止拖拽
  dragulaMove(event: any): void {
    if (!this.isManage) {
      event.stopPropagation();
    }
  }

  // 禁止长按出现菜单事件
  contextmenuEvent(event: any): void {
    event.preventDefault();
  }

  // 管理模式禁止touchstart
  touchstartEvent(event: any): void {
    event.preventDefault();
  }
}
