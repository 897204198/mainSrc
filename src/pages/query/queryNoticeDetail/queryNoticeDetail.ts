import { Component } from '@angular/core';
import { Http, Response } from '@angular/http';
import { NavParams } from 'ionic-angular';
import { ToastService } from '../../../app/services/toast.service';
import { FileService } from '../../../app/services/file.service';

/**
 * 查询公告详情页面
 */
@Component({
  selector: 'page-query-notice-detail',
  templateUrl: 'queryNoticeDetail.html'
})
export class QueryNoticeDetailPage {

  // 页面头
  private title: string = '';
  // 公告通知内容
  private notice: Object;

  /**
   * 构造函数
   */
  constructor(public navParams: NavParams,
              private http: Http,
              private toastService: ToastService,
              private fileService: FileService) {}

  /**
   * 进入页面
   */
  ionViewDidLoad(): void {
    this.title = this.navParams.get('title');
    this.getNoticeDetailed();
  }

  /**
   * 取得公告通知详细
   */
  getNoticeDetailed(): void {
    this.notice = {};
    let params: Object = {
      'serviceName': this.navParams.get('serviceName'),
      'id': this.navParams.get('id'),
      'style': this.navParams.get('style')
    };
    this.http.get('/business/querys/' + this.navParams.get('id'), { params: params }).subscribe((res: any) => {
      this.notice = res.json();
      if (this.notice['fileList'] != null) {
        for (let i = 0 ; i < this.notice['fileList'].length ; i++) {
          let file = this.notice['fileList'][i];
          file.fileType = file.fileName.substring(file.fileName.lastIndexOf('.') + 1, file.fileName.length).toLowerCase();
        }
      }
    }, (res: Response) => {
      this.toastService.show(res.text());
    });
  }

  /**
   * 下载附件
   */
  downloadFile(file: Object): void {
    this.fileService.downloadFile(file['fileId'], file['fileName']);
  }
}
