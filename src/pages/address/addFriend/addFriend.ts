import { Component, NgZone } from '@angular/core';
import { Http, Response } from '@angular/http';
import { ToastService } from '../../../app/services/toast.service';
import { TranslateService } from '@ngx-translate/core';
import { DeviceService } from '../../../app/services/device.service';
import { UserProfilePage } from '../userProfile/userProfile';
import { NavController } from 'ionic-angular';
import { FormControl } from '@angular/forms';
import { ConfigsService } from '../../../app/services/configs.service';

@Component({
  selector: 'page-addFriend',
  templateUrl: 'addFriend.html',
})
export class AddFriendPage {
  // 用户列表
  private userList: Array<Object> = [];
  // 所有用户列表
  private allUserList: Array<Object> = [];
  // 国际化文字
  private transateContent: Object;
  // 查询拦截器
  private titleFilter: FormControl = new FormControl();
  // 是否显示placeholder
  private isShow: boolean = false;
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
  constructor(private toastService: ToastService,
    private navCtrl: NavController,
    private configsService: ConfigsService,
    private translate: TranslateService,
    private deviceService: DeviceService,
    private zone: NgZone,
    private http: Http) {
    this.translate.get(['REQUEST_SENT', 'NO_DATA']).subscribe((res: Object) => {
      this.transateContent = res;
    });
    this.titleFilter.valueChanges.debounceTime(500).subscribe(
      (value) => {
        this.keyword = value;
        if (this.titleFilter.value != null && this.titleFilter.value.trim() !== '') {
          this.searchUser();
        } else {
          this.userList = this.allUserList;
          this.isShow = false;
        }
      }
    );
    this.http.get('/im/contacts/users').subscribe((res: Response) => {
      this.userList = res.json();
      this.allUserList = res.json();
      for (let user of this.userList) {
        if (user['avatar']) {
          user['avatar'] = `${this.fileUrl}${user['avatar']}${this.token}`;
        }
      }
      for (let item of this.allUserList) {
        if (item['avatar']) {
          item['avatar'] = `${this.fileUrl}${item['avatar']}${this.token}`;
        }
      }
    }, (res: Response) => {});
  }

  /**
   * 搜索用户
   */
  searchUser() {
    this.http.get('/im/contacts/users', { params: { 'searchText': this.titleFilter.value } }).subscribe((res: Response) => {
      this.userList = res.json();
      for (let user of this.userList) {
        if (user['avatar']) {
          user['avatar'] = `${this.fileUrl}${user['avatar']}${this.token}`;
        }
      }
      this.isShow = true;
    }, (res: Response) => {
      this.toastService.show(res.text());
    });
  }

  /**
   * 上拉加载
   */
  doInfinite(infiniteScroll) {
    setTimeout(() => {
      if (this.userList.length < this.showNumber) {
        this.toastService.show(this.transateContent['NO_DATA']);
      } else {
        this.showNumber += 15;
      }
      infiniteScroll.complete();
    }, 800);
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
  resetImg(user) {
    for (let item of this.userList) {
      if (item['id'] === user['id']) {
        item['avatar'] = '';
        break;
      }
    }
  }
}
