import { Component } from '@angular/core';
import { NavParams, NavController, ModalController } from 'ionic-angular';
import { Http, Response } from '@angular/http';
import { ToastService } from '../../../app/services/toast.service';
import { SafeHtml, DomSanitizer } from '@angular/platform-browser';
import { UtilsService } from '../../../app/services/utils.service';
import { SearchboxComponent } from '../../../app/component/searchbox/searchbox.component';
import { TranslateService } from '@ngx-translate/core';
import { StatisticsViewPage } from '../statisticsView/statisticsView';

/**
 * 统计查询页面
 */
@Component({
  selector: 'page-statistics-query',
  templateUrl: 'statisticsQuery.html',
})
export class StatisticsQueryPage {

  title: string = '';
  template: Object[] = [];
  input: Object = {};
  private transateContent: Object;

  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    public modalCtrl: ModalController,
    private http: Http,
    private sanitizer: DomSanitizer,
    private utilsService: UtilsService,
    private translate: TranslateService,
    private toastService: ToastService) {
    let translateKeys: string[] = ['VALI_REQUIRED'];
    this.translate.get(translateKeys).subscribe((res: Object) => {
      this.transateContent = res;
    });
  }

  ionViewDidLoad(): void {
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
    this.http.get('/business/statistics/condition', { params: params }).subscribe((res: Response) => {
      let data = res.json();
      this.template = data;

      for (let i = 0; i < this.template.length; i++) {
        let item = this.template[i];

        if (item['default'] != null && item['type'] !== 'label') {
          this.input[item['model']] = item['default'];
        }
        if (item['defaultId'] != null) {
          this.input[item['model']] = item['defaultId'];
          this.input[item['model'] + 'Name'] = item['defaultName'];
        }
        item['labelBak'] = item['label'];
        item['label'] = this.setRequiredLabel(item);
      }
    }, (res: Response) => {
      this.toastService.show(res.text());
    });
  }

  /**
   * 设置必填项标签
   */
  setRequiredLabel(item: Object): string {
    let label = item['label'];
    if (item['validator'] != null) {
      for (let j = 0; j < item['validator'].length; j++) {
        if (item['validator'][j]['type'] === 'required') {
          label = item['label'] + '<span style="color: red;">*</span>';
          break;
        }
      }
    }
    return label;
  }

  /**
   * 转换Html格式
   */
  getSafeHtml(html: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

  /**
   * 下拉选择事件
   */
  selectChange(item: Object): void {
    let data = item['data'];
    for (let i = 0; i < data.length; i++) {
      this.setControl(item, data[i]);
    }
  }

  /**
   * 清空日期控件
   */
  clearDatetime(item: Object): void {
    this.input[item['model']] = '';
  }

  /**
   * 设置日期控件默认值
   */
  setDatetime(item: Object): void {
    if (this.input[item['model']] == null || this.input[item['model']] === '') {
      this.input[item['model']] = this.utilsService.formatDate(new Date(), item['format']);
    }
  }

  /**
   * 选择框
   */
  searchboxSelect(item: Object): void {
    let params: Object = {};
    let multiple: boolean = (item['category'] === 'multi');
    let searchUrl = item['searchUrl'];
    params = { 'title': item['labelBak'], 'multiple': multiple, 'searchUrl': searchUrl };
    let modal = this.modalCtrl.create(SearchboxComponent, params);
    modal.onDidDismiss(data => {
      if (data != null) {
        this.input[item['model'] + 'Name'] = data.name;
        this.input[item['model']] = data.id;
        this.setControl(item, item);
      }
    });
    modal.present();
  }

  /**
   * 设置控制事件
   */
  setControl(item: Object, option: Object): void {
    if (option['controls'] != null) {
      for (let j = 0; j < option['controls'].length; j++) {
        let control = option['controls'][j];
        if (control['type'] === 'display') {
          if (this.input[item['model']] != null && this.input[item['model']].indexOf(option['id']) >= 0) {
            for (let k = 0; k < control.models.length; k++) {
              this.setInputStatus(control.models[k], 'display');
            }
          } else {
            for (let k = 0; k < control.models.length; k++) {
              this.setInputStatus(control.models[k], 'hidden');
            }
          }
        } else if (control['type'] === 'initSelect') {
          let flg: boolean = false;
          if (item['type'] === 'searchbox') {
            flg = true;
          } else {
            if (this.input[item['model']] != null && this.input[item['model']].indexOf(option['id']) >= 0) {
              flg = true;
            }
          }
          if (flg) {
            let url = control['url'];
            let params = {
              'serviceName': this.navParams.get('serviceName'),
              'id': this.input['deptId']
            };
            this.http.post(url, params).subscribe((res: Response) => {
              let data = res.json().result_list;
              for (let k = 0; k < this.template.length; k++) {
                if (this.template[k]['model'] === control['model']) {
                  this.template[k]['data'] = data;
                  break;
                }
              }
            }, (res: Response) => {
              this.toastService.show(res.text());
            });
          } else {
            for (let k = 0; k < this.template.length; k++) {
              if (this.template[k]['model'] === control['model']) {
                this.template[k]['data'] = [];
                break;
              }
            }
          }
        }
      }
    }
  }

  /**
   * 设置表单控件状态
   */
  setInputStatus(model: string, status: string): void {
    for (let i = 0; i < this.template.length; i++) {
      if (this.template[i]['model'] === model) {
        this.template[i]['status'] = status;
        if (status === 'hidden') {
          this.input[model] = null;
          if (this.template[i]['type'] === 'searchbox') {
            this.input[model + 'Name'] = null;
          }
        }
        break;
      }
    }
  }

  /**
   * 验证表单
   */
  verification(): boolean {
    for (let i = 0; i < this.template.length; i++) {
      let item = this.template[i];
      if (item['validator'] != null && item['status'] !== 'hidden') {
        for (let j = 0; j < item['validator'].length; j++) {
          if (item['validator'][j]['type'] === 'required' && (this.input[item['model']] == null || this.input[item['model']] === '')) {
            this.toastService.show(this.transateContent['VALI_REQUIRED']);
            return false;
          }
        }
      }
    }
    return true;
  }

  /**
   * 统计查询
   */
  query(): void {
    if (this.verification()) {
      let params: Object = {
        queryCondition: {}
      };
      for (let key in this.input) {
        if (this.input.hasOwnProperty(key)) {
          params['queryCondition'][key] = this.input[key];
        }
      }
      params['title'] = this.navParams.get('title');
      params['serviceName'] = this.navParams.get('serviceName');
      params['data'] = this.navParams.get('data');
      this.navCtrl.push(StatisticsViewPage, params);
    }
  }
}
