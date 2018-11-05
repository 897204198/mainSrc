import { Component } from '@angular/core';
import { NavParams, NavController, AlertController, Alert, ModalController } from 'ionic-angular';
import { Http, Response } from '@angular/http';
import { ToastService } from '../../../app/services/toast.service';
import { UtilsService } from '../../../app/services/utils.service';
import { TranslateService } from '@ngx-translate/core';
import { SearchboxComponent } from '../../../app/component/searchbox/searchbox.component';
import { FileChooser } from '@ionic-native/file-chooser';
import { FilePath } from '@ionic-native/file-path';
import { DeviceService } from '../../../app/services/device.service';
import { FileTransferObject, FileTransfer, FileUploadOptions } from '@ionic-native/file-transfer';
import { UserService } from '../../../app/services/user.service';
import { ConfigsService } from '../../../app/services/configs.service';

/**
 * 待办审批页面
 */
@Component({
  selector: 'page-todo-opinion',
  templateUrl: 'todoOpinion.html'
})
export class TodoOpinionPage {

  // 审批意见选项
  private opinionList: Object[];
  // 审批意见其他填写项目
  private opinionOtherList: Object[];
  // 审批协办
  private opinionHelpList: Object[];
  // 审批协办其他填写项目
  private opinionHelpOtherList: Object[];
  // 是否显示内容
  private addListShow: boolean;
  // 是否显示添加按钮
  private addBtnShow: boolean;
  // 审批协办默认值
  private opinionDefaultValue: any;
  // 控制项目是否显示
  private controls: Object = {};
  // 审批意见内容
  private approvalInput: Object = {};
  // 审批意见内容temp
  private approvalInputTemp: Object = {};
  // 审批意见内容temps
  private approvalInputTemps: Object = {};
  // 是否隐藏审批内容
  private hideComment: boolean = false;
  // 弹出框对象
  private confirmAlert: Alert;
  // 弹出框是否打开
  private alertOpen: boolean = false;
  // 国际化文字
  private transateContent: Object;
  // textarea
  private opinionTextare: Object;
  // 文件列表
  private opinionFilesList: Object[] = [];
  deviceType: string = '';
  fileIndex: number = 0;
  fileReIndex: number = 0;

