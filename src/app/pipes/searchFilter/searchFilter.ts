import { Pipe } from '@angular/core';

/**
 * 查询过滤管道
 */
@Pipe({
  name: 'searchFilter',
})
export class SearchFilterPipe {

  /**
   * 查询过滤
   */
  transform(list: any[], filterField: string, keyword: string) {
    if (!filterField || !keyword) {
      return list;
    }
    return list.filter(item => {
      let fieldValue = item[filterField];
      return fieldValue.indexOf(keyword) >= 0;
    });
  }
}
