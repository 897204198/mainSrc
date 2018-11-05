import { Component, NgZone } from '@angular/core';
import { UserService, initUserInfo, UserInfoState } from '../../app/services/user.service';
import { Store } from '@ngrx/store';
import { Http, Response } from '@angular/http';
import { ImReplaceBadageAction } from '../../app/redux/actions/im.action';
import { FormControl } from '@angular/forms';
import { DeviceService } from '../../app/services/device.service';
import { Keyboard } from '@ionic-native/keyboard';
import { Events } from 'ionic-angular';
import { SearchFilterPipe } from '../../app/pipes/searchFilter/searchFilter';
import { ConfigsService } from '../../app/services/configs.service';

@Component({
  selector: 'page-chat-list',
  templateUrl: 'chatList.html',
})
export class ChatListPage {

  private chatList: Array<Object> = [];
  // 用户信息数据
  userInfo: UserInfoState = initUserInfo;
  // 查询拦截器
  private titleFilter: FormControl = new FormControl();
  // 查询keyword
  private keyword: string;
  // 搜索匹配的条数 
  private count: number = 0;
  // 是否显示placeholder 
  private isShow: boolean = false;
  // 文件上传/下载地址
  private fileUrl: string = this.configsService.getBaseUrl() + '/file/';
  // token
  private token: string = '?access_token=' + localStorage['token'];
  private fromChatAatar: string = '';

  /**
   * 构造函数
   */
  constructor(private zone: NgZone,
    private http: Http,
    private configsService: ConfigsService,
    private userService: UserService,
    private deviceService: DeviceService,
    private SearchFilter: SearchFilterPipe,
    private store: Store<string>,
    private keyboard: Keyboard,
    private event: Events) {
    this.titleFilter.valueChanges.debounceTime(500).subscribe((value) => {
      this.isShow = true;
      this.count = 0;
      this.keyword = value;
      if (this.titleFilter.value) {
        this.count = this.SearchFilter.transform(this.chatList, 'toChatNickName', value).length;
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
    (<any>window).huanxin.addMessageListener('', (addRetData) => {
      (<any>window).huanxin.getChatList('', (retData) => {
        this.zone.run(() => {
          this.chatList = retData;
          for (let user of this.chatList) {
            if (user['headImage']) {
              user['headImage'] = `${this.fileUrl}${user['headImage']}${this.token}`;
            }
          }
          this.checkRedMessage();
          this.changeUnreadMessageNumber();
        });
      });
    });
    if (this.keyboard != null) {
      this.keyboard.onKeyboardShow().subscribe(() => this.event.publish('hideTabs'));
      this.keyboard.onKeyboardHide().subscribe(() => this.event.publish('showTabs'));
    }
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
   * 检查是否有需要标红的消息
   */
  checkRedMessage() {
    let i: number = this.chatList.length;
    while (i) {
      i--;
      if (this.chatList[i]['isRedMessage'] && this.chatList[i]['isRedMessage'] === '1') {
        let lastMessage: string = this.chatList[i]['lastMessage'];
        let redMessage: string = lastMessage.substr(0, lastMessage.indexOf(']') + 1);
        this.chatList[i]['redMessage'] = redMessage;
        this.chatList[i]['lastMessage'] = lastMessage.substr(redMessage.length, lastMessage.length - redMessage.length);
      }
    }
  }

  /**
   * 改变 Tab 的未读数量
   */
  changeUnreadMessageNumber() {
    if (this.chatList.length === 0) {
      this.store.dispatch(new ImReplaceBadageAction(''));
    } else {
      let total: number = 0;
      let i: number = this.chatList.length;
      while (i) {
        i--;
        total += Number(this.chatList[i]['unreadMessagesCount']);
      }
      if (total === 0) {
        this.store.dispatch(new ImReplaceBadageAction(''));
      } else {
        this.store.dispatch(new ImReplaceBadageAction(total.toString()));
      }
    }
  }

  /**
   * 发起聊天插件
   */
  chatToUserOrGroup(item: Object) {
    item['from_user_id'] = this.userInfo.loginName;
    item['from_username'] = this.userInfo.userName;
    item['from_headportrait'] = this.fromChatAatar;
    // item['from_headportrait'] = this.userInfo.headImage;
    item['to_user_id'] = item['toChatUsername'];
    item['to_username'] = item['toChatNickName'];
    item['to_headportrait'] = item['headImage'];
    (<any>window).huanxin.chat(item);
  }

  /**
   * 侧滑删除
   */
  removeConversation(item: Object) {
    let index = this.chatList.indexOf(item);
    this.chatList.splice(index, 1);
    (<any>window).huanxin.removeConversation(item, () => {
      this.zone.run(() => {
        this.changeUnreadMessageNumber();
      });
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
      let nickName: string = item['toChatNickName'];
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
   * 图片加载出错或无图片显示文字
   */
  resetImg(item) {
    for (let user of this.chatList) {
      if (item['id'] === user['id']) {
        user['headImage'] = '';
        break;
      }
    }
  }
}

