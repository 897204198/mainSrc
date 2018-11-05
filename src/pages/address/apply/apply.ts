import { Component, NgZone } from '@angular/core';
import { Http, Response } from '@angular/http';
import { ToastService } from '../../../app/services/toast.service';
import { TranslateService } from '@ngx-translate/core';
import { DeviceService } from '../../../app/services/device.service';
import { UserProfilePage } from '../userProfile/userProfile';
import { NavController } from 'ionic-angular';
import { ConfigsService } from '../../../app/services/configs.service';

@Component({
  selector: 'page-apply',
  templateUrl: 'apply.html',
})
export class ApplyPage {

  // 申请列表
  private applyList: Array<Object> = [];
  // 国际化文字
  private transateContent: Object;
  // 文件上传/下载地址
  private fileUrl: string = this.configsService.getBaseUrl() + '/file/';
  // token
  private token: string = '?access_token=' + localStorage['token'];

  /**
   * 构造函数
   */
  constructor(private toastService: ToastService,
    private configsService: ConfigsService,
    private navCtrl: NavController,
    private deviceService: DeviceService,
    private zone: NgZone,
    private translate: TranslateService,
    private http: Http) {
    this.translate.get(['AGREED', 'REFUSED', 'DELETED']).subscribe((res: Object) => {
      this.transateContent = res;
    });
  }

  /**
   * 首次进入页面
   */
  ionViewDidLoad(): void {
    this.fetchApplications();
  }

  /**
   * 获取所有申请通知
   */
  fetchApplications(): void {
    this.http.get('/notices').subscribe((res: Response) => {
      this.applyList = res.json();
      for (let user of this.applyList) {
        if (user['avatar']) {
          user['avatar'] = `${this.fileUrl}${user['avatar']}${this.token}`;
        }
      }
      for (let i = 0; i < this.applyList.length; i++) {
        this.applyList[i]['isSubmit'] = false;
      }
    }, (res: Response) => {
      this.toastService.show(res.text());
    });
  }

  /**
   * 进入个人信息详情
   */
  lookUserProfile(item: Object) {
    let params = {
      fromUserId: item['fromUserId'],
      toUserId: item['toUserId'],
      remark: item['nickId'],
      isFriend: false
    };
    if (item['state'] != null && (item['state']['code'].toString() === '2')) {
      params['isFriend'] = true;
    }
    if (item['state'] != null &&
      item['state']['code'] === '1' ||
      item['state']['code'] === '2' ||
      item['state']['code'] === '3') {
      params['fromUserId'] = item['toUserId'];
      params['toUserId'] = item['fromUserId'];
    }
    this.navCtrl.push(UserProfilePage, params);
  }

  /**
   * 同意申请
   */
  agreeApply(event: any, item: Object) {
    event.stopPropagation();
    item['isSubmit'] = true;
    this.http.put('/im/contacts/application', { noticeId: item['id'], type: 'agree' }).subscribe(() => {
      this.toastService.show(this.transateContent['AGREED']);
      this.fetchApplications();
    }, (res: Response) => {
      item['isSubmit'] = false;
      this.toastService.show(res.text());
    });
  }

  /**
   * 拒绝申请
   */
  refuseApply(event: any, item: Object) {
    event.stopPropagation();
    item['isSubmit'] = true;
    this.http.put('/im/contacts/application', { noticeId: item['id'], type: 'reject' }).subscribe(() => {
      this.toastService.show(this.transateContent['REFUSED']);
      this.fetchApplications();
    }, (res: Response) => {
      item['isSubmit'] = false;
      this.toastService.show(res.text());
    });
  }

  /**
   * 删除申请
   */
  deleteApply(item: Object) {
    let index = this.applyList.indexOf(item);
    this.applyList.splice(index, 1);
    let params = {
      noticeId: item['id']
    };
    this.http.delete('/notices/' + item['id'], { params: params }).subscribe(() => {
      this.toastService.show(this.transateContent['DELETED']);
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
      let nickName: string = item['nickId'];
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
    for (let user of this.applyList) {
      if (item['id'] === user['id']) {
        user['avatar'] = '';
        break;
      }
    }
  }
}
