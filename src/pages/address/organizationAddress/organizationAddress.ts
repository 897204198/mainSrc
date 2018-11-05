import { Component, NgZone } from '@angular/core';
import { ToastService } from '../../../app/services/toast.service';
import { Http, Response } from '@angular/http';
import { UserInfoState, UserService, initUserInfo } from '../../../app/services/user.service';
import { DeviceService } from '../../../app/services/device.service';
import { NavParams } from 'ionic-angular/navigation/nav-params';
import { TranslateService } from '@ngx-translate/core';
import { NavController } from 'ionic-angular';
import { FormControl } from '@angular/forms';
import { UserProfilePage } from '../userProfile/userProfile';
import { ConfigsService } from '../../../app/services/configs.service';


/**
 * 个人资料
 */
@Component({
  selector: 'page-organizationAddress',
  templateUrl: 'organizationAddress.html'
})
export class OrganizationAddressPage {
  // 国际化文字
  private transateContent: Object;
  // 查询拦截器
  private titleFilter: FormControl = new FormControl();
  // 用户信息（用户名、密码、昵称等）
  private userInfo: UserInfoState = initUserInfo;
  // 用户信息（用户名、密码、昵称等）
  private isSearch: boolean = false;
  // 面包屑是否是最后一层
  private isLast: boolean = false;

  // 搜索组织ID，默认为 root
  private organizationId: string = 'root';
  // 搜索用户列表
  private searchUserList: Array<Object> = [];
  // 部门列表
  private organizationList: Array<Object> = [];
  // 子部门列表
  private subOrganizationList: Array<Object> = [];
  // 部门用户列表
  private userList: Array<Object> = [];

  // 显示数量
  private showNumber: number = 15;
  // 查询keyword
  private keyword: string;
  // 文件上传/下载地址
  private fileUrl: string = this.configsService.getBaseUrl() + '/file/';
  // token
  private token: string = '?access_token=' + localStorage['token'];

  /**
   * 构造函数
   */
  constructor(private http: Http,
    private zone: NgZone,
    private configsService: ConfigsService,
    private navParams: NavParams,
    private toastService: ToastService,
    private translate: TranslateService,
    private userService: UserService,
    private navCtrl: NavController,
    private deviceService: DeviceService) {
    this.translate.get(['REQUEST_SENT', 'NO_DATA']).subscribe((res: Object) => {
      this.transateContent = res;
    });
    this.titleFilter.valueChanges.debounceTime(500).subscribe(
      (value) => {
        this.keyword = value;
        if (this.titleFilter.value != null && this.titleFilter.value.trim() !== '') {
          this.searchUser();
        } else {
          this.searchUserList = [];
          this.isSearch = false;
        }
      }
    );
    this.userInfo = this.userService.getUserInfo();
  }

  /**
   * 每次进入页面
   */
  ionViewDidEnter(): void {
    this.getOrganization();
  }

  /**
   * 搜索用户
   */
  searchUser() {
    this.http.get('/im/contacts/users', { params: { 'searchText': this.titleFilter.value } })
      .subscribe((res: Response) => {
        this.searchUserList = res.json();
        for (let user of this.searchUserList) {
          if (user['avatar']) {
            user['avatar'] = `${this.fileUrl}${user['avatar']}${this.token}`;
          }
        }
        this.isSearch = true;
      }, (res: Response) => {
        this.toastService.show(res.text());
      });
  }

  /**
   * 上拉加载
   */
  doInfinite(infiniteScroll) {
    setTimeout(() => {
      if (this.searchUserList.length < this.showNumber) {
        this.toastService.show(this.transateContent['NO_DATA']);
      } else {
        this.showNumber += 15;
      }
      infiniteScroll.complete();
    }, 800);
  }

  /**
   * 改变组织
   */
  changeOrganization(item: Object, i: number) {
    this.organizationId = item['organizationId'];
    this.getOrganization();
    const spliceLength: number = this.organizationList.length - i - 1;
    this.organizationList.splice(i + 1, spliceLength);
    this.isLast = false;
  }

  /**
   * 改变下级组织
   */
  changeSubOrganization(item: Object) {
    this.organizationId = item['organizationId'];
    if (item['leafCount'] !== 0 && item['leafCount'] !== '0') {
      if (this.isLast === true) {
        this.organizationList.pop();
      }
      this.isLast = false;
      this.organizationList.push(item);
    } else {
      if (this.isLast === true) {
        this.organizationList.pop();
      } else {
        this.isLast = true;
      }
      this.organizationList.push(item);
    }
    this.getOrganization();
  }

  /**
   * 获取组织
   */
  getOrganization() {
    this.http.get('/im/contacts/organization', { params: { 'organizationId': this.organizationId } })
      .subscribe((res: Response) => {
        this.userList = res.json()['contacts'];
        if (res.json()['leafCount'] !== 0 && res.json()['leafCount'] !== '0') {
          this.subOrganizationList = res.json()['orgs'];
        }
        if (this.organizationId === 'root') {
          let item: Object = {
            organizationId: res.json()['organizationId'],
            organizationName: res.json()['organizationName']
          };
          this.organizationList = [item];
        }
        for (let user of this.userList) {
          if (user['avatar']) {
            user['avatar'] = `${this.fileUrl}${user['avatar']}${this.token}`;
          }
        }
      }, (res: Response) => {
        this.toastService.show(res.text());
      });
  }

  /**
   * 进入个人信息详情
   */
  lookUserProfile(item: Object) {
    let isFriend: boolean = false;
    if (item['status'] && (item['status']['code'] === '0' || item['status']['code'] === 0)) {
      isFriend = true;
    }
    let params: object = {
      toUserId: item['id'],
      remark: item['name'],
      isFriend: isFriend
    };
    this.navCtrl.push(UserProfilePage, params);
  }

  /**
   * 添加好友
   */
  addFriend(event: any, user: Object) {
    event.stopPropagation();
    let params = {
      'toUserId': user['id'],
      'type': '0'
    };
    this.http.post('/im/contacts/application', params).subscribe((res: Response) => {
      this.toastService.show(this.transateContent['REQUEST_SENT']);
    }, (res: Response) => {
      this.toastService.show(res.text());
    });
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
      let nickName: string = item['name'];
      params['nickName'] = nickName.substring(0, 1);
      (<any>window).huanxin.getWordHeadImage(params, (retData) => {
        this.zone.run(() => {
          item['headImageContent'] = retData;
        });
      });
    } else {
      item['headImageContent'] = './assets/images/user.jpg';
    }
  }

  /**
   * 图片加载出错或无图片显示文字
   */
  resetImg(item: object, flag: boolean) {
    if (flag) {
      for (let user of this.userList) {
        if (item['id'] === user['id']) {
          user['avatar'] = '';
          break;
        }
      }
    } else {
      for (let user of this.searchUserList) {
        if (item['id'] === user['id']) {
          user['avatar'] = '';
          break;
        }
      }
    }
  }
}
