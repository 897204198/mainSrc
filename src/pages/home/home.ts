import { Component, ElementRef, ViewChild, NgZone, Inject } from '@angular/core';
import { Http, Response } from '@angular/http';
import { NavController, Slides, Events } from 'ionic-angular';
import { Observable } from 'rxjs/Observable';
import { ToastService } from '../../app/services/toast.service';
import { TranslateService } from '@ngx-translate/core';
import { IcmpConstant, ICMP_CONSTANT } from '../../app/constants/icmp.constant';
import { RoutersService } from '../../app/services/routers.service';
import { SecureStorageService } from '../../app/services/secureStorage.service';

/**
 * 首页
 */
@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  // 轮播图对象
  @ViewChild('ionCarouselSlides') slider: Slides;
  // 轮播图高度
  private bannerlHeight: string = '';
  // 是否显示页面头
  private shadowShow: boolean = false;
  // 我的应用列表
  private menus: Object[] = [];
  // 我的插件列表
  private plugins: Object[] = [];
  // 通知消息列表
  private notices: Object[] = [];
  // 定时对象
  private intervalId: any = null;
  private intervalSlideId: any = null;
  // 通知消息滚动参数
  private noticeMarginIndex: number = 0;
  // 国际化文字
  private transateContent: Object;
  // 是否是首次加载
  private isFirst: boolean = true;

  /**
   * 构造函数
   */
  constructor(private navCtrl: NavController,
    private el: ElementRef,
    private zone: NgZone,
    private http: Http,
    private toastService: ToastService,
    private translate: TranslateService,
    private routersService: RoutersService,
    private secureStorageService: SecureStorageService,
    @Inject(ICMP_CONSTANT) private icmpConstant: IcmpConstant,
    public events: Events) {
    let translateKeys: string[] = ['NOTICE_DETAILED'];
    this.translate.get(translateKeys).subscribe((res: Object) => {
      this.transateContent = res;
    });
    // 轮播图高度
    let width = document.body.clientWidth;
    this.bannerlHeight = width * 572 / 1280 + 'px';
    this.getCache();
    // 保证登录成功后再请求接口
    events.subscribe('logined', () => {
      this.setNotice();
      this.setAppList();
      this.setPlugins();
    });
  }

  /**
   * 首次进入页面
   */
  ionViewDidLoad(): void {
    this.scrollHeader();
  }

  /**
   * 每次进入页面
   */
  ionViewDidEnter(): void {
    // 首次不加载
    if (!this.isFirst) {
      this.getCache();
      this.setNotice();
      this.setAppList();
      this.setPlugins();
    }
    this.isFirst = false;

    // 轮播图处理
    this.zone.runOutsideAngular(() => {
      this.intervalSlideId = setInterval(() => {
        this.zone.run(() => {
          if (this.slider) {
            this.slider.slideNext();
          }
        });
      }, 3000);
    });
  }

  /**
   * 获取缓存
   */
  getCache() {
    this.notices = this.secureStorageService.getObject('home_notice');
    if (this.notices && this.notices.length > 0) {
      this.notices.push(this.secureStorageService.getObject('home_notice')[0]);
      this.noticeMarginIndex = 0;
      setTimeout(() => {
        this.noticeScroll();
      }, 200);
    }
    this.menus = this.secureStorageService.getObject('home_applist');
    this.plugins = this.secureStorageService.getObject('home_plugins');
  }

  /**
   * 页面离开
   */
  ionViewWillLeave(): void {
    clearInterval(this.intervalSlideId);
    clearInterval(this.intervalId);
  }

  /**
   * 窗口大小改变事件
   */
  onResize(): void {
    let width = document.body.clientWidth;
    this.bannerlHeight = width * 572 / 1280 + 'px';
    this.slider.resize();
  }

  /**
   * 导航栏透明，向下拖动显示
   */
  scrollHeader(): void {
    let scroll = this.el.nativeElement.querySelector('.scroll-content');
    let head = this.el.nativeElement.querySelector('.header');
    let header = this.el.nativeElement.querySelector('.toolbar-background');
    let iosHeader = this.el.nativeElement.querySelector('.toolbar-background-ios');
    this.shadowShow = false;
    if (iosHeader !== null) {
      iosHeader['style'].borderStyle = 'none';
    }
    head['style'].opacity = 0;
    Observable.fromEvent(scroll, 'scroll').subscribe(() => {
      let top = scroll.scrollTop;
      if (top > 140) {
        head['style'].opacity = 1;
        header['style'].background = 'rgba(255,255,255,1)';
        if (iosHeader !== null) {
          iosHeader['style'].borderStyle = 'solid';
        }
        this.shadowShow = true;
      } else {
        let op = top / 140;
        head['style'].opacity = op;
        header['style'].background = 'rgba(255,255,255,' + op + ')';
        if (op > 0.5) {
          this.shadowShow = true;
          if (iosHeader !== null) {
            iosHeader['style'].borderStyle = 'solid';
          }
        } else {
          this.shadowShow = false;
          if (iosHeader !== null) {
            iosHeader['style'].borderStyle = 'none';
          }
        }
      }
    });
  }

  /**
   * 设置首页应用列表
   */
  setAppList(): void {
    this.http.get('/app/applications').subscribe((res: any) => {
      if (res._body != null && res._body !== '') {
        this.menus = [];
        let data = res.json();
        for (let i = 0; i < data.length; i++) {
          if (data[i].total > 99) {
            data[i].total = '99+';
          }
          this.menus.push(data[i]);
        }
        this.secureStorageService.putObject('home_applist', this.menus);
      }
    }, (res: Response) => {
      this.toastService.show(res.text());
    });
  }

  /**
   * 设置首页插件列表
   */
  setPlugins(): void {
    this.http.get('/sys/plugins/user').subscribe((res: any) => {
      if (res._body != null && res._body !== '') {
        this.plugins = [];
        this.plugins = res.json();
        this.secureStorageService.putObject('home_plugins', this.plugins);
      }
    }, (res: Response) => {
      this.toastService.show(res.text());
    });
  }

  /**
   * 获取通知消息列表
   */
  setNotice(): void {
    let params = {
      'pageNo': '1',
      'pageSize': '3',
      'serviceName': 'notifyPublishQueryService'
    };
    this.http.get('/business/querys', { params: params }).subscribe((res: any) => {
      if (res._body != null && res._body !== '') {
        this.notices = [];
        let data = res.json().rows;
        for (let i = 0; i < data.length; i++) {
          // 去除html
          let tempStr: string = data[i].title;
          data[i].title = tempStr.replace(/<[^>]+>/g, '');
        }
        this.notices = data;
        this.secureStorageService.putObject('home_notice', this.notices);
        if (this.notices.length > 0) {
          this.notices.push(data[0]);
          this.noticeMarginIndex = 0;
          setTimeout(() => {
            this.noticeScroll();
          }, 200);
        }
      }
    }, (res: Response) => {
      this.toastService.show(res.text());
    });
  }

  /**
   * 通知消息滚动
   */
  noticeScroll(): void {
    this.zone.runOutsideAngular(() => {
      this.intervalId = setInterval(() => {
        let noticeFirst = this.el.nativeElement.querySelector('.notice-first');
        if (noticeFirst != null) {
          this.noticeMarginIndex++;
          if (this.noticeMarginIndex === this.notices.length - 1) {
            setTimeout(() => {
              noticeFirst.style.transition = 'margin 0s ease-in-out';
              noticeFirst.style.marginTop = '0px';
            }, 1000);
          } else if (this.noticeMarginIndex === this.notices.length) {
            this.noticeMarginIndex = 1;
          }
          noticeFirst.style.transition = 'margin 0.6s ease-in-out';
          noticeFirst.style.marginTop = '-' + 30 * this.noticeMarginIndex + 'px';
        }
      }, 3500);
    });
  }

  /**
   * 打开通知消息
   */
  openNotice(item: any): void {
    let title = item.detailTitleBarText ? item.detailTitleBarText : this.transateContent['NOTICE_DETAILED'];
    let menuItem: any = {
      'style': item.style,
      'id': item.id,
      'page': this.icmpConstant.page.queryDetail,
      'title': title,
      'serviceName': 'notifyPublishQueryService'
    };
    this.routersService.pageForward(this.navCtrl, menuItem);
  }

  openAllNotice(): void {
    let menuItem: any = {
      'style': 'notice_style',
      'page': 'query',
      'name': '公告通知',
      'serviceName': 'notifyPublishQueryService'
    };
    this.routersService.pageForward(this.navCtrl, menuItem);
  }
}
