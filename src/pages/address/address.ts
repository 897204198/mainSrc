import { Component, NgZone, ElementRef, ViewChild } from '@angular/core';
import { NavController, Events } from 'ionic-angular';
import { Http, Response } from '@angular/http';
import { ConfigsService } from '../../app/services/configs.service';
import { AddFriendPage } from './addFriend/addFriend';
import { ApplyPage } from './apply/apply';
import { GroupPage } from './group/group';
import { FormControl } from '@angular/forms';
import { ToastService } from '../../app/services/toast.service';
import { DeviceService } from '../../app/services/device.service';
import { Keyboard } from '@ionic-native/keyboard';
import { UserProfilePage } from './userProfile/userProfile';
import { SpellService } from '../../app/services/spell.service';
import { Content } from 'ionic-angular';
import { UtilsService } from '../../app/services/utils.service';
import { OrganizationAddressPage } from './organizationAddress/organizationAddress';
import { SearchFilterPipe } from '../../app/pipes/searchFilter/searchFilter';

@Component({
  selector: 'page-address',
  templateUrl: 'address.html',
})
export class AddressPage {
  @ViewChild(Content) content: Content;
  // 缓存数组
  private cacaheArray: Array<any> = [];
  // 通讯录信息
  private contactInfos: Array<{ first: string, items: Array<Object> }> = [];
  // 右边26个字母滑动栏
  private slider: string[] = [];
  // 查询拦截器
  private titleFilter: FormControl = new FormControl();
  // 查询keyword
  private keyword: string;
  // 隐藏顶部
  private hidTopItem: boolean = false;
  // 隐藏字母排序
  private selectInput: boolean = true;
  // 未读通知
  private unreadData: string;
  // 搜索匹配的条数
  private count: number = 0;
  // 设置字母滑动栏样式
  private isDynamic: boolean = false;
  // 文件上传/下载地址
  private fileUrl: string = this.configsService.getBaseUrl() + '/file/';
  // token
  private token: string = '?access_token=' + localStorage['token'];

  /**
   * 构造函数
   */
  constructor(private navCtrl: NavController,
    private configsService: ConfigsService,
    private elementref: ElementRef,
    private toastService: ToastService,
    private deviceService: DeviceService,
    private spell: SpellService,
    private zone: NgZone,
    private utils: UtilsService,
    private http: Http,
    private SearchFilter: SearchFilterPipe,
    private keyboard: Keyboard,
    private event: Events) {
    this.titleFilter.valueChanges.debounceTime(500).subscribe(
      value => {
        this.count = 0;
        this.keyword = value;
        if (this.titleFilter.value === '' || this.titleFilter.value === null) {
          this.hidTopItem = false;
          this.selectInput = true;
        } else {
          this.hidTopItem = true;
          this.selectInput = false;
          for (let option of this.contactInfos) {
            let len = this.SearchFilter.transform(option['items'], 'remark', value).length;
            this.count += len;
          }
        }
      }
    );
  }

  /**
   * 首次进入页面
   */
  ionViewDidLoad() {
    if (this.keyboard != null) {
      this.keyboard.onKeyboardShow().subscribe(() => this.event.publish('hideTabs'));
      this.keyboard.onKeyboardHide().subscribe(() => this.event.publish('showTabs'));
    }
    this.fetchContactInfos();
  }

  /**
   * 每次进入页面
   */
  ionViewDidEnter(): void {
    this.getUnreadMessageCount();
    this.fetchContactInfos();
    this.content.scrollToTop();
  }

  /**
   * 获得未读申请与通知的条数
   */
  getUnreadMessageCount() {
    this.http.get('/notices/count').subscribe((res: Response) => {
      this.unreadData = res.json();
    }, (res: Response) => {
      this.toastService.show(res.text());
    });
  }

