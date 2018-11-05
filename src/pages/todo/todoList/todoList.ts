import { Component, Inject, ViewChild } from '@angular/core';
import { Http, Response } from '@angular/http';
import { NavController, NavParams, Refresher, InfiniteScroll } from 'ionic-angular';
import { IcmpConstant, ICMP_CONSTANT } from '../../../app/constants/icmp.constant';
import { ToastService } from '../../../app/services/toast.service';
import { TranslateService } from '@ngx-translate/core';
import { TodoDetailPage } from '../todoDetail/todoDetail';
import { UserInfoState, UserService } from '../../../app/services/user.service';

import { Store } from '@ngrx/store';
import { TodoReplaceBadageAction } from '../../../app/redux/actions/todo.action';

/**
 * 待办列表页面
 */
@Component({
  selector: 'page-todo-list',
  templateUrl: 'todoList.html',
})
export class TodoListPage {

  @ViewChild(InfiniteScroll) infiniteScroll: InfiniteScroll;
  // 页面标题
  private title: string = '';
  // 页码
  private pageNo: number = 0;
  // 待办列表
  private todoList: Object[] = [];
  // 待办总数
  private todoTotal: number = 0;
  // 下拉刷新事件
  private refresher: Refresher;
  // 国际化文字
  private transateContent: Object;

  /**
   * 构造函数
   */
  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    @Inject(ICMP_CONSTANT) private icmpConstant: IcmpConstant,
    private http: Http,
    private toastService: ToastService,
    private userService: UserService,
    private translate: TranslateService,
    private store: Store<string>) {
    this.title = navParams.get('title');

    let translateKeys: string[] = ['CLAIM_SUCCESS', 'GOBACK_SUCCESS'];
    this.translate.get(translateKeys).subscribe((res: Object) => {
      this.transateContent = res;
    });
  }

  /**
   * 每次进入页面
   */
  ionViewDidEnter(): void {
    this.todoTotal = 0;
    this.initTodoList();
  }

  /**
   * 初始化待办列表
   */
  initTodoList(): void {
    this.pageNo = 1;
    this.infiniteScroll.enable(true);
    this.getTodoList(true);
  }

  /**
   * 取得待办列表
   */
  getTodoList(isInit: boolean): void {
    let params: Object = {
      'pageNo': this.pageNo.toString(),
      'pageSize': this.icmpConstant.pageSize,
      'processName': this.navParams.get('processName')
    };
    this.http.get('/bpm/todos', { params: params }).subscribe((res: Response) => {
      this.todoList = [];
      let data = res.json();
      this.todoTotal = data.total;
      // 修复其他待办页会影响 tabs 上待办的角标
      if (!this.navCtrl.canGoBack()) {
        // redux传值
        if (data.total === 0) {
          this.store.dispatch(new TodoReplaceBadageAction(''));
        } else {
          this.store.dispatch(new TodoReplaceBadageAction(data.total));
        }
      }

      if (isInit) {
        this.todoList = data.rows;
      } else {
        for (let i = 0; i < data.rows.length; i++) {
          this.todoList.push(data.rows[i]);
        }
      }
      this.infiniteScrollComplete();
      if ((data.rows == null || data.rows.length < Number(this.icmpConstant.pageSize)) && this.infiniteScroll != null) {
        this.infiniteScroll.enable(false);
      }
    }, (res: Response) => {
      this.toastService.show(res.text());
    }, () => {
      this.refresherComplete();
    });
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

  /**
   * 下拉刷新
   */
  doRefresh(refresher: Refresher): void {
    this.refresher = refresher;
    this.initTodoList();
  }

  // 瀑布流加载
  doInfinite(): void {
    this.pageNo++;
    this.getTodoList(false);
  }

  /**
   * 签收
   */
  doClaim(item: Object): void {
    this.http.get('/bpm/todos/' + item['id'] + '/claim').subscribe((res: Response) => {
      this.toastService.show(this.transateContent['CLAIM_SUCCESS']);
      let userInfo: UserInfoState = this.userService.getUserInfo();
      item['assignee'] = userInfo.loginName;
    }, (res: Response) => {
      this.toastService.show(res.text());
    });
  }

  /**
   * 退回
   */
  doGoback(item: Object): void {
    this.http.get('/bpm/todos/' + item['id'] + '/goback').subscribe((res: Response) => {
      this.toastService.show(this.transateContent['GOBACK_SUCCESS']);
      item['assignee'] = '';
    }, (res: Response) => {
      this.toastService.show(res.text());
    });
  }

  /**
   * 办理
   */
  doHandle(item: Object): void {
    if (item['assignee'] === '') {
      this.http.get('/bpm/todos/' + item['id'] + '/claim').subscribe((res: Response) => {
        let userInfo: UserInfoState = this.userService.getUserInfo();
        item['assignee'] = userInfo.loginName;
        this.goTodoDetailPage(item);
      }, (res: Response) => {
        this.toastService.show(res.text());
      });
    } else {
      this.goTodoDetailPage(item);
    }
  }

  /**
   * 办理
   */
  private goTodoDetailPage(item: Object): void {
    let params: Object = {
      id: item['id'],
      assignee: item['assignee'],
      stepCode: item['stepCode'],
      processName: item['processName']
    };
    this.navCtrl.push(TodoDetailPage, params);
  }
}
