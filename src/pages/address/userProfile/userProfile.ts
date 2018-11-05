import { Component, NgZone } from '@angular/core';
import { ToastService } from '../../../app/services/toast.service';
import { Http, Response } from '@angular/http';
import { UserInfoState, UserService } from '../../../app/services/user.service';
import { DeviceService } from '../../../app/services/device.service';
import { NavParams } from 'ionic-angular/navigation/nav-params';
import { TranslateService } from '@ngx-translate/core';
import { Alert, AlertController, NavController } from 'ionic-angular';
import { ConfigsService } from '../../../app/services/configs.service';

/**
 * 个人资料
 */
@Component({
  selector: 'page-user-profile',
  templateUrl: 'userProfile.html'
})
export class UserProfilePage {

  // 对方用户信息
  private toUserInfo: Object = {};
  // 自己用户信息
  private fromUserInfo: UserInfoState;
  // 是否是好友
  isFriend: boolean = false;
  // 国际化文字
  private transateContent: Object;
  private translateDate: string[] = ['ARE_YOU_SURE_DELETE', 'DELETED', 'CANCEL', 'CONFIRM', 'FRENDLY_PROP', 'REQUEST_SENT'];
  // 弹出框相关
  private confirmAlert: Alert;
  private alertOpen: boolean = false;
  // 文件上传/下载地址
  private fileUrl: string = this.configsService.getBaseUrl() + '/file/';
  // token
  private token: string = '?access_token=' + localStorage['token'];
  private toChatAatar: string = '';
  private fromChatAatar: string = '';

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
    private alertCtrl: AlertController,
    private navCtrl: NavController,
    private deviceService: DeviceService) {
    this.translate.get(this.translateDate).subscribe((res: Object) => {
      this.transateContent = res;
    });
  }

  /**
   * 首次进入页面
   */
  ionViewDidLoad(): void {
    this.isFriend = this.navParams.get('isFriend') === true ? true : false;
    // 设置个人信息
    this.fromUserInfo = this.userService.getUserInfo();
    let searchUserId: string = this.navParams.get('fromUserId');
    let searchToUserId: string = this.navParams.get('toUserId');
    this.getUserInfoFromNet(searchUserId, searchToUserId);
    this.getCurrentUserInfoFromNet();
  }

  /**
   * 离开页面
   */
  ionViewWillLeave(): void {
    if (this.alertOpen) {
      this.confirmAlert.dismiss();
    }
  };

  /**
   * 取得当前用户信息
   */
  getCurrentUserInfoFromNet(): void {
    let params = {
      userId: this.fromUserInfo.userId
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
   * 取得用户信息
   */
  getUserInfoFromNet(userId: string, toUserId: string): void {
    this.http.get('/user/info?userId=' + toUserId).subscribe((res: Response) => {
      let data: Object = res.json();
      if (data['sex'] != null && data['sex'] !== '') {
        if (data['sex']['code'] === '0' || data['sex']['code'] === 0) {
          data['sexName'] = '男';
        } else {
          data['sexName'] = '女';
        }
      } else {
        data['sexName'] = '';
      }
      this.toUserInfo = data;
      if (data['avatar']) {
        this.toUserInfo['avatar'] = `${this.fileUrl}${data['avatar']}${this.token}`;
        this.toChatAatar = data['avatar'];
      }
    }, (err: Response) => {
      this.toastService.show(err.text());
    });
  }

  /**
   * 发起聊天插件
   */
  chatToUser() {
    let params: Object = {};
    params['from_user_id'] = this.fromUserInfo.loginName;
    params['from_username'] = this.fromUserInfo.userName;
    params['from_headportrait'] = this.fromChatAatar;
    // params['from_headportrait'] = this.fromUserInfo.headImage;
    params['to_user_id'] = this.toUserInfo['account'];
    params['to_username'] = this.toUserInfo['name'];
    params['to_headportrait'] = this.toChatAatar;
    // params['to_headportrait'] = this.toUserInfo['headImageContent'];
    params['chatType'] = 'singleChat';
    params['chatId'] = this.toUserInfo['id'];
    (<any>window).huanxin.chat(params);
  }

  /**
   * 后台没传头像 或 头像无法加载 时加载占位图头像
   * 如果是手机则获取原生缓存的图片
   * 如果是 web 版则显示默认占位图
   */
  setWordHeadImage() {
    // 避免在 web 上无法显示页面
    if (this.deviceService.getDeviceInfo().deviceType) {
      let params: Object = {};
      let nickName: string = this.navParams.get('remark');
      params['nickName'] = nickName.substring(0, 1);
      (<any>window).huanxin.getWordHeadImage(params, (retData) => {
        this.zone.run(() => {
          this.toUserInfo['headImageContent'] = retData;
        });
      });
    } else {
      this.toUserInfo['headImageContent'] = './assets/images/user.jpg';
    }
  }

  /**
   * 删除好友
   */
  deleteFriend(): void {
    this.presentConfirm(this.toUserInfo['id']);
  }

  // 确认删除弹窗
  presentConfirm(id: string): void {
    this.confirmAlert = this.alertCtrl.create({
      title: this.transateContent['FRENDLY_PROP'],
      message: this.transateContent['ARE_YOU_SURE_DELETE'],
      buttons: [
        {
          text: this.transateContent['CANCEL'],
          handler: () => {
            this.alertOpen = false;
          }
        },
        {
          text: this.transateContent['CONFIRM'],
          handler: () => {
            this.alertOpen = false;
            this.http.delete('/im/contacts/' + this.toUserInfo['id']).subscribe((res: Response) => {
              this.toastService.show(this.transateContent['DELETED']);
              this.navCtrl.pop();
            }, (err: Response) => {
              this.toastService.show(err.text());
            });
          }
        }
      ]
    });
    this.confirmAlert.present();
    this.alertOpen = true;
  }

  /**
   * 添加好友
   */
  addFriend() {
    let params = {
      'toUserId': this.toUserInfo['id'],
      'type': '0'
    };
    this.http.post('/im/contacts/application', params).subscribe((res: Response) => {
      this.toastService.show(this.transateContent['REQUEST_SENT']);
      this.navCtrl.pop();
    }, (res: Response) => {
      this.toastService.show(res.text());
    });
  }

  /**
   * 图片加载出错或无图片显示文字
   */
  resetImg() {
    this.toUserInfo['avatar'] = '';
  }
}
