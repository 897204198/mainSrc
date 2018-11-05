import { Component } from '@angular/core';
import { Http, Response } from '@angular/http';
import { NavController, ModalController } from 'ionic-angular';
import { UserInfoState, initUserInfo, UserService } from '../../app/services/user.service';
import { ToastService } from '../../app/services/toast.service';
import { PhotoService } from '../../app/services/photo.service';
import { TranslateService } from '@ngx-translate/core';
import { FileTransfer, FileTransferObject, FileUploadOptions } from '@ionic-native/file-transfer';
import { File } from '@ionic-native/file';
import { ConfigsService } from '../../app/services/configs.service';
import { UtilsService } from '../../app/services/utils.service';
import { FileService } from '../../app/services/file.service';

@Component({
  selector: 'page-insta-shot',
  templateUrl: 'instaShot.html',
})
export class InstaShotPage {

  // 国际化文字
  private transateContent: Object;
  // 是否显示遮罩
  private isShowSpinner: boolean = false;
  // 用户信息（用户名、密码、昵称等）
  private userInfo: UserInfoState = initUserInfo;
  // 列表选项
  private initData: Object = {};

  // 院区选项信息，包含 name 和 id
  private hospitalAreaInfo: Array<string> = [];
  // 科室选项信息，包含 name 和 id
  private departmentInfo: Array<string> = [];
  // 当前选择的院区 id
  private hospitalAreaCode: string = '';
  // 当前选择的科室 id
  private departmentCode: string = '';
  // 院区 placeholder
  private hospitalAreaPlaceholder: string = '';

  // 科室缓存数据，如果请求过，不再请求数据
  private cacheDepartment: Object = {};


  // 图片列表
  private photoList: any[] = [];
  // 图片 url 数组
  private photoUrlArray: string[] = [];


  // 最后提交的数据
  private submitInfo: Object = {};


  constructor(
    public navCtrl: NavController,
    private userService: UserService,
    private toastService: ToastService,
    private photoService: PhotoService,
    private modalCtrl: ModalController,
    private configsService: ConfigsService,
    private utilsService: UtilsService,
    private translate: TranslateService,
    private transfer: FileTransfer,
    private fileService: FileService,
    private file: File,
    private http: Http) {
    this.translate.get(['REQUIRE_NOT', 'MAX_PHOTO', 'SUBMIT_SUCCESS']).subscribe((res: Object) => {
      this.transateContent = res;
    });
  }

  ionViewDidLoad() {
    // 获取用户资料，上报人只能是自己不可修改
    this.userInfo = this.userService.getUserInfo();
    this.submitInfo['username'] = this.userInfo.userName;

    this.submitInfo['isAnonymity'] = 'false';
    this.gethospitalArea();
  }

  // 获取院区信息 
  /* 进入页面只执行一次 */
  gethospitalArea() {
    let params = {
      'serviceName': 'hospitalArea'
    };
    this.http.get('/sys/depts', { params: params }).subscribe((res: Response) => {
      let data = res.json();
      // 院区信息 name、id
      this.hospitalAreaInfo = data;
      // 临时的 Array，循环获取所属院区列表数据
      let dataArray: Array<string> = this.getNameInfoFromArray(data);

      // 默认院区是第一个，id相同
      this.hospitalAreaCode = data[0].id;
      this.hospitalAreaPlaceholder = dataArray[0];
      // 所属院区列表数据
      this.initData['hospitalArea'] = dataArray;
      // 获取对应的科室信息，默认第一个
      this.getDepartment(this.hospitalAreaCode);
    }, (res: Response) => {
      this.toastService.show(res.text());
    });
  }

  // 获取科室信息
  getDepartment(areaCode: string) {
    let params: Object = {
      'deptId': areaCode,
      'hospitalAreaCode': areaCode,
      'serviceName': 'department'
    };
    this.http.get('/sys/depts', { params: params }).subscribe((res: Response) => {
      let data = res.json();
      // 所属科室信息缓存
      this.cacheDepartment[areaCode] = data;
      // 科室信息 name、id
      this.departmentInfo = data;
      // 临时的 Array，循环获取所属院区列表数据
      let dataArray: Array<string> = this.getNameInfoFromArray(data);
      // 所属科室列表信息
      this.initData['department'] = dataArray;
    }, (res: Response) => {
      this.toastService.show(res.text());
    });
  }

  // 选择院区
  clickHospitalAreaOption() {
    // 从 已选院区 寻找对应的 院区id
    for (let i = 0; i < this.hospitalAreaInfo.length; i++) {
      if (this.hospitalAreaInfo[i]['name'] === this.submitInfo['hospitalArea']) {
        this.hospitalAreaCode = this.hospitalAreaInfo[i]['id'];
      }
    }
    // 选择院区后清空科室id
    this.departmentCode = '';
    this.submitInfo['department'] = '';
    // 如果 this.cacheDepartment 里存在该院区的科室信息，就直接取，否则进行网络请求
    let cacheDep: Array<any> = this.cacheDepartment[this.hospitalAreaCode];
    if (cacheDep) {
      let dataArray: Array<string> = this.getNameInfoFromArray(cacheDep);
      // 所属科室列表信息
      this.initData['department'] = dataArray;
    } else {
      this.getDepartment(this.hospitalAreaCode);
    }
  }

