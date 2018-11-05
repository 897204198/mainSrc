/**
 * Created by Lym on 2017.8.18.
 */
import { Injectable } from '@angular/core';
import { Camera, CameraOptions } from '@ionic-native/camera';
import { ImagePicker } from '@ionic-native/image-picker';
import { Observable } from 'rxjs/Observable';
import { ToastService } from './toast.service';
import { TranslateService } from '@ngx-translate/core';

export const IMAGE_SIZE = 500; // 拍照/从相册选择照片压缩大小
export const QUALITY_SIZE = 94; // 图像压缩质量，范围为0 - 100
@Injectable()
export class PhotoService {

  // 国际化文字
  private transateContent: Object;

  constructor(
    private camera: Camera,
    private imagePicker: ImagePicker,
    private toastService: ToastService,
    private translate: TranslateService) {
    this.translate.get(['NO_JURISDICTION', 'FAIL_PHOTO']).subscribe((res: Object) => {
      this.transateContent = res;
    });
  }

  /**
   * 通过拍照获取照片
   */
  getPictureByCamera(options: CameraOptions = {}): Observable<string> {
    let ops: CameraOptions = Object.assign({
      sourceType: this.camera.PictureSourceType.CAMERA,
      destinationType: this.camera.DestinationType.FILE_URI
    }, options);
    return this.getPicture(ops);
  };


  /**
   * 通过图库选择 单张
   */
  getPictureByPhotoLibrary(options: CameraOptions = {}): Observable<string> {
    let ops: CameraOptions = Object.assign({
      sourceType: this.camera.PictureSourceType.PHOTOLIBRARY,
      destinationType: this.camera.DestinationType.FILE_URI
    }, options);
    return this.getPicture(ops);
  };


  /**
   * 通过图库选择 多张
   */
  getMultiplePicture(options = {}): Observable<any> {
    let ops = Object.assign({
      maximumImagesCount: 6,
      width: IMAGE_SIZE,        // 缩放图像的宽度（像素）
      height: IMAGE_SIZE,       // 缩放图像的高度（像素）
      quality: QUALITY_SIZE     // 图像质量，范围为0 - 100
    }, options);
    return Observable.create(observer => {
      this.imagePicker.getPictures(ops).then(files => {
        let destinationType = options['destinationType'] || 0;
        if (destinationType === 1) {
          observer.next(files);
        } else {
          let imgArray = [];  // 图片数组
          for (let file of files) {
            imgArray.push(file);
          }
          observer.next(imgArray);
        }
      }).catch(err => {
        this.toastService.show(this.transateContent['FAIL_PHOTO']);
      });
    });
  };


  /**
   * 图片获取总的方法，不管是拍照还是相册，都调用他
   * @param options 图片配置参数
   */
  getPicture(options: CameraOptions = {}): Observable<string> {
    let ops: CameraOptions = Object.assign({
      sourceType: this.camera.PictureSourceType.CAMERA,      // 图片来源,CAMERA:拍照,PHOTOLIBRARY:相册
      destinationType: this.camera.DestinationType.FILE_URI, // 默认返回base64字符串,DATA_URL:base64   FILE_URI:图片路径
      quality: QUALITY_SIZE,     // 图像质量，范围为0 - 100
      allowEdit: false,          // 选择图片前是否允许编辑
      encodingType: this.camera.EncodingType.JPEG,
      targetWidth: IMAGE_SIZE,   // 缩放图像的宽度（像素）
      targetHeight: IMAGE_SIZE,  // 缩放图像的高度（像素）
      saveToPhotoAlbum: false,   // 是否保存到相册
      correctOrientation: true   // 设置摄像机拍摄的图像是否为正确的方向
    }, options);
    return Observable.create(observer => {
      this.camera.getPicture(ops).then((imgData: string) => {
        if (ops.destinationType === this.camera.DestinationType.DATA_URL) {
          observer.next(imgData);
        } else {
          observer.next(imgData);
        }
      }).catch(err => {
        if (err === 20) {
          this.toastService.show(this.transateContent['NO_JURISDICTION']);
          return;
        }
        if (String(err).indexOf('cancel') !== -1) {
          return;
        }
        this.toastService.show(this.transateContent['FAIL_PHOTO']);
      });
    });
  };



}
