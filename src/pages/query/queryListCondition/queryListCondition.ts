import { Component } from '@angular/core';
import { ViewController, NavParams, ModalController } from 'ionic-angular';
import { SearchboxComponent } from '../../../app/component/searchbox/searchbox.component';
import { UtilsService } from '../../../app/services/utils.service';

/**
 * 查询条件页面
 */
@Component({
  selector: 'page-query-list-condition',
  templateUrl: 'queryListCondition.html',
})
export class QueryListConditionPage {

  // 查询条件列表
  conditionList: Object[];
  // 查询条件
  queryInput: Object = {};

  /**
   * 构造函数
   */
  constructor(public navParams: NavParams,
    public viewCtrl: ViewController,
    private modalCtrl: ModalController,
    private utilsService: UtilsService) { }

  /**
   * 首次进入页面
   */
  ionViewDidLoad(): void {
    this.setConditionList();
  }

  /**
   * 设置查询条件
   */
  setConditionList(): void {
    this.conditionList = [];
    let conditionListTmp: Object[] = this.navParams.get('conditionList');
    this.queryInput = this.navParams.get('queryInput');
    if (this.queryInput == null) {
      this.queryInput = {};
    }
    for (let i = 0; i < conditionListTmp.length; i++) {
      let conditionTmp = conditionListTmp[i];
      if (conditionTmp['format'] != null && conditionTmp['format'] !== '') {
        conditionTmp['format'] = conditionTmp['format'].replace(new RegExp('y', 'gm'), 'Y').replace(new RegExp('d', 'gm'), 'D');
      }
      this.conditionList.push(conditionTmp);
      if (conditionTmp['data'] != null) {
        for (let j = 0; j < conditionTmp['data'].length; j++) {
          let queryDataTmp = conditionTmp['data'][j];
          if (queryDataTmp['subforms'] != null) {
            for (let m = 0; m < queryDataTmp['subforms'].length; m++) {
              queryDataTmp['subforms'][m]['isSubCondition'] = true;
              queryDataTmp['subforms'][m]['subConditionQValue'] = conditionTmp['model'];
              queryDataTmp['subforms'][m]['subConditionValue'] = queryDataTmp['value'];
              this.conditionList.push(queryDataTmp['subforms'][m]);
            }
          }
        }
      }
    }
    for (let i = 0; i < this.conditionList.length; i++) {
      let condition = this.conditionList[i];
      if (condition['defaultName'] != null && condition['defaultName'] !== '' && !condition['isSubCondition']) {
        this.queryInput[condition['model']] = condition['defaultName'];
      }
    }
  }

  /**
   * 关闭页面
   */
  dismiss(): void {
    this.viewCtrl.dismiss();
  }

  /**
   * 查询提交
   */
  querySubmit(): void {
    this.viewCtrl.dismiss(this.queryInput);
  }

  /**
   * 是否显示联动查询条件
   */
  subCondition(condition: Object): boolean {
    if (condition['isSubCondition']) {
      if (this.queryInput[condition['subConditionQValue']] != null) {
        if (this.queryInput[condition['subConditionQValue']].indexOf(condition['subConditionValue']) >= 0) {
          this.queryInput[condition['model']] = condition['defaultName'];
          return true;
        } else {
          delete this.queryInput[condition['model']];
        }
      } else {
        return false;
      }
    } else {
      return true;
    }
  }

  /**
   * 查询框选择
   */
  searchboxSelect(condition: Object): void {
    let multiple: boolean = condition['query_more'];
    let searchUrl = condition['searchUrl'];

    let params: Object = {
      'title': condition['label'],
      'multiple': multiple,
      'searchUrl': searchUrl
    };
    let modal = this.modalCtrl.create(SearchboxComponent, params);
    modal.onDidDismiss(data => {
      if (data != null) {
        this.queryInput[condition['model'] + 'Name'] = data.name;
        this.queryInput[condition['model']] = data.id;
      }
    });
    modal.present();
  }

  /**
   * 设置日期控件默认值
   */
  setDatetime(condition: Object): void {
    if (this.queryInput[condition['model']] == null || this.queryInput[condition['model']] === '') {
      this.queryInput[condition['model']] = this.utilsService.formatDate(new Date(), condition['format']);
    }
  }

  /**
   * 清空日期控件
   */
  clearDatetime(condition: Object): void {
    this.queryInput[condition['model']] = '';
  }
}