  /**
   * 构造函数
   */
  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    public alertCtrl: AlertController,
    private fileChooser: FileChooser,
    private filePath: FilePath,
    private transfer: FileTransfer,
    private deviceService: DeviceService,
    private userService: UserService,
    private configsService: ConfigsService,
    private http: Http,
    private toastService: ToastService,
    private utilsService: UtilsService,
    private translate: TranslateService,
    private modalCtrl: ModalController) {
    let translateKeys: string[] = ['VALI_REQUIRED', 'PROMPT_INFO', 'CANCEL', 'CONFIRM', 'SUBMIT_OPINION_CONFIRM', 'SUBMIT_SUCCESS', 'SUBMIT_ERROR', 'REQUIRE_NOT'];
    this.translate.get(translateKeys).subscribe((res: Object) => {
      this.transateContent = res;
    });
  }

  /**
   * 首次次进入页面
   */
  ionViewDidLoad(): void {
    this.deviceType = this.deviceService.getDeviceInfo().deviceType;
    this.hideComment = this.navParams.get('hideComment');
    if (this.navParams.get('commentDefault') != null) {
      this.approvalInput['comments'] = this.navParams.get('commentDefault');
    }
    this.setApprovalItems();
  }

  /**
   * 离开页面
   */
  ionViewWillLeave(): void {
    if (this.alertOpen) {
      this.confirmAlert.dismiss();
    }
    this.clearFile();
  }

  /**
   * 设置页面表单项
   */
  setApprovalItems(): void {
    let approvals: any[] = this.navParams.get('approvals');
    if (approvals[0] != null && approvals[0].length > 0) {
      this.opinionList = approvals[0];
      for (let i = 0; i < this.opinionList.length; i++) {
        this.controls[this.opinionList[i]['value']] = this.opinionList[i]['controlModel'];
      }
      this.approvalInput['opinions'] = approvals[0][0]['value'];
    } else {
      this.opinionList = [];
    }

    if (approvals[1] != null && approvals[1].length > 0) {
      this.opinionOtherList = approvals[1];
      for (let i = 0; i < this.opinionOtherList.length; i++) {
        let item = this.opinionOtherList[i];
        if (item['default'] != null && item['default'] !== '') {
          this.approvalInput[item['type']] = item['default'];
          if (item['type'] === 'searchbox') {
            this.approvalInput[item['model'] + '_name'] = item['defaultName'];
          }
        }
        if (item['format'] != null && item['format'] !== '') {
          item['format'] = item['format'].replace(new RegExp('y', 'gm'), 'Y').replace(new RegExp('d', 'gm'), 'D');
        }
      }
    } else {
      this.opinionOtherList = [];
    }
    if (approvals[2] != null && approvals[2].length > 0) {
      this.opinionHelpList = approvals[2];
      for (let i = 0; i < this.opinionHelpList.length; i++) {
        if (this.opinionHelpList[i]['control_name'] != null) {
          this.controls[this.opinionHelpList[i]['value']] = this.opinionHelpList[i]['control_name'];
        }
        if (this.opinionHelpList[i]['type'] === 'file') {
          this.opinionFilesList.push(this.opinionHelpList[i]);
        }
        if (this.opinionHelpList[i]['type'] === 'textarea') {
          this.opinionTextare = this.opinionHelpList[i];
        }
        if (this.opinionHelpList[i]['default'] != null) {
          this.approvalInput[this.opinionHelpList[i]['name']] = this.opinionHelpList[i]['default'];
        }
      }
      for (let i = 0; i < this.opinionHelpList.length; i++) {
        if (this.opinionHelpList[i]['type'] === 'file') {
          this.opinionHelpList.splice(i, 1);
        }
      }
      for (let i = 0; i < this.opinionHelpList.length; i++) {
        if (this.opinionHelpList[i]['type'] === 'textarea') {
          this.opinionHelpList.splice(i, 1);
        }
      }
      if (approvals[2][0]['defalut_value'] != null) {
        this.approvalInput['opinions'] = approvals[2][0]['defalut_value'];
        this.opinionDefaultValue = approvals[2][0]['defalut_value'];
      }
      this.addListShow = false;
      this.addBtnShow = false;
    } else {
      this.opinionHelpList = [];
    }
    if (approvals[3] != null && approvals[3].length > 0) {
      this.opinionHelpOtherList = approvals[3];
      this.approvalInputTemps['joinOpinions'] = [];
      this.approvalInputTemps['joinOpinions'][0] = {};
      this.approvalInputTemps['selectGroup'] = [];
      this.approvalInputTemps['selectGroup'][0] = {};
      for (let i = 0; i < this.opinionHelpOtherList.length; i++) {
        let item = this.opinionHelpOtherList[i];
        if (item['control_default'] != null && item['control_default'] !== '') {
          this.approvalInput[item['control_name']] = item['control_default'];
          if (item['control_type'] === 'select_searchbox') {
            this.approvalInput[item['control_name'] + '_name'] = item['control_default_name'];
          }
        }
        if (item['control_formatter'] != null && item['control_formatter'] !== '') {
          item['control_formatter'] = item['control_formatter'].replace(new RegExp('y', 'gm'), 'Y').replace(new RegExp('d', 'gm'), 'D');
        }
      }
    } else {
      this.opinionHelpOtherList = [];
    }
  }

  /**
   * 提交审批意见
   */
  submitOpinion(): void {
    this.confirmAlert = this.alertCtrl.create({
      title: this.transateContent['PROMPT_INFO'],
      message: this.transateContent['SUBMIT_OPINION_CONFIRM'],
      buttons: [
        {
          text: this.transateContent['CANCEL'],
          handler: () => {
            this.alertOpen = false;
          }
        },
        {
          text: this.transateContent['CONFIRM'],
          handler: () => {
            this.alertOpen = false;
            this.submitOpinionHttp();
          }
        }
      ]
    });
    this.confirmAlert.present();
    this.alertOpen = true;
  }

  /**
   * 提交验证
   */
  submitValidate(): boolean {
    if (this.controls[this.approvalInput['opinions']] != null && this.controls[this.approvalInput['opinions']].length > 0) {
      for (let i = 0; i < this.controls[this.approvalInput['opinions']].length; i++) {
        let requireControl = this.controls[this.approvalInput['opinions']][i];
        let opinionItem = {};
        for (let j = 0; j < this.opinionOtherList.length; j++) {
          if (requireControl === this.opinionOtherList[j]['model']) {
            opinionItem = this.opinionOtherList[j];
          }
        }
        if (opinionItem['validator'] != null) {
          for (let j = 0; j < opinionItem['validator'].length; j++) {
            if (opinionItem['validator'][j]['type'] === 'required' && (this.approvalInput[requireControl] == null || this.approvalInput[requireControl] === '')) {
              this.toastService.show(this.transateContent['VALI_REQUIRED']);
              return false;
            }
          }
        }

      }
      for (let i = 0; i < this.opinionOtherList.length; i++) {
        let item = this.opinionOtherList[i];
        if (item['status'] === 'display' && item['validator'] != null) {
          for (let j = 0; j < item['validator'].length; j++) {
            if (item['validator'][j]['type'] === 'required' && (this.approvalInput[item['controlModel']] == null || this.approvalInput[item['controlModel']] === '')) {
              this.toastService.show(this.transateContent['VALI_REQUIRED']);
              return false;
            }
          }
        }
      }
    }
    return true;
  }

  /**
   * 提交审批意见请求
   */
  submitOpinionHttp(): void {
    if (this.submitValidate()) {
      let submitUtl: string = this.navParams.get('submitUtl');
      let params: Object = {
        'id': this.navParams.get('id'),
        'stepCode': this.navParams.get('stepCode'),
        'processName': this.navParams.get('processName'),
        'taskId': this.navParams.get('id'),
        'step': this.navParams.get('stepCode')
      };
      for (let key in this.approvalInput) {
        if (this.approvalInput.hasOwnProperty(key)) {
          params[key] = this.approvalInput[key];
        }
      }
      params['opinion'] = params['opinions'];
      this.http.post(submitUtl, params).subscribe((res: Response) => {
        this.toastService.show(this.transateContent['SUBMIT_SUCCESS']);
        this.navCtrl.popToRoot();
      }, (res: Response) => {
        this.toastService.show(res.text());
      });
    }
  }

  /**
   * 查询框选择
   */
  searchboxSelect(item: Object): void {
    let multiple: boolean = item['control_more'];
    let searchUrl = item['searchUrl'];

    let params: Object = { 'title': item['label'], 'multiple': multiple, 'searchUrl': searchUrl };
    let modal = this.modalCtrl.create(SearchboxComponent, params);
    modal.onDidDismiss(data => {
      if (data != null) {
        this.approvalInput[item['model'] + '_name'] = data.name;
        this.approvalInput[item['model']] = data.id;
      }
    });
    modal.present();
  }

  /**
   * 查询框选择
   */
  helpSearchboxSelect(item: Object, iList: number): void {
    let multiple: boolean = item['control_more'];
    let searchUrl = item['search_url'];
    if (item['control_type'] === 'select_person') {
      searchUrl = '/webController/searchPerson';
    }
    let params: Object = { 'title': item['control_label'], 'multiple': multiple, 'searchUrl': searchUrl };
    let modal = this.modalCtrl.create(SearchboxComponent, params);
    modal.onDidDismiss(data => {
      if (data != null) {
        this.approvalInputTemps['joinOpinions'][iList]['name'] = data.name;
        this.approvalInputTemps['joinOpinions'][iList]['id'] = data.id;
      }
    });
    modal.present();
  }

  /**
   * 是否显示表单项目
   */
  isDisplayFormItem(item: Object): boolean {
    if (item['type'] === 'hidden') {
      return false;
    }
    if (this.controls[this.approvalInput['opinions']] != null) {
      if (this.controls[this.approvalInput['opinions']].indexOf(item['model']) >= 0) {
        return true;
      }
    }
    if (item['status'] === 'display') {
      return true;
    }
    return false;
  }

  /**
   * 设置日期控件默认值
   */
  setDatetime(item: Object): void {
    if (this.approvalInput[item['controlModel']] == null || this.approvalInput[item['controlModel']] === '') {
      this.approvalInput[item['controlModel']] = this.utilsService.formatDate(new Date(), item['format']);
    }
  }

  /**
   * 清空日期控件
   */
  clearDatetime(item: Object): void {
    this.approvalInput[item['controlModel']] = '';
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
   * 意见改变
   */
  opinionChange(): void {
    for (let i = 0; i < this.opinionOtherList.length; i++) {
      delete this.opinionOtherList[i]['status'];
      let item = this.opinionOtherList[i];
      this.approvalInput[item['controlModel']] = item['default'];
      if (item['type'] === 'searchbox') {
        this.approvalInput[item['controlModel'] + '_name'] = item['defaultName'];
      }
    }
  }

  /**
   * 是否转交他人办理意见改变
   */
  opinionModelChange(item: any): void {
    this.approvalInput = { 'opinions': item };
    for (let i = 0; i < this.opinionHelpList.length; i++) {
      if (this.opinionHelpList[i]['value'] === parseInt(item, 10)) {
        for (let j = 0; j < this.opinionHelpList[i]['control_name'].length; j++) {
          this.approvalInput[this.opinionHelpList[i]['control_name'][j]] = this.approvalInputTemps[this.opinionHelpList[i]['control_name'][j]];
        }
        if (this.opinionHelpList[i]['showTextarea'] === '1') {
          this.addListShow = false;
        } else {
          this.addListShow = true;
        }
        if (this.opinionHelpList[i]['showAddBtn'] === '1') {
          this.addBtnShow = true;
        } else {
          this.addBtnShow = false;
        }
      }
    }
    this.opinionTextare['showTextarea'] = '1';
  }

  /**
   * 设置控制事件
   */
  setControl(item: Object, option: Object) {
    if (option['controls'] != null) {
      for (let j = 0; j < option['controls'].length; j++) {
        let control = option['controls'][j];
        if (control['type'] === 'display') {
          if (this.approvalInput[item['controlModel']] != null && this.approvalInput[item['controlModel']].indexOf(option['id']) >= 0) {
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
          if (this.approvalInputTemps['selectGroup'][item['control_number']][item['control_name']] != null && this.approvalInputTemps['selectGroup'][item['control_number']][item['control_name']].indexOf(option['id']) >= 0) {
            flg = true;
          }
          if (flg) {
            let url = control['url'];
            let params: URLSearchParams = new URLSearchParams();
            params.append('serviceName', this.navParams.get('serviceName'));
            params.append('id', this.approvalInputTemps['selectGroup'][item['control_number']][item['control_name']]);
            this.http.post(url, params).subscribe((res: Response) => {
              let data = res.json().result_list;
              for (let k = 0; k < this.opinionHelpOtherList.length; k++) {
                if (this.opinionHelpOtherList[k]['control_data'] != null) {
                  for (let p = 0; p < this.opinionHelpOtherList[k]['control_data'].length; p++) {
                    if (this.opinionHelpOtherList[k]['control_data'][p]['control_name'] === control['model']) {
                      this.opinionHelpOtherList[k]['control_data'][p]['control_list'] = data;
                      break;
                    }
                  }
                }
              }
            }, (res: Response) => {
              this.toastService.show(res.text());
            });
          }
        }
      }
    }
  }

  /**
   * 设置表单控件状态
   */
  setInputStatus(model: string, status: string): void {
    for (let i = 0; i < this.opinionOtherList.length; i++) {
      if (this.opinionOtherList[i]['controlModel'] === model) {
        this.opinionOtherList[i]['status'] = status;
        if (status === 'hidden') {
          this.approvalInput[model] = null;
          if (this.opinionOtherList[i]['type'] === 'searchbox') {
            this.approvalInput[model + '_name'] = null;
          }
        }
        break;
      }
    }
  }

  /**
   * 嵌套表格添加行
   */
  addListRow(item: Object): void {
    let listItemArray = [...this.opinionHelpOtherList];
    let flag = false;
    let index: number;
    for (let i = 0; i < listItemArray.length; i++) {
      if (listItemArray[i]['control_data'] != null) {
        flag = true;
        index = i;
        break;
      }
    }
    if (flag) {
      let listItem = {};
      let hash = {};
      let tempArray = listItemArray[index]['control_data'];
      tempArray = tempArray.reduce((ite, next) => {
        if (hash[next.control_model] == null) {
          hash[next.control_model] = true && ite.push(next);
        }
        return ite;
      }, []);
      let controlNumber = listItemArray[index]['control_data'][listItemArray[index]['control_data'].length - 1]['control_number'];
      let paramsArray = [...tempArray].splice(0, 2);
      for (let i = 0; i < paramsArray.length; i++) {
        listItem[paramsArray[i]['control_name']] = null;
      }
      for (let i = 0; i < tempArray.length; i++) {
        let itemjson = { ...tempArray[i] };
        itemjson['control_number'] = controlNumber + 1;
        this.opinionHelpOtherList[index]['control_data'].push(itemjson);
      }
      this.approvalInputTemps['selectGroup'].push(listItem);
    } else {
      listItemArray.push(this.opinionHelpOtherList[0]);
      this.approvalInputTemps['joinOpinions'].push({
        'name': '',
        'comments': '',
        'id': ''
      });
      this.opinionHelpOtherList = [...listItemArray];
    }
  }

  /**
   * 嵌套表格删除行
   */
  deleteListRow(item: Object, iList: number, type?: string): void {
    if (type != null && type === 'control') {
      let listItemTemp = [...this.opinionHelpOtherList];
      let index: number;
      let startIndex: number;
      let delNumber: number = 0;
      for (let i = 0; i < this.opinionHelpOtherList.length; i++) {
        if (this.opinionHelpOtherList[i]['control_data'] != null) {
          index = i;
          for (let j = 0; j < this.opinionHelpOtherList[i]['control_data'].length; j++) {
            if (this.opinionHelpOtherList[i]['control_data'][j]['control_number'] === iList) {
              startIndex = j;
              delNumber++;
            }
          }
        }
      }
      listItemTemp[index]['control_data'].splice(startIndex - delNumber + 1, delNumber);
      let listItemTempArray = [];
      for (let i = 0; i < listItemTemp[index]['control_data'].length; i++) {
        let itemjson = { ...listItemTemp[index]['control_data'][i] };
        if (i >= (startIndex - delNumber + 1)) {
          itemjson['control_number'] = itemjson['control_number'] - 1;
        }
        listItemTempArray.push(itemjson);
      }
      this.approvalInputTemps['selectGroup'].splice(iList, 1);
      this.opinionHelpOtherList[index]['control_data'] = listItemTempArray;
    } else {
      this.approvalInputTemps['joinOpinions'].splice(iList, 1);
      this.opinionHelpOtherList.splice(iList, 1);
    }
  }

  /**
   * 选择附件
   */
  fileChoose(item: Object): void {
    this.fileChooser.open().then((uri) => {
      this.fileIndex++;
      this.filePath.resolveNativePath(uri).then((filePath) => {
        let file: Object = {
          name: filePath.substr(filePath.lastIndexOf('/') + 1)
        };
        if (this.approvalInputTemp[item['model']] == null) {
          this.approvalInputTemp[item['model']] = [file];
        } else {
          this.approvalInputTemp[item['model']].push(file);
        }
        this.uploadFile(filePath, item, file);
      }, () => {
        this.toastService.show(this.transateContent['FILE_UPLOAD_ERROR']);
        this.fileReIndex++;
      });
    });
  }

  /**
   * 上传文件
   */
  uploadFile(filePath: string, item: Object, file: Object): void {
    const fileTransfer: FileTransferObject = this.transfer.create();
    let options: FileUploadOptions = {
      fileKey: 'file',
      fileName: filePath.substr(filePath.lastIndexOf('/') + 1),
      mimeType: 'multipart/form-data'
    };
    let userInfo = this.userService.getUserInfo();
    fileTransfer.upload(filePath, this.configsService.getBaseUrl() + '/webController/uploadFile?loginName=' + userInfo.loginName, options).then((data) => {
      if (this.approvalInput[item['model']] == null) {
        this.approvalInput[item['model']] = [data.response];
      } else {
        this.approvalInput[item['model']].push(data.response);
      }
      this.fileReIndex++;
      file['id'] = data.response;
    }, () => {
      this.toastService.show(this.transateContent['FILE_GET_ERROR']);
      this.deleteFile(item, file);
      this.fileReIndex++;
    });
  }

  /**
   * 删除文件
   */
  deleteFile(item: Object, file: Object): void {
    if (file['id'] != null && file['id'] !== '') {
      let params: URLSearchParams = new URLSearchParams();
      params.append('fileId', file['id']);
      this.http.post('/webController/deleteFile', params).subscribe((res: Response) => { });
      if (this.approvalInput[item['model']] != null) {
        for (let i = 0; i < this.approvalInput[item['model']].length; i++) {
          if (this.approvalInput[item['model']][i] === file['id']) {
            this.approvalInput[item['model']].splice(i, 1);
            break;
          }
        }
      }
    }
    for (let i = 0; this.approvalInputTemp[item['model']].length; i++) {
      if (file === this.approvalInputTemp[item['model']][i]) {
        this.approvalInputTemp[item['model']].splice(i, 1);
        break;
      }
    }
  }

  /**
   * 清空未提交的附件
   */
  clearFile(): void {
    for (let i = 0; i < this.opinionFilesList.length; i++) {
      let item = this.opinionFilesList[i];
      if (item['type'] === 'file' && this.approvalInput[item['model']] != null && this.approvalInput[item['model']].length > 0) {
        let params: URLSearchParams = new URLSearchParams();
        params.append('fileId', this.approvalInput[item['model']].join(','));
        this.http.post('/webController/deleteFile', params).subscribe((res: Response) => { });
      }
    }
  }
}
