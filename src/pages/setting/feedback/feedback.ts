import { Component, ElementRef, DoCheck, ViewChild, NgZone } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Content, ActionSheetController, ModalController } from 'ionic-angular';
import 'rxjs/Rx';
import { Observable } from 'rxjs/Observable';
import { FileTransfer, FileTransferObject, FileUploadOptions } from '@ionic-native/file-transfer';
import { AppVersion } from '@ionic-native/app-version';
import { ImagePreviewPage } from './imagePreview';
import { ToastService } from '../../../app/services/toast.service';
import { ConfigsService } from '../../../app/services/configs.service';
import { PhotoService } from '../../../app/services/photo.service';
import { FileService } from '../../../app/services/file.service';
import { UtilsService } from '../../../app/services/utils.service';


@Component({
  selector: 'page-feedback',
  templateUrl: 'feedback.html'
})
export class FeedbackPage implements DoCheck {

  @ViewChild(Content) content: Content;
  feedbacks: Object[] = [];
  inputOpinion: string = '';
  spinnerShow: boolean = false;
  loadShow: boolean = false;
  inputOpinionOld: string = '';
  countBack: number = 1;
  // 文件上传/下载地址
  fileUrl: string = this.configsService.getBaseUrl() + '/file/';
  // token
  token: string = '?access_token=' + localStorage['token'];

  constructor(
    private http: Http,
    private zone: NgZone,
    private toastService: ToastService,
    private configsService: ConfigsService,
    private el: ElementRef,
    private photoService: PhotoService,
    private fileService: FileService,
    private utilsService: UtilsService,
    private transfer: FileTransfer,
    private appVersion: AppVersion,
    private modalCtrl: ModalController,
    private actionSheetCtrl: ActionSheetController) { }

  ionViewDidEnter() {
    let feedbackInput = this.el.nativeElement.querySelector('.feedback-textarea');
    Observable.fromEvent(feedbackInput, 'focus').subscribe(() => {
      setTimeout(() => {
        this.content.scrollToBottom(0);
      }, 700);
    });
    this.getFeedbackList();
  }

  ngDoCheck() {
    if (this.inputOpinion !== this.inputOpinionOld) {
      this.setFooterHeigth();
      this.inputOpinionOld = this.inputOpinion;
    }
  }

  // 取得意见反馈列表
  getFeedbackList() {
    this.feedbacks = [];
    this.loadShow = true;
    this.http.get('/user/feedback').subscribe((res: Response) => {
      this.feedbacks = res.json();
      setTimeout(() => {
        this.content.scrollToBottom(0);
      }, 200);
      this.loadShow = false;
    }, (res: Response) => {
      this.loadShow = false;
      this.toastService.show(res.text());
    });
  }

  // 设置底部高度
  setFooterHeigth() {
    let opinionInput = this.el.nativeElement.querySelector('textarea');
    let count: number = parseInt(String(1 + (opinionInput.scrollHeight - 38) / 18), 10);
    if (count <= 3) {
      opinionInput.style.height = (38 + 18 * (count - 1)) + 'px';
      setTimeout(() => {
        this.content.resize();
      }, 200);
    }
    if (count !== this.countBack) {
      setTimeout(() => {
        this.content.scrollToBottom(0);
      }, 200);
      this.countBack = count;
    }
  }

  // 提交反馈意见
  submitOpinion(pictureId?: string) {
    this.spinnerShow = true;
    this.appVersion.getVersionNumber().then((versionNumber: string) => {
      (<any>window).ProperDevice.getDeviceInfo('', (info) => {
        this.zone.run(() => {
          let params: Object = {
            opinion: this.inputOpinion,
            pictureId: pictureId,
            appVersion: versionNumber,
            mobileModel: info.mobileModel,
            netType: info.netType,
            platform: info.platform
          };
          if (pictureId) {
            delete params['opinion'];
          }
          this.http.post('/user/feedback', params).subscribe((res: Response) => {
            this.getFeedbackList();
            if (!pictureId) {
              this.inputOpinion = '';
            }
            this.spinnerShow = false;
            setTimeout(() => {
              this.content.scrollToBottom(0);
            }, 200);
          }, (res: Response) => {
            this.spinnerShow = false;
            this.toastService.show(res.text());
          });
        });
      }, (err) => {
        this.toastService.show('获取信息失败');
      });
    });
  }

  // 关闭遮蔽罩
  refresherInterrupt() {
    this.spinnerShow = false;
  }

  // 选择图片
  chooseImage() {
    const actionSheet = this.actionSheetCtrl.create({
      title: '选择图片',
      buttons: [
        {
          text: '拍照',
          handler: () => {
            this.photoService.getPictureByCamera().subscribe(img => {
              this.fileUpload(img);
            });
          }
        }, {
          text: '从手机相册选择',
          handler: () => {
            this.photoService.getPictureByPhotoLibrary().subscribe(img => {
              this.fileUpload(img);
            });
          }
        }, {
          text: '取消',
          role: 'cancel'
        }
      ]
    });
    actionSheet.present();
  }

  // 图片上传
  fileUpload(img: string) {
    this.spinnerShow = true;
    const fileTransfer: FileTransferObject = this.transfer.create();
    let options: FileUploadOptions = {
      fileKey: 'file',
      mimeType: 'multipart/form-data',
      headers: { 'X-PEP-TOKEN': 'Bearer ' + localStorage['token'] }
    };

    fileTransfer.upload(img, this.fileUrl, options).then((data) => {
      this.spinnerShow = false;
      this.submitOpinion(data.response);
    }, (res) => {
      this.spinnerShow = false;
    });
  }

  tapImage(pictureId: string) {
    let pictureUrl = this.fileUrl + pictureId + this.token;
    let profileModal = this.modalCtrl.create(ImagePreviewPage, { pictureUrl: pictureUrl });
    profileModal.present();
  }
}
