import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { Http, Response } from '@angular/http';
import { ToastService } from '../../../app/services/toast.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'page-create-group',
  templateUrl: 'createGroup.html',
})
export class CreateGroupPage {

  // 群组名
  private groupName: string = '';
  // 国际化文字
  private transateContent: Object;

  isSumbit: boolean = false;

  /**
   * 构造函数
   */
  constructor(private navCtrl: NavController,
    private toastService: ToastService,
    private http: Http,
    private translate: TranslateService) {
    this.translate.get(['INPUT_GROUP_NAME', 'CREATE_SUCCESS']).subscribe((res: Object) => {
      this.transateContent = res;
    });
  }

  /**
   * 新建群组
   */
  createGroup() {
    if (this.groupName.length === 0) {
      this.toastService.show(this.transateContent['INPUT_GROUP_NAME']);
      return;
    } else {
      this.isSumbit = true;
    }

    let params = {
      'groupName': this.groupName
    };
    this.http.post('/im/groups', params).subscribe((res: Response) => {
      this.toastService.show(this.transateContent['CREATE_SUCCESS']);
      this.navCtrl.pop();
    }, (res: Response) => {
      this.isSumbit = false;
      this.toastService.show(res.text());
    });
  }
}
