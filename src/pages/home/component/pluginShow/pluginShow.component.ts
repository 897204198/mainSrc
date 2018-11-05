import { Component, ElementRef, OnInit } from '@angular/core';
import {NavController} from 'ionic-angular';
import { ApplicationPage } from '../../../application/application';

@Component({
  selector: 'icmp-plugin-show',
  templateUrl: 'pluginShow.component.html'
})
export class PluginShowComponent implements OnInit {

  pet: string = 'item1';

  /**
   * 构造函数
   */
  constructor(public navCtrl: NavController, private el: ElementRef) {}

  ngOnInit(): void {
    let plugin = this.el.nativeElement.querySelector('#plugin-proxy');
    plugin.className = 'segment segment-md';
  }

  doHandle(): void {
    this.navCtrl.push(ApplicationPage);
  }
}
