import { Injectable } from '@angular/core';
import { ConfigsService } from './configs.service';
import { UserService, UserInfoState } from './user.service';
import { FileTransfer, FileTransferObject } from '@ionic-native/file-transfer';
import { File } from '@ionic-native/file';
import { Platform } from 'ionic-angular';
import { FileOpener } from '@ionic-native/file-opener';
import { LoadingController } from 'ionic-angular';
import { ToastService } from './toast.service';
import { UtilsService } from './utils.service';
import { DeviceInfoState, DeviceService } from './device.service';

/**
 * 文件服务
 */
@Injectable()
export class FileService {

  constructor(private configsService: ConfigsService,
    private userService: UserService,
    private transfer: FileTransfer,
    private fileOpener: FileOpener,
    public loadingCtrl: LoadingController,
    private utilsService: UtilsService,
    private toastService: ToastService,
    private deviceService: DeviceService,
    public platform: Platform,
    private file: File) {
  }

  /**
   * 下载文件
   */
  downloadFile(fileId: string, fileName: string): void {
    // 用户信息
    let userInfo: UserInfoState = this.userService.getUserInfo();
    // 硬件信息
    let deviceInfo: DeviceInfoState = this.deviceService.getDeviceInfo();
    let deviceFirstVersionNumber: number = Number(deviceInfo.deviceVersion.substr(0, 1));

    // 文件类型
    let fileType: string = this.getFileType(fileName);
    // 文件 url
    let fileUrl: string = this.configsService.getBaseUrl() + '/webController/downloadFile?fileId=' + fileId + '&loginName=' + userInfo.loginName + '&password=' + userInfo.password;
    // 本地文件保存位置
    let filePlace: string = this.file.dataDirectory + this.utilsService.formatDate(new Date(), 'YYYYMMDDHHmmss') + '.' + fileType;
    // 安卓版本
    if (deviceInfo.deviceType === 'android' && deviceFirstVersionNumber < 6) {
      filePlace = 'file:///storage/sdcard0/Download/' + this.utilsService.formatDate(new Date(), 'YYYYMMDDHHmmss') + '.' + fileType;
    }
    let loading = this.loadingCtrl.create({
      content: '下载中...'
    });

    loading.present();
    this.platform.ready().then(() => {
      const fileTransfer: FileTransferObject = this.transfer.create();
      fileTransfer.download(fileUrl, filePlace).then((entry) => {
        this.fileOpener.open(entry.nativeURL, this.getFileMimeType(fileType))
          .then(() => {
            loading.dismiss();
          })
          .catch(() => {
            loading.dismiss();
            this.toastService.show('打开失败');
          });
      }, (error) => {
        loading.dismiss();
        this.toastService.show('下载失败');
      });

      // 进度
      fileTransfer.onProgress(progressEvent => {
        if (progressEvent.lengthComputable) {
          console.log(progressEvent.loaded / progressEvent.total);
        } else {

        }
      });
    });
  }

  /**
   * 取得文件类型
   */
  getFileType(fileName: string): string {
    return fileName.substring(fileName.lastIndexOf('.') + 1, fileName.length).toLowerCase();
  }

  /**
   * 取得文件 MIME Type
   * 对应 fileTypeImage.component 的顺序列举了常见的类型
   * defaultType 不一定可用
   */
  getFileMimeType(fileType: string): string {
    let mimeType: string = '';

    switch (fileType) {
      case 'txt':
        mimeType = 'text/plain';
        break;
      case 'docx':
        mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
        break;
      case 'doc':
        mimeType = 'application/msword';
        break;
      case 'pptx':
        mimeType = 'application/vnd.openxmlformats-officedocument.presentationml.presentation';
        break;
      case 'ppt':
        mimeType = 'application/vnd.ms-powerpoint';
        break;
      case 'xlsx':
        mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
        break;
      case 'xls':
        mimeType = 'application/vnd.ms-excel';
        break;
      case 'zip':
        mimeType = 'application/x-zip-compressed';
        break;
      case 'rar':
        mimeType = 'application/octet-stream';
        break;
      case 'pdf':
        mimeType = 'application/pdf';
        break;
      case 'jpg':
        mimeType = 'image/jpeg';
        break;
      case 'png':
        mimeType = 'image/png';
        break;
      default:
        mimeType = 'application/' + fileType;
        break;
    }
    return mimeType;
  }

}
