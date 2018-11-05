import { Component, Input } from '@angular/core';

@Component({
  selector: 'icmp-placeholder',
  templateUrl: 'placeholder.component.html',
  styleUrls: ['/app/component/placeholder/placeholder.component.scss']
})
export class IcmpPlaceholderComponent {

  @Input() placeholder: string = '';
  constructor() { }

}