  // 选择科室
  clickDepartmentOption() {
    // 从 已选科室 寻找对应的 科室id
    for (let i = 0; i < this.departmentInfo.length; i++) {
      if (this.departmentInfo[i]['name'] === this.submitInfo['department']) {
        this.departmentCode = this.departmentInfo[i]['id'];
      }
    }
  }

  // 拍照获取图片
  getPhotoFromCamera() {
    this.photoService.getPictureByCamera({
      destinationType: 1
    }).subscribe(img => {
      let imageInfo: Object = {};
      imageInfo['imageUrl'] = img;
      imageInfo['imageName'] = this.utilsService.formatDate(new Date(), 'YYYYMMDDHHmmss') + '.' + this.fileService.getFileType(img);
      this.photoList.push(imageInfo);
    });
  }

  // 从相册获取图片
  getPhotoFromAlbum() {
    this.photoService.getMultiplePicture({
      destinationType: 1
    }).subscribe(img => {
      // 从数组中取图片
      for (let i = 0; i < img.length; i++) {
        let imageInfo: Object = {};
        imageInfo['imageUrl'] = img[i];
        imageInfo['imageName'] = this.utilsService.formatDate(new Date(), 'YYYYMMDDHHmmss') + i + '.' + this.fileService.getFileType(img[i]);
        this.photoList.push(imageInfo);
      }

    });
  }

  // 侧滑删除图片
  deletePhoto(photo: any) {
    let index = this.photoList.indexOf(photo);
    this.photoList.splice(index, 1);
  }

  // 提交随手拍
  submitInstaShot() {
    // 判断是否填写必填项
    if (this.hospitalAreaCode === '' ||
      this.submitInfo['content'] === undefined) {
      this.toastService.show(this.transateContent['REQUIRE_NOT']);
      return;
    }

    // 没选照片直接上报事件 否则先提交照片，后作为参数一起上传
    if (this.photoList.length === 0) {
      this.infoSubmit();
    } else {
      this.imageUpload();
    }

  }

  // 照片上传
  imageUpload() {
    // 照片超过9个给提示
    if (this.photoList.length > 9) {
      this.toastService.show(this.transateContent['MAX_PHOTO']);
      return;
    }
    // 清空照片 url
    this.photoUrlArray.splice(0, this.photoUrlArray.length);
    // 显示遮罩
    this.isShowSpinner = true;

    /* 图片上传 */
    const fileTransfer: FileTransferObject = this.transfer.create();
    for (let i = 0; i < this.photoList.length; i++) {
      let options: FileUploadOptions = {
        fileKey: 'file',
        fileName: this.photoList[i]['imageName'],
        mimeType: 'multipart/form-data'
      };
      this.transFormApi(fileTransfer, options, i);
    }
  }

  // 转接口
  transFormApi(fileTransfer, options, index) {
    this.http.post('/sys/files', {}).subscribe((res: Response) => {
      let url = res.json().url;
      fileTransfer.upload(this.photoList[index]['imageUrl'], url + this.userInfo.loginName, options)
        .then((data) => {
          // 每传一张图，就往 photoUrlArray 添加一张
          this.photoUrlArray.push(data.response);
          // 判断图片是否已经全部上传完
          if (this.photoUrlArray.length === this.photoList.length) {
            this.submitInfo['images'] = this.photoUrlArray;
            this.isShowSpinner = false;
            this.infoSubmit();
          }
        }, (err) => {

        });
    });
  }

  // 随手拍信息上传
  infoSubmit() {
    /*
     * 上报人、是否匿名、内容、所选院区id、所选科室id
     */
    let params: Object = {
      'username': this.submitInfo['username'],
      'isAnonymity': this.submitInfo['isAnonymity'],
      'content': this.submitInfo['content'],
      'districtId': this.hospitalAreaCode,
      'hospitalAreaCode': this.hospitalAreaCode
    };
    // 非必填项
    if (this.departmentCode) {
      params['deptId'] = this.departmentCode;
      params['departmentCode'] = this.departmentCode;
    }
    if (this.submitInfo['images'] !== undefined) {
      params['images'] = this.submitInfo['images'];
      params['fileId'] = this.submitInfo['images'];
    }

    this.http.post('/business/insta-shot', params).subscribe((res: Response) => {
      if (res.json().errMsg != null) {
        this.toastService.show(res.json().errMsg);
      } else {
        this.toastService.show(this.transateContent['SUBMIT_SUCCESS']);
        this.navCtrl.pop();
      }
    }, (res: Response) => {
      this.toastService.show(res.text());
    });
  }

  // 从数组中取得所有 name 返回新数组
  getNameInfoFromArray(arr: Array<any>): Array<string> {
    let tempArray: Array<string> = [];
    for (let i = 0; i < arr.length; i++) {
      tempArray.push(arr[i].name);
    }
    return tempArray;
  }
}
