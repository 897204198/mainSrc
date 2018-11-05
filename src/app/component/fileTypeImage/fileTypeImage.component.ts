import { Component, Input } from '@angular/core';

/**
 * 附件类型图片组件
 */
@Component({
  selector: 'icmp-file-type-image',
  templateUrl: 'fileTypeImage.component.html'
})
export class FileTypeImageComponent {

  // 文件类型
  @Input() fileType: string = '';

  constructor() {}
}
