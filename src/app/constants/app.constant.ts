import { InjectionToken } from '@angular/core';

/**
 * OA服务相关的配置
 */
export interface OaConstant {

  // oa服务器 http请求的根地址
  baseUrl: string;

  // 用户的密码是否需要md5加密
  md5Encryption: boolean;

  // 管理员页面密码
  // '' 关闭管理页
  // 其它字符，正常的密码录入框
  adminConsolePass: string;

  // 聊天 key
  chatKey: string;
}

/**
 * 小米推送相关配置
 */
export interface PushXiaomiConstant {

  // 小米推送注册时，分配给当前应用的appid,可登录小米推送管理端查看
  theAppid: string;

  // 小米推送注册时，分配给当前应用的appkey,可登录小米推送管理端查看
  theAppkey: string;
}

/**
 * 推送相关的配置
 */
export interface ProperPushConstant {

  // 应用的唯一标识
  appId: string;

  // 推送服务器地址，用于上传用户的推送的配置信息（比如绑定的userid,推送方式，推送的token等信息）
  // 如果pushUrl为空，则sdk将通过事件，将要更新的配置信息告知应用，由应用来处理配置信息的上报工作。这样推送服务端可以嵌入到应用服务器中。
  pushUrl?: string;

  // 与服务端通信时安全码,暂时未用到
  secretKey?: string;

  // 小米推送相关的配置
  xiaomi: PushXiaomiConstant;
}

/**
 * APP使用的常量
 */
export interface AppConstant {
  oaConstant: OaConstant;
  properPushConstant: ProperPushConstant;
}

export let APP_CONSTANT = new InjectionToken<AppConstant>('app.constant');

const oaConstant: OaConstant = {
  baseUrl: 'https://icmp2.propersoft.cn/icmp/server-dev/',
  chatKey: '1166171023115752#icmp',
  md5Encryption: true,
  adminConsolePass: '123456'
};

const properPushConstant: ProperPushConstant = {
  'appId': 'MobileOADev',
  'pushUrl': 'http://push.propersoft.cn/pep-push',
  'xiaomi': {
    'theAppid': '2882303761517720026',
    'theAppkey': '5401772090026'
  }
};

export const appConstant: AppConstant = {
  oaConstant: oaConstant,
  properPushConstant: properPushConstant
};
