import { Component } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { NavParams, NavController } from 'ionic-angular';

@Component({
  selector: 'page-email',
  templateUrl: 'email.html'
})
export class EmailPage {

  myURL: SafeUrl = '';
  token: string = localStorage.getItem('token');

  constructor(private sanitizer: DomSanitizer, public navParams: NavParams, private navCtrl: NavController) {
    let dangerousVideoUrl = this.navParams.data.data.url;
    this.myURL = this.sanitizer.bypassSecurityTrustResourceUrl(dangerousVideoUrl);
    window.addEventListener('message', event => {
      if (event.data === 'popPage') {
        this.navCtrl.pop();
      }
    });
  }
}
