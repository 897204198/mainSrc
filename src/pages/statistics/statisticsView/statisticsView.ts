import { Component, ElementRef } from '@angular/core';
import { NavParams } from 'ionic-angular';
import { Http, Response } from '@angular/http';
import { ToastService } from '../../../app/services/toast.service';
import echarts from 'echarts';

/**
 * 统计查询页面
 */
@Component({
  selector: 'page-statistics-view',
  templateUrl: 'statisticsView.html',
})
export class StatisticsViewPage {

  title: string = '';
  statisticsDate: Object = {};

  constructor(public navParams: NavParams,
    private http: Http,
    private el: ElementRef,
    private toastService: ToastService) { }

  ionViewDidLoad(): void {
    this.title = this.navParams.get('title');
    this.getInitData();
  }

  /**
   * 取得初始化数据
   */
  getInitData(): void {
    let params = {
      'serviceName': this.navParams.get('serviceName')
    };
    if (this.navParams.get('data') != null) {
      let datas = this.navParams.get('data');
      for (let key in datas) {
        if (datas.hasOwnProperty(key)) {
          params[key] = datas[key];
        }
      }
    }
    if (this.navParams.get('queryCondition') != null) {
      let datas = this.navParams.get('queryCondition');
      for (let key in datas) {
        if (datas.hasOwnProperty(key)) {
          params[key] = datas[key];
        }
      }
    }
    this.http.get('/business/statistics/result', { params: params }).subscribe((res: Response) => {
      this.statisticsDate = res.json();
      for (let i = 0; i < this.statisticsDate['charts'].length; i++) {
        if (this.statisticsDate['charts'][i]['height'] == null || this.statisticsDate['charts'][i]['height'] === '') {
          this.statisticsDate['charts'][i]['height'] = '300px';
        }
        this.createChart(i, this.statisticsDate['charts'][i]['json']);
      }
    }, (res: Response) => {
      this.toastService.show(res.text());
    });
  }

  /**
   * 创建统计图
   */
  createChart(index: number, json: Object): void {
    setTimeout(() => {
      let myChart = echarts.init(this.el.nativeElement.querySelector('#chart_' + index));
      myChart.setOption(json);
    }, 500);
  }
}
