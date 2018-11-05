import { Injectable } from '@angular/core';
import { Http, Request, RequestOptionsArgs, Response, RequestOptions, ConnectionBackend, Headers } from '@angular/http';
import 'rxjs/Rx';
import { Observable } from 'rxjs/Observable';
import { ConfigsService } from '../services/configs.service';
import { DeviceInfoState, DeviceService } from '../services/device.service';
import { UserService } from '../services/user.service';
import { Store } from '@ngrx/store';
import { RequestIncrementAction, RequestDecrementAction } from '../redux/actions/request.action';

/**
 * HTTP请求拦截器
 */
@Injectable()
export class HttpInterceptor extends Http {

  constructor(backend: ConnectionBackend, defaultOptions: RequestOptions, private configsService: ConfigsService,
              private userService: UserService, private deviceService: DeviceService, private store: Store<number>) {
    super(backend, defaultOptions);
  }

  /**
   * 请求拦截器
   */
  request(url: string | Request, options?: RequestOptionsArgs): Observable<Response> {
    let urlStr: string = '';
    if (typeof url === 'string') {
      urlStr = url;
    } else {
      urlStr = url['url'];
    }
    this.store.dispatch(new RequestIncrementAction());
    if (this.needContextPrefix(urlStr)) {
      typeof url === 'string' ? (url = this.configsService.getBaseUrl() + url) : (url['url'] = this.configsService.getBaseUrl() + url['url']);
    }
    return this.intercept(super.request(url, options), false);
  }

  /**
   * get拦截器
   */
  get(url: string, options?: RequestOptionsArgs): Observable<Response> {
    return this.intercept(super.get(url, this.getRequestOptionArgs('get', options)), true);
  }

  /**
   * put拦截器
   */
  put(url: string, body: any, options?: RequestOptionsArgs): Observable<Response> {
    return this.intercept(super.put(url, body, this.getRequestOptionArgs('put', options)), true);
  }

  /**
   * post拦截器
   */
  post(url: string, body: any, options?: RequestOptionsArgs): Observable<Response> {
    if (body == null) {
      body = {};
    }
    // 参数内加入设备信息
    let deviceInfo: DeviceInfoState = this.deviceService.getDeviceInfo();
    if (deviceInfo != null) {
      body['_proper_device_type'] = deviceInfo.deviceType;
      body['_proper_device_id'] = deviceInfo.deviceId;
      body['_proper_ver_no'] = deviceInfo.versionCode;
      body['_proper_ver_name'] = deviceInfo.versionNumber;
    }
    // 参数内加入用户信息
    // if (!body['loginName']) {
    //   let userInfo: UserInfoState = this.userService.getUserInfo();
    //   if (userInfo != null) {
    //     body['loginName'] = userInfo.loginName;
    //     body['password'] = userInfo.password;
    //   }
    // }
    return this.intercept(super.post(url, body, this.getRequestOptionArgs('post', options)), true);
  }

  /**
   * delete拦截器
   */
  delete(url: string, options?: RequestOptionsArgs): Observable<Response> {
    return this.intercept(super.delete(url, this.getRequestOptionArgs('delete', options)), true);
  }

  /**
   * 判断是否需求在请求地址前加上IP地址
   */
  needContextPrefix(url: string): boolean {
    return !(url.indexOf('./assets') === 0 || url.indexOf('http') === 0);
  }

  /**
   * 添加请求头信息
   */
  getRequestOptionArgs(type: string, options?: RequestOptionsArgs): RequestOptionsArgs {
    if (options == null) {
      options = new RequestOptions();
    }
    if (options.headers == null) {
      options.headers = new Headers();
    }
    if (localStorage['token']) {
      options.headers.append('Authorization', 'Bearer ' + localStorage['token']);
    }
    return options;
  }

  /**
   * 捕获应答异常并处理
   */
  intercept(observable: Observable<Response>, isReqType: boolean): Observable<Response> {
    if (isReqType) {
      observable = observable.do((res: Response) => {
        this.store.dispatch(new RequestDecrementAction());
      }, (res) => {
        this.store.dispatch(new RequestDecrementAction());
        if (res.status === -1 || res.status === 0) {
          res._body = '网络异常，请稍后再试';
        } else if (res.status === 401) {
          res._body = null;
        } else if (res.status === 404) {
          res._body = '资源未找到';
        } else if (res.status === 502) {
          res._body = '网络异常';
        } else if (res.status === 503) {
          res._body = '连接数过多，请稍后...';
        } else {
          if (res._body != null && /\w+[\s\.]\w+/.test(res._body)) {
            res._body = '系统异常';
          }
        }
      });
    }
    return observable;
  }
}
