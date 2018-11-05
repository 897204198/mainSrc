import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { Http, Response } from '@angular/http';
import { ToastService } from '../../../app/services/toast.service';
import { FileService } from '../../../app/services/file.service';
import { TodoOpinionPage } from '../todoOpinion/todoOpinion';
import { TranslateService } from '@ngx-translate/core';
import { ApplicationPage } from '../../application/application';

/**
 * 待办详情页面
 */
@Component({
  selector: 'page-todo-detail',
  templateUrl: 'todoDetail.html',
})
export class TodoDetailPage {

  // 是否显示审批按钮
  private hasApprovalBtn: boolean = false;
  // 审批按钮名称
  private btnText: string = '';
  // 提示文字
  private promptInfo: string = '';
  // 待办详细
  private todoDetail: Object = {};
  // 附件列表
  private fileList: Object[];
  // 国际化文字
  private transateContent: Object;

  /**
   * 构造函数
   */
  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    private http: Http,
    private toastService: ToastService,
    private fileService: FileService,
    private translate: TranslateService) {
    let translateKeys: string[] = ['SUBMIT_SUCCESS', 'SUBMIT_ERROR', 'TODO_CANNOT_USE', 'READ', 'APPROVAL'];
    this.translate.get(translateKeys).subscribe((res: Object) => {
      this.transateContent = res;
    });
  }

  /**
   * 每次进入页面
   */
  ionViewDidEnter(): void {
    this.getTodoDetail();
  }

  /**
   * 取得待办详细
   */
  getTodoDetail(): void {
    this.todoDetail = {};
    this.fileList = [];
    let params: Object = {
      'stepCode': this.navParams.get('stepCode'),
      'processName': this.navParams.get('processName'),
      'taskId': this.navParams.get('id'),
      'step': this.navParams.get('stepCode')
    };
    this.http.get('/bpm/todos/' + this.navParams.get('id'), { params: params }).subscribe((res: Response) => {
      this.todoDetail = res.json();
      this.btnText = this.todoDetail['btnText'];
      if (this.btnText == null || this.btnText === '') {
        if (this.todoDetail['approvalType'] === 'forward') {
          this.btnText = this.transateContent['READ'];
        } else {
          this.btnText = this.transateContent['APPROVAL'];
        }
      }

      if (this.todoDetail['approvalType'] === 'viewonly') {
        this.hasApprovalBtn = false;
        this.promptInfo = this.transateContent['TODO_CANNOT_USE'];
      } else {
        this.promptInfo = this.todoDetail['prompt_info'];
        this.hasApprovalBtn = true;
      }

      for (let i = 0; i < this.todoDetail['forms'].length; i++) {
        let form = this.todoDetail['forms'][i];
        if (form['type'] === 'filelist' && form['values'] != null && form['values'].length > 0) {
          this.fileList.push(this.todoDetail['forms'][i]);
        }
      }
    }, (res: Response) => {
      this.toastService.show(res.text());
    });
  }

  /**
   * 审批办理
   */
  approval(): void {
    let submitUtl: string = this.todoDetail['submit_path'];
    if (submitUtl == null || submitUtl === '') {
      submitUtl = '/bpm/todos/' + this.navParams.get('id');
    }
    if (this.todoDetail['approvalType'] === 'forward') {
      let params: Object = {
        'stepCode': this.navParams.get('stepCode'),
        'processName': this.navParams.get('processName'),
        'taskId': this.navParams.get('id'),
        'step': this.navParams.get('stepCode')
      };
      this.http.post(submitUtl, params).subscribe((res: Response) => {
        this.toastService.show(this.transateContent['SUBMIT_SUCCESS']);
        this.navCtrl.pop();
      }, (res: Response) => {
        this.toastService.show(res.text());
      });
    } else if (this.todoDetail['approvalType'] === 'shenpipage') {
      let params: Object = {
        approvals: this.todoDetail['approvals'],
        submitUtl: submitUtl,
        hideComment: this.todoDetail['hideComment'],
        commentDefault: this.todoDetail['commentDefault'],
        processName: this.navParams.get('processName'),
        id: this.navParams.get('id'),
        stepCode: this.navParams.get('stepCode'),
        taskId: this.navParams.get('id'),
        step: this.navParams.get('stepCode')
      };
      this.navCtrl.push(TodoOpinionPage, params);
    } else if (this.todoDetail['shenpi_type'] === 'shenqingpage') {
      let params: Object = {
        systemId: this.todoDetail['systemId'],
        processName: this.navParams.get('processName'),
        taskId: this.navParams.get('taskId'),
        step: this.navParams.get('step')
      };
      this.navCtrl.push(TodoOpinionPage, params);
    } else if (this.todoDetail['shenpi_type'] === 'shenqingpage') {
      let params: Object = {
        assignee: this.navParams.get('assignee'),
        taskId: this.navParams.get('taskId'),
        step: this.navParams.get('step')
      };
      this.navCtrl.push(ApplicationPage, params);
    }
  }

  /**
   * 下载附件
   */
  downloadFile(file: Object): void {
    this.fileService.downloadFile(file['id'], file['name']);
  }

  /**
   * 取得文件类型
   */
  getFileType(fileName: string): string {
    return fileName.substring(fileName.lastIndexOf('.') + 1, fileName.length).toLowerCase();
  }
}
