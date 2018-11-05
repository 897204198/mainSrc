import { Component, ViewChild, NgZone, ElementRef, Renderer, Inject } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Platform, Tabs, AlertController, NavController, Events, NavParams } from 'ionic-angular';
import { HomePage } from '../home/home';
import { SettingPage } from '../setting/setting';
import { BackButtonService } from '../../app/services/backButton.service';
import { AppVersionUpdateService } from '../../app/services/appVersionUpdate.service';
import { TodoDetailPage } from '../todo/todoDetail/todoDetail';
import { UserService, UserInfoState } from '../../app/services/user.service';
import { ToastService } from '../../app/services/toast.service';
import { TranslateService } from '@ngx-translate/core';
import { QueryDetailPage } from '../query/queryDetail/queryDetail';
import { QueryNoticeDetailPage } from '../query/queryNoticeDetail/queryNoticeDetail';
import { AddressPage } from '../address/address';
import { ChatListPage } from '../chatList/chatList';

import { Store } from '@ngrx/store';
import { IM_BADGE_STATE } from '../../app/redux/app.reducer';
import { ImReplaceBadageAction } from '../../app/redux/actions/im.action';
import { ConfigsService } from '../../app/services/configs.service';
import { AppConstant, APP_CONSTANT } from '../../app/constants/app.constant';
import { DeviceService } from '../../app/services/device.service';
import { LoginPage } from '../login/login';
import { PushService } from '../../app/services/push.service';
import { FeedbackPage } from '../setting/feedback/feedback';
import { ExamCustomFramePage } from '../exam/customFrame/customFrame';
import { InAppBrowser } from '@ionic-native/in-app-browser';

@Component({
  templateUrl: 'tabs.html'
})
export class TabsPage {

  // Tab对象
  @ViewChild('myTabs') tabRef: Tabs;
  // Tab的所有页面
  tabRoots: Object[];
  // 国际化文字
  private transateContent: Object;
  // margin-bottom
  mb: any;
  // 用户信息
  userInfo: UserInfoState = this.userService.getUserInfo();
  // 是否是首次加载，用于解决杀进程状态点击推送跳转时还未登录问题
  private isFirst: boolean = true;

  /**
   * 构造函数
   */
  constructor(public navCtrl: NavController,
    public platform: Platform,
    private navParams: NavParams,
    private http: Http,
    private zone: NgZone,
    private toastService: ToastService,
    private pushService: PushService,
    private userService: UserService,
    private backButtonService: BackButtonService,
    private appVersionUpdateService: AppVersionUpdateService,
    public alertCtrl: AlertController,
    private translate: TranslateService,
    private store: Store<string>,
    private elementRef: ElementRef,
    private configsService: ConfigsService,
    @Inject(APP_CONSTANT) private appConstant: AppConstant,
    private deviceService: DeviceService,
    private events: Events,
    private iab: InAppBrowser,
    private renderer: Renderer) {
    let translateKeys: string[] = ['PROMPT_INFO', 'CANCEL', 'VIEW', 'PUSH_OPEN_PROMPT_ONE', 'PUSH_OPEN_PROMPT_TWO', 'IM_CLOSE', 'IM_OPEN'];
    this.translate.get(translateKeys).subscribe((res: Object) => {
      this.transateContent = res;
    });
    this.tabRoots = this.getTabInfo();
    platform.ready().then(() => {
      this.backButtonService.registerBackButtonAction(this.tabRef);
      // 通过推送通知打开应用事件
      document.addEventListener('Properpush.openNotification', this.doOpenNotification.bind(this), false);

      // 自动登录
      this.autoLogin();

      // 消息角标绑定
      this.store.select(IM_BADGE_STATE).subscribe((data: string) => {
        for (let i = 0; i < this.tabRoots.length; i++) {
          if (this.tabRoots[i]['tabTitle'] === '消息') {
            this.tabRoots[i]['tabBadge'] = data;
          }
        }
      });
    });

  }

