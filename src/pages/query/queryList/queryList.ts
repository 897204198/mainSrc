import { Component, Inject, ViewChild } from '@angular/core';
import { Http, Response } from '@angular/http';
import { NavController, NavParams, Refresher, InfiniteScroll, ModalController } from 'ionic-angular';
import { ICMP_CONSTANT, IcmpConstant } from '../../../app/constants/icmp.constant';
import { ToastService } from '../../../app/services/toast.service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { QueryListConditionPage } from '../queryListCondition/queryListCondition';
import { QueryDetailPage } from '../queryDetail/queryDetail';
import { QueryNoticeDetailPage } from '../queryNoticeDetail/queryNoticeDetail';

/**
 * 查询列表页面
 */
@Component({
  selector: 'page-query-list',
  templateUrl: 'queryList.html',
})
export class QueryListPage {

  @ViewChild(InfiniteScroll) infiniteScroll: InfiniteScroll;
  // 页面标题
  title: string = '';
  // 页码
  pageNo: number = 0;
  // 是否为一级查询列表
  isTabQuery: boolean = true;
  // 是否有查询条件
  hasCondition: boolean = false;
  // 查询结果列表
  queryList: Object[];
  // 查询条件列表
  conditionList: Object[];
  // 查询条件
  queryInput: Object;
  // 下拉刷新事件
  private refresher: Refresher;
  // 应用所占的宽度
  private menuWidth: string;

  /**
   * 构造函数
   */
  constructor(public navCtrl: NavController,
              public navParams: NavParams,
              @Inject(ICMP_CONSTANT) private icmpConstant: IcmpConstant,
              private http: Http,
              private toastService: ToastService,
              private sanitizer: DomSanitizer,
              private modalCtrl: ModalController) {
    if (screen.width <= 375) {
      this.menuWidth = 25 + '%';
    } else if (screen.width > 375 && screen.width <= 590) {
      this.menuWidth = 20 + '%';
    } else {
      this.menuWidth = 16.6 + '%';
    }
  }

  /**
   * 每次进入页面
   */
  ionViewDidEnter(): void {
    this.hasCondition = false;
    this.conditionList = [];
    this.title = this.navParams.get('name');
    this.initQueryList();
  }

  // 初始化查询结果列表
  initQueryList(): void {
    this.queryList = null;
    this.pageNo = 1;
    this.infiniteScroll.enable(true);
    this.getQueryList(true);
  }

  /**
   * 取得查询结果列表
   */
  getQueryList(isInit: boolean): void {
    let params: Object = {
      'pageNo': this.pageNo.toString(),
      'pageSize': this.icmpConstant.pageSize,
      'serviceName': this.navParams.get('serviceName'),
      'defaultTab': this.navParams.get('defaultTab')
    };
    if (this.queryInput != null) {
      for (let key in this.queryInput) {
        if (this.queryInput.hasOwnProperty(key)) {
          params[key] = this.queryInput[key];
        }
      }
    }

    this.http.get('/business/querys', { params: params }).subscribe((res: any) => {
      let data = res.json();
      let defaultTab = this.navParams.get('defaultTab');
      if (data.tabList == null || data.tabList.length <= 1 || (defaultTab != null && defaultTab !== '' && defaultTab !== 'default')) {
        this.isTabQuery = false;
      } else {
        this.isTabQuery = true;
      }
      if (!this.isTabQuery) {
        if (isInit) {
          this.queryList = data.rows;
          if (data.conditons != null && data.conditons.length > 0) {
            this.hasCondition = true;
            this.conditionList = data.conditons;
          }
        } else {
          for (let i = 0; i < data.rows.length; i++) {
            this.queryList.push(data.rows[i]);
          }
        }
        this.infiniteScrollComplete();
        if ((data.rows == null || data.rows.length < Number(this.icmpConstant.pageSize)) && this.infiniteScroll != null) {
          this.infiniteScroll.enable(false);
        }
      } else {
        this.queryList = data.tabList;
      }
    }, (res: Response) => {
      this.toastService.show(res.text());
    }, () => {
      this.refresherComplete();
    });
  }

  /**
   * 打开查询条件输入页面
   */
  queryConditonOpen(): void {
    let modal = this.modalCtrl.create(QueryListConditionPage, { 'conditionList': this.conditionList, 'queryInput': this.queryInput });
    modal.onDidDismiss(data => {
      if (data != null) {
        this.queryInput = data;
        this.initQueryList();
      }
    });
    modal.present();
  }

  /**
   * 跳转到二级查询列表
   */
  goQuerySubList(item: Object): void {
    let menu = { ...this.navParams.data };
    menu.title = item['tabName'];
    menu.defaultTab = item['tabValue'];
    this.navCtrl.push(QueryListPage, menu);
  }

  /**
   * 跳转到查询详细页面
   */
  goQueryDetail(item: Object): void {
    let detailTitle = item['detailTitleBarText'];
    if (detailTitle == null || detailTitle === '') {
      detailTitle = this.title + '详细';
    }
    let params: Object = {
      'title': detailTitle,
      'id': item['id'],
      'serviceName': this.navParams.get('serviceName'),
      'defaultTab': this.navParams.get('defaultTab'),
      'style': item['style']
    };
    if (item['style'] === 'notice_style') {
      this.navCtrl.push(QueryNoticeDetailPage, params);
    } else {
      this.navCtrl.push(QueryDetailPage, params);
    }
  }

  /**
   * 转换Html格式
   */
  getSafeHtml(html: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

  /**
   * 下拉刷新
   */
  doRefresh(refresher: Refresher): void {
    this.refresher = refresher;
    this.initQueryList();
  }

  // 瀑布流加载
  doInfinite(): void {
    if (this.isTabQuery) {
      this.infiniteScroll.enable(false);
    } else {
      this.pageNo++;
      this.getQueryList(false);
    }
  }

  /**
   * 完成下拉刷新
   */
  refresherComplete(): void {
    if (this.refresher != null) {
      this.refresher.complete();
    }
  }

  /**
   * 完成瀑布流加载
   */
  infiniteScrollComplete(): void {
    if (this.infiniteScroll != null) {
      this.infiniteScroll.complete();
    }
  }
}