  /**
   * 获取用户通讯录
   */
  fetchContactInfos() {
    this.http.get('/im/contacts', { params: { 'type': '0' } }).subscribe((res: Response) => {
      let temporary: Array<Object> = [];
      temporary = res.json();
      if (this.utils.arraysEqual(this.cacaheArray, res.json())) {
        for (let i = 0; i < this.slider.length; i++) {
          this.elementref.nativeElement.querySelector('li#' + this.slider[i]).style.color = '#777';
        }
        this.elementref.nativeElement.querySelector('li#' + this.slider[0]).style.color = '#488aff';
        return;
      } else {
        this.cacaheArray = res.json();
      }

      this.slider = [];
      this.contactInfos = [];
      let compare = function (prop) {
        return function (obj1, obj2) {
          let val1 = obj1[prop];
          let val2 = obj2[prop];
          if (!isNaN(Number(val1)) && !isNaN(Number(val2))) {
            val1 = Number(val1);
            val2 = Number(val2);
          }
          if (val1 < val2) {
            return -1;
          } else if (val1 > val2) {
            return 1;
          } else {
            return 0;
          }
        };
      };
      for (let i = 0; i < temporary.length; i++) {
        temporary[i]['ordered'] = this.spell.GetSpell(temporary[i]['remark']);
        temporary[i]['initial'] = temporary[i]['ordered'][0][0];
      }
      temporary.sort(compare('ordered'));
      for (let i = 0; i < temporary.length; i++) {
        let item = temporary[i];
        let fist = item['initial'] as string;
        let current = this.contactInfos.filter((v, num, arr) => v.first === fist);
        if (current.length === 0) {
          current.push({ first: fist, items: [] });
          this.contactInfos.push(current[0]);
        }
        current[0].items.push(item);
      }
      for (let contact of this.contactInfos) {
        for (let item of contact['items']) {
          if (item['avatar']) {
            item['avatar'] = `${this.fileUrl}${item['avatar']}${this.token}`;
          }
        }
      }
      for (let i = 0; i < this.contactInfos.length; i++) {
        this.slider.push(this.contactInfos[i]['first']);
      }
    }, (res: Response) => {
      this.toastService.show(res.text());
    });
  }

  /**
   * content滚动
   */
  ionScroll() {
    let scrollTop = this.content.scrollTop;
    for (let i = 0; i < this.slider.length; i++) {
      this.elementref.nativeElement.querySelector('li#' + this.slider[i]).style.color = '#777';
    }
    for (let value of this.slider) {
      let top = this.elementref.nativeElement.querySelector('ion-item#' + value).offsetTop;
      let eleHeight = this.elementref.nativeElement.querySelector('div.' + value).offsetHeight;
      let tops = top + eleHeight + 15;
      if (tops > scrollTop) {
        this.elementref.nativeElement.querySelector('li#' + value).style.color = '#488aff';
        break;
      }
    }
  }

  /**
   * 滚动指定位置
   * @param letter 
   */
  scrollTo(letter) {
    this.isDynamic = true;
    let temporary = false;
    for (let i = 0; i < this.contactInfos.length; i++) {
      if (this.contactInfos[i].first === letter) {
        temporary = true;
      }
    }
    if (temporary) {
      let scrollTop = this.elementref.nativeElement.querySelector('ion-item#' + letter).offsetTop;
      this.content.scrollTo(10, scrollTop, 300);
      for (let i = 0; i < this.slider.length; i++) {
        this.elementref.nativeElement.querySelector('li#' + this.slider[i]).style.color = '#777';
      }
      this.elementref.nativeElement.querySelector('li#' + letter).style.color = '#488aff';
    }

  }

  /**
   * 申请和通知
   */
  applyAndNotification() {
    this.navCtrl.push(ApplyPage);
  }

  /**
   * 添加好友
   */
  addFriend() {
    this.navCtrl.push(AddFriendPage);
  }

  /**
   * 我的群组
   */
  myGroup() {
    this.navCtrl.push(GroupPage);
  }

  /**
   * 组织通讯录
   */
  organizationAddress() {
    this.navCtrl.push(OrganizationAddressPage);
  }

  /**
   * 进入个人信息详情
   */
  lookUserProfile(item: Object) {
    if (item['type'] && (item['type']['code'] === '0' || item['type']['code'] === 0)) {
      item['isFriend'] = true;
    }
    this.navCtrl.push(UserProfilePage, item);
  }

  /**
   * 后台没传头像 或 头像无法加载 时加载占位图头像
   * 如果是手机则获取原生缓存的图片
   * 如果是 web 版则显示默认占位图
   */
  setWordHeadImage(item: Object) {
    // 避免在 web 上无法显示页面
    if (this.deviceService.getDeviceInfo().deviceType) {
      let params: Object = {};
      let nickName: string = item['remark'];
      params['nickName'] = nickName.substring(0, 1);
      (<any>window).huanxin.getWordHeadImage(params, (retData) => {
        this.zone.run(() => {
          item['headImage'] = retData;
        });
      });
    } else {
      item['headImage'] = './assets/images/user.jpg';
    }
  }

  /**
   * 切换字母滑动栏样式
   */
  toggle() {
    this.isDynamic = false;
  }

  /**
   * 图片加载出错或无图片显示文字
   */
  resetImg(user) {
    for (let contact of this.contactInfos) {
      for (let item of contact['items']) {
        if (item['fromUserId'] === user['fromUserId']) {
          item['avatar'] = '';
          break;
        }
      }
    }
  }
}