  /**
   * 进入页面时监听键盘事件
   */
  ionViewDidLoad() {
    let tabs = this.queryElement(this.elementRef.nativeElement, '.tabbar');
    let tabsHeight = tabs.clientHeight + 'px';
    this.events.subscribe('hideTabs', () => {
      this.renderer.setElementStyle(tabs, 'display', 'none');
      let SelectTab = this.tabRef.getSelected()._elementRef.nativeElement;
      let content = this.queryElement(SelectTab, '.scroll-content');
      this.mb = tabsHeight;
      this.renderer.setElementStyle(content, 'margin-bottom', '0');
    });
    this.events.subscribe('showTabs', () => {
      this.renderer.setElementStyle(tabs, 'display', '');
      let SelectTab = this.tabRef.getSelected()._elementRef.nativeElement;
      let content = this.queryElement(SelectTab, '.scroll-content');
      this.renderer.setElementStyle(content, 'margin-bottom', this.mb);
    });
    if (localStorage.getItem('tabs') === '1') {
      this.appVersionUpdateService.checkAppVersion(true, true);
      localStorage.setItem('tabs', '0');
    }
  }

  /**
   * 取DOM元素
   */
  queryElement(elem: HTMLElement, q: string): HTMLElement {
    return <HTMLElement>elem.querySelector(q);
  }

  /**
   * 取得Tab配置信息
   */
  getTabInfo(): Object[] {
    if (this.userService.imIsOpen()) {
      return [
        { root: HomePage, tabTitle: '首页', tabIcon: 'home' },
        { root: ChatListPage, tabTitle: '消息', tabIcon: 'chatboxes' },
        { root: AddressPage, tabTitle: '通讯录', tabIcon: 'contacts' },
        { root: SettingPage, tabTitle: '更多', tabIcon: 'person' }
      ];
    } else {
      return [
        { root: HomePage, tabTitle: '首页', tabIcon: 'home' },
        { root: SettingPage, tabTitle: '更多', tabIcon: 'person' }
      ];
    }
  }

  /**
   * 推送打开事件处理
   */
  doOpenNotification(event: any) {
    if ('updatesoftware' === event.properCustoms.gdpr_mpage) {
      this.appVersionUpdateService.checkAppVersion(true);
    } else if (event.properCustoms.bean) {
      if (event.properAlert) {
        // 应用内
      } else if (event.properCustoms.push_type === 'chat') {
        let chatInfo: any = JSON.parse(event.properCustoms.bean);
        let params: Object = {};
        if (event.properCustoms.chatType === 'singleChat') {
          params['to_user_id'] = chatInfo.from_user_id;
          params['to_username'] = chatInfo.from_username;
          params['to_headportrait'] = chatInfo.from_headportrait;
          params['from_user_id'] = chatInfo.to_user_id;
          params['from_username'] = chatInfo.to_username;
          params['from_headportrait'] = chatInfo.to_headportrait;
        } else {
          params['from_user_id'] = this.userInfo.loginName;
          params['from_username'] = this.userInfo.userName;
          params['from_headportrait'] = this.userInfo.headImage;
          params['to_user_id'] = chatInfo.to_user_id;
          params['to_username'] = chatInfo.to_username;
          params['to_headportrait'] = chatInfo.to_headportrait;
        }
        params['chatType'] = event.properCustoms.chatType;
        params['chatId'] = chatInfo.chatId;
        params['isPush'] = '1';
        (<any>window).huanxin.chat(params);
      }
    } else {
      if (event.properAlert) {
        let messagesPrompt = this.alertCtrl.create({
          title: this.transateContent['PROMPT_INFO'],
          message: this.transateContent['PUSH_OPEN_PROMPT_ONE'] + event.properCustoms._proper_title + this.transateContent['PUSH_OPEN_PROMPT_TWO'],
          buttons: [
            {
              text: this.transateContent['CANCEL']
            },
            {
              text: this.transateContent['VIEW'],
              handler: data => {
                if ('todotasks' === event.properCustoms.gdpr_mpage) {
                  this.doOpenNotificationTodo(event.properCustoms);
                }
              }
            }
          ]
        });
        messagesPrompt.present();
      } else {
        if ('todotasks' === event.properCustoms.gdpr_mpage) {
          this.doOpenNotificationTodo(event.properCustoms);
        } else if ('noticetasks' === event.properCustoms.gdpr_mpage) {
          this.doOpenNotificationNoticeQuery(event.properCustoms);
        } else if ('querytasks' === event.properCustoms.gdpr_mpage) {
          this.doOpenNotificationQuery(event.properCustoms);
        } else if ('feedback' === event.properCustoms.gdpr_mpage) {
          this.doOpenNotificationFeedback(event.properCustoms);
        } else if ('examList' === event.properCustoms.gdpr_mpage) {
          this.doOpenNotificationExamlist(event.properCustoms);
        }
      }
    }
  }

