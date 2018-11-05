import { Component } from '@angular/core';
import { ToastService } from '../../../app/services/toast.service';
import { Http, Response } from '@angular/http';
import { UserInfoState, UserService } from '../../../app/services/user.service';
import { ConfigsService } from '../../../app/services/configs.service';

/**
 * 个人资料
 */
@Component({
  selector: 'page-user-info',
  templateUrl: 'userInfo.html'
})
export class UserInfoPage {

  // 用户信息
  private userInfo: Object = {};
  public surname: string;
  private localUserInfo: UserInfoState;
  private avatar: string = '';
  // 文件上传/下载地址
  private fileUrl: string = this.configsService.getBaseUrl() + '/file/';
  // token
  private token: string = '?access_token=' + localStorage['token'];

  /**
   * 构造函数
   */
  constructor(private http: Http,
    private toastService: ToastService,
    private configsService: ConfigsService,
    private userService: UserService) { }
  /**
   * 首次进入页面
   */
  ionViewDidLoad(): void {
    this.getUserInfoFromLocal();
    this.getUserInfoFromNet();
  }

  /**
    * 取得用户信息
    */
  getUserInfoFromLocal(): void {
    this.localUserInfo = this.userService.getUserInfo();
    this.surname = this.localUserInfo.userName[0];
    this.userInfo['name'] = this.localUserInfo.userName;
    this.userInfo['phone'] = this.localUserInfo.phone;
    this.userInfo['email'] = this.localUserInfo.email;
    this.userInfo['ascription'] = this.localUserInfo.outter;
    this.userInfo['jobNum'] = this.localUserInfo.jobNumber;
    this.userInfo['sexName'] = this.localUserInfo.sex;
  }

  /**
   * 取得用户信息
   */
  getUserInfoFromNet(): void {
    let params = {
      userId: this.localUserInfo.userId
    };
    this.http.get('/user/info', { params: params }).subscribe((res: Response) => {
      let data = res.json();
      this.userInfo['deptName'] = data.deptName;
      this.userInfo['jobName'] = data.jobName;
      this.userInfo['account'] = data.account;
      this.userInfo['headImageContent'] = data.headImageContent;
      this.userInfo['orgName'] = data.orgName;
      if (data['sex'] != null && data['sex'] !== '') {
        if (data['sex']['code'] === '0') {
          this.userInfo['sexName'] = '男';
        } else {
          this.userInfo['sexName'] = '女';
        }
      }
      if (data.avatar) {
        this.userInfo['avatar'] = `${this.fileUrl}${data.avatar}${this.token}`;
      }
    }, (res: Response) => {
      this.toastService.show(res.text());
    });
  }

  /**
   * 修改头像
   */
  changeAvatar(e: any): void{
    const file = e.target.files[0];
    const params: FormData = new FormData();
    params.append('file', file);
    this.http.post('/file', params).subscribe((res: Response) => {
      this.avatar = res.text();
      this.readFile(file);
      this.submit(this.avatar);
    }, () => {
      this.toastService.show('图片上传失败');
    });
    e.target.value = '';
  }

  /**
   * 读取文件
   */
  readFile(file: any): void {
    const fileReader = new FileReader();
    fileReader.readAsDataURL(file);
    // fileReader.addEventListener('load', () => {
    //   this.userInfo['avatar'] = fileReader.result;
    // });
    fileReader.onload = () => {
      this.userInfo['avatar'] = fileReader.result;
    }
  }

  /**
   * 修改用户信息
   */
  submit(avatar: string) {
    let params: Object = {
      avatar
    };
    this.http.put(`/user/info/${this.localUserInfo.userId}`, params).subscribe((res) => {
      this.toastService.show('头像修改成功');
    }, (res: Response) => {
      this.toastService.show(res.text());
    });
  }

  /**
   * 图片加载出错或无图片显示文字
   */
  resetImg() {
    this.userInfo['avatar'] = '';
  }
}
