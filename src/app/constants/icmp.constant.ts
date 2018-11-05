import { InjectionToken } from '@angular/core';

export interface PageIdConstant {

  // 申请单页面
  application: string;

  // 查询列表页面
  queryList: string;

  // 查询详细页面
  queryDetail: string;

  // 审批列表页面
  todoList: string;

  // 随手拍页面
  instaShot: string;

  // 统计查询页面
  statisticsSearch: string;

  // 统计页面
  statisticsView: string;

  // 考试答题页面
  examList: string;

  // Mac 地址申请页面
  macAddress: string;

  // 邮箱页面
  email: string;
}

/**
 * OA代码中用到的常量
 */
export interface IcmpConstant {

  // 默认的分页大小
  pageSize: string;

  // 请求成功代码
  reqResultSuccess: string;

  // 系统页面Id
  page: PageIdConstant;

  // 安卓更新地址
  androidUpdateUrl: string;

  // 苹果更新地址
  iosUpdateUrl: string;
}

export let ICMP_CONSTANT = new InjectionToken<IcmpConstant>('icmp.constant');

export const pageIdConstant: PageIdConstant = {
  application: 'application',
  queryList: 'query',
  queryDetail: 'queryDetail',
  todoList: 'bpm',
  instaShot: 'instaShot',
  statisticsSearch: 'statisticsSearch',
  statisticsView: 'statisticsView',
  examList: 'examList',
  macAddress: 'macAddress',
  email: 'email'
};

export const icmpConstant: IcmpConstant = {
  pageSize: '20',
  reqResultSuccess: '0',
  page: pageIdConstant,
  androidUpdateUrl: 'https://www.pgyer.com/TniF',
  iosUpdateUrl: 'https://www.pgyer.com/RNv8'
};