  /**
   * 推送通知打开待办
   */
  doOpenNotificationTodo(customsDic: any) {
    let item: Object = {
      systemId: customsDic['systemId'],
      taskId: customsDic['taskId'],
      sign: customsDic['sign'],
      step: customsDic['step'],
      processName: customsDic['processName']
    };

    if (item['sign'] == null || item['sign'] === '') {
      this.http.get('/bpm/todos/' + item['id'] + 'claim').subscribe((res: Response) => {
        let userInfo: UserInfoState = this.userService.getUserInfo();
        item['assignee'] = userInfo.loginName;
        this.navCtrl.push(TodoDetailPage, item);
      }, (res: Response) => {
        this.toastService.show(res.text());
      });
    } else {
      this.navCtrl.push(TodoDetailPage, item);
    }
  }

  // 推送通知打开查询
  doOpenNotificationQuery(customsDic: any) {
    this.navCtrl.push(QueryDetailPage, customsDic);
  }

  // 推送通知打开通知查询
  doOpenNotificationNoticeQuery(customsDic: any) {
    this.navCtrl.push(QueryNoticeDetailPage, customsDic);
  }

  // 推送通知打开意见反馈
  doOpenNotificationFeedback(customsDic: any) {
    // 首次不加载
    if (!this.isFirst) {
      this.navCtrl.push(FeedbackPage);
    }
    this.isFirst = false;
    this.events.subscribe('logined', () => {
      this.navCtrl.push(FeedbackPage);
    });
  }
  // 推送通知打开流程
  doOpenNotificationExamlist(customsDic: any) {
    // 首次不加载
    if (!this.isFirst) {
      this.openExamlist(customsDic);
    }
    this.isFirst = false;
    this.events.subscribe('logined', () => {
      this.openExamlist(customsDic);
    });
  }

  // 打开推送通知
  openExamlist(customsDic: any) {
    const data = {
      name: customsDic.title,
      isPush: true,
      data: {
        url: customsDic.url.replace('#', '?v=' + new Date().getTime() + '#') + '&token=' + localStorage.getItem('token') + '&title=' + customsDic.title
      }
    };
    if (this.deviceService.getDeviceInfo().deviceType === 'android') {
      this.navCtrl.push(ExamCustomFramePage, data);
    } else {
      const browser = this.iab.create(data.data.url, '_blank', { 'location': 'no', 'toolbar': 'no' });
      browser.on('loadstop').subscribe(event => {
        browser.executeScript({ code: 'localStorage.setItem("If_Can_Back", "" );' });
        let loop = setInterval(() => {
          browser.executeScript({
            code: 'localStorage.getItem("If_Can_Back");'
          }).then(values => {
            let If_Can_Back = values[0];
            if (If_Can_Back === 'back') {
              clearInterval(loop);
              browser.close();
            }
          });
        }, 500);
      });
    }
  }

