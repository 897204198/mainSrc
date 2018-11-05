import { Component, NgZone } from '@angular/core';
import { NavController } from 'ionic-angular';
import { Http, Response } from '@angular/http';
import { FormControl } from '@angular/forms';
import { CreateGroupPage } from './createGroup';
import { ToastService } from '../../../app/services/toast.service';
import { UserService, initUserInfo, UserInfoState } from '../../../app/services/user.service';
import { DeviceService } from '../../../app/services/device.service';
import { SearchFilterPipe } from '../../../app/pipes/searchFilter/searchFilter';

@Component({
  selector: 'page-group',
  templateUrl: 'group.html',
})
export class GroupPage {

  // 全部群信息
  private allGroups: Array<Object> = [];
  // 查询拦截器
  private titleFilter: FormControl = new FormControl();
  // 查询keyword
  private keyword: string;
  // 用户信息数据
  userInfo: UserInfoState = initUserInfo;
  // 搜索匹配的条数
  private count: number = 0;
  // 是否显示placeholder
  private isShow: boolean = false;
  private fromChatAatar: string = '';

  /**
   * 构造函数
   */
  constructor(private navCtrl: NavController,
    private toastService: ToastService,
    private userService: UserService,
    private deviceService: DeviceService,
    private zone: NgZone,
    private SearchFilter: SearchFilterPipe,
    private http: Http) {
    this.titleFilter.valueChanges.debounceTime(500).subscribe((value) => {
      this.isShow = true;
      this.count = 0;
      this.keyword = value;
      if (this.titleFilter.value) {
        this.count = this.SearchFilter.transform(this.allGroups, 'groupName', value).length;
      } else {
        this.isShow = false;
      }
    });
  }

  /**
   * 首次进入页面
   */
  ionViewDidLoad() {
    // 设置个人信息
    this.userInfo = this.userService.getUserInfo();
    this.getCurrentUserInfoFromNet();
  }

  /**
   * 取得当前用户信息
   */
  getCurrentUserInfoFromNet(): void {
    let params = {
      userId: this.userInfo.userId
    };
    this.http.get('/user/info', { params: params }).subscribe((res) => {
      let data = res.json();
      if (data.avatar) {
        this.fromChatAatar = data['avatar'];
      }
    }, (res: Response) => {
    });
  }


  /**
   * 每次进入页面
   */
  ionViewDidEnter(): void {
    this.fetchGroupInfos();
  }

  /**
   * 获取用户所有群组
   */
  fetchGroupInfos(): void {
    this.http.get('/im/groups').subscribe((res: Response) => {
      this.allGroups = res.json();
    }, (res: Response) => {
      this.toastService.show(res.text());
    });
  }

  /**
   * 创建群组
   */
  createGroup() {
    this.navCtrl.push(CreateGroupPage);
  }

  /**
   * 群聊
   */
  chatToGroup(item: Object) {
    let params: Object = {};
    params['from_user_id'] = this.userInfo.loginName;
    params['from_username'] = this.userInfo.userName;
    params['from_headportrait'] = this.fromChatAatar;
    // params['from_headportrait'] = this.userInfo.headImage;
    params['to_user_id'] = item['groupId'];
    params['to_username'] = item['groupName'];
    params['to_headportrait'] = item['headImage'];
    params['chatType'] = 'groupChat';
    params['chatId'] = item['id'];
    (<any>window).huanxin.chat(params);
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
      let nickName: string = item['groupName'];
      params['nickName'] = nickName.substring(0, 1);
      (<any>window).huanxin.getWordHeadImage(params, (retData) => {
        this.zone.run(() => {
          item['headImage'] = retData;
        });
      });
    } else {
      item['headImage'] = './assets/images/im/group.png';
    }
  }
}