  // 自动登录
  autoLogin() {
    // 如果是从登录页进来，则直接获取会话列表未读数
    if (this.navParams.get('isAutoLogin') === false) {
      this.isFirst = false;
      if (this.deviceService.getDeviceInfo().deviceType) {
        // 获取未读消息数量
        this.getUnreadMessageNumber();
      }
    } else {
      // 调用 bind 接口更新 token
      this.http.post('/user/bind', { userId: this.userInfo.userId }).subscribe((data: Response) => {
        localStorage.token = data['_body'];
        this.events.publish('logined');
        this.isFirst = false;
        // 防止在 web 上报错
        if (this.deviceService.getDeviceInfo().deviceType) {
          // im 自动登录
          this.imlogin();
        }
      }, (res: Response) => {
        this.toastService.show(res.text());
      });
    }
  }

  // im 自动登录
  imlogin() {
    // 获取未读消息前先登录并将 chatKey 传入
    let params = {
      username: this.userInfo.loginName,
      password: this.userInfo.password0,
      baseUrl: this.configsService.getBaseUrl(),
      pushUrl: this.configsService.getPushUrl(),
      chatKey: this.configsService.getChatKey(),
      token: 'Bearer ' + localStorage['token'],
      chatId: this.userInfo.userId,
      pushAppId: this.appConstant.properPushConstant.appId,
      ext: {
        from_user_id: this.userInfo.loginName,
        from_username: this.userInfo.userName,
        from_headportrait: this.userInfo.headImage
      }
    };
    (<any>window).huanxin.imlogin(params, (loginData) => {
      this.zone.run(() => {
        if (loginData === 'user_not_found' && this.userService.imIsOpen()) {
          this.logOut('0');
        } else if (loginData !== 'user_not_found' && !this.userService.imIsOpen()) {
          this.logOut('1');
        }
        this.getUnreadMessageNumber();
      });
    });
  }

  // 获取未读消息数量
  getUnreadMessageNumber() {
    (<any>window).huanxin.getChatList('', (retData: Array<Object>) => {
      (<any>window).huanxin.loginState('', () => {
        // 推送服务取消与当前用户的绑定关系
        this.pushService.unBindUserid(this.userInfo.userId);
        // 取消自动登录
        this.userService.logout();
        this.http.post('/user/logoff', {}).subscribe(() => { }, () => { });
        // 退出
        this.navCtrl.push(LoginPage).then(() => {
          const startIndex = this.navCtrl.getActive().index - 1;
          this.navCtrl.remove(startIndex, 1);
        });
        (<any>window).huanxin.imlogout();
      });
      this.zone.run(() => {
        if (retData.length === 0) {
          this.store.dispatch(new ImReplaceBadageAction(''));
        } else {
          let total: number = 0;
          let i: number = retData.length;
          while (i) {
            i--;
            total += Number(retData[i]['unreadMessagesCount']);
          }
          if (total === 0) {
            this.store.dispatch(new ImReplaceBadageAction(''));
          } else {
            this.store.dispatch(new ImReplaceBadageAction(total.toString()));
          }
        }
      });
    }, (retData) => { });
  }

  /**
   * 退出登录
   */
  logOut(imIsOpen: string) {
    let params: Object = {};
    params['alertContent'] = imIsOpen === '0' ? this.transateContent['IM_CLOSE'] : this.transateContent['IM_OPEN'];
    (<any>window).huanxin.showNativeAlert(params, () => {
      this.zone.run(() => {
        localStorage.setItem('imIsOpen', imIsOpen);
        // 推送服务取消与当前用户的绑定关系
        this.pushService.unBindUserid(this.userInfo.userId);
        // 取消自动登录
        this.userService.logout();
        this.http.post('/user/logoff', {}).subscribe(() => { }, () => { });
        // 退出
        const data = {
          loginStatus: 'logout'
        };
        this.navCtrl.push(LoginPage, data).then(() => {
          const startIndex = this.navCtrl.getActive().index - 1;
          this.navCtrl.remove(startIndex, 1);
        });
        (<any>window).huanxin.imlogout();
      });
    });
  }
}
