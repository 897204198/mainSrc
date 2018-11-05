import { IonicApp, IonicModule } from 'ionic-angular';
import { IonicStorageModule } from '@ionic/storage';
import { HttpModule, Http, XHRBackend, RequestOptions } from '@angular/http';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppMinimize } from '@ionic-native/app-minimize';
import { AppVersion } from '@ionic-native/app-version';
import { Camera } from '@ionic-native/camera';
import { Device } from '@ionic-native/device';
import { File } from '@ionic-native/file';
import { FileChooser } from '@ionic-native/file-chooser';
import { FileOpener } from '@ionic-native/file-opener';
import { FilePath } from '@ionic-native/file-path';
import { FileTransfer, FileTransferObject } from '@ionic-native/file-transfer';
import { ImagePicker } from '@ionic-native/image-picker';
import { InAppBrowser } from '@ionic-native/in-app-browser';
import { Keyboard } from '@ionic-native/keyboard';
import { NativeStorage } from '@ionic-native/native-storage';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';
import { UniqueDeviceID } from '@ionic-native/unique-device-id';
import { MyApp } from './app.component';
import { TabsPage } from '../pages/tabs/tabs';
import { BackButtonService } from './services/backButton.service';
import { AdminPage } from '../pages/login/admin/admin';
import { LoginPage } from '../pages/login/login';
import { SpellService } from './services/spell.service';
import { ToastService } from './services/toast.service';
import { APP_CONSTANT, appConstant } from './constants/app.constant';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { ConfigsService } from './services/configs.service';
import { ICMP_CONSTANT, icmpConstant } from './constants/icmp.constant';
import { SecureStorageService } from './services/secureStorage.service';
import { CryptoService } from './services/crypto.service';
import { HttpInterceptor } from './interceptors/http.interceptor';
import { SearchFilterPipe } from './pipes/searchFilter/searchFilter';
import { MenuFolderComponent } from './component/menuFolder/menuFolder.component';
import { AddCustomPluginsComponent } from '../pages/home/component/addCustomPlugins/addCustomPlugins.component';
import { HomeCustomComponent } from '../pages/home/component/homeCustom/homeCustom.component';
import { PluginColldoctorComponent } from '../pages/home/component/pluginColldoctor/pluginColldoctor.component';
import { PluginRegRemindComponent } from '../pages/home/component/pluginRegRemind/pluginRegRemind.component';
import { HomePage } from '../pages/home/home';
import { HomePluginsManagerPage } from '../pages/home/homePluginsManager/homePluginsManager';
import { HomeMenusManagerPage } from '../pages/home/homeMenusManager/homeMenusManager';
import { DragulaModule } from 'ng2-dragula';
import { RoutersService } from './services/routers.service';
import { SettingPage } from '../pages/setting/setting';
import { UserInfoPage } from '../pages/setting/userInfo/userInfo';
import { AboutPage } from '../pages/setting/about/about';
import { FeedbackPage } from '../pages/setting/feedback/feedback';
import { NewsNoticePage } from '../pages/setting/newsNotice/newsNotice';
import { SafeAndPrivacyPage } from '../pages/setting/safeAndPrivacy/safeAndPrivacy';
import { GeneralPage } from '../pages/setting/general/general';
import { QueryNoticeDetailPage } from '../pages/query/queryNoticeDetail/queryNoticeDetail';
import { FileTypeImageComponent } from './component/fileTypeImage/fileTypeImage.component';
import { FileService } from './services/file.service';
import { QueryListPage } from '../pages/query/queryList/queryList';
import { QueryListConditionPage } from '../pages/query/queryListCondition/queryListCondition';
import { SearchboxComponent } from './component/searchbox/searchbox.component';
import { TodoListPage } from '../pages/todo/todoList/todoList';
import { TodoDetailPage } from '../pages/todo/todoDetail/todoDetail';
import { TodoOpinionPage } from '../pages/todo/todoOpinion/todoOpinion';
import { UtilsService } from './services/utils.service';
import { QueryDetailPage } from '../pages/query/queryDetail/queryDetail';
import { UserService } from './services/user.service';
import { DeviceService } from './services/device.service';
import { PushService } from './services/push.service';
import { AppVersionUpdateService } from './services/appVersionUpdate.service';
import { IcmpDblclickDirective } from './directives/dblclick.directive';
import { Store, StoreModule } from '@ngrx/store';
import { reducer } from './redux/app.reducer';
import { IcmpSpinnerComponent } from './component/spinner/spinner.component';
import { InstaShotPage } from '../pages/instaShot/instaShot';
import { PhotoService } from './services/photo.service';
import { ApplicationPage } from '../pages/application/application';
import { StatisticsQueryPage } from '../pages/statistics/statisticsQuery/statisticsQuery';
import { StatisticsViewPage } from '../pages/statistics/statisticsView/statisticsView';
import { AddressPage } from '../pages/address/address';
import { ChatListPage } from '../pages/chatList/chatList';
import { AddFriendPage } from '../pages/address/addFriend/addFriend';
import { ApplyPage } from '../pages/address/apply/apply';
import { GroupPage } from '../pages/address/group/group';
import { CreateGroupPage } from '../pages/address/group/createGroup';
import { UserProfilePage } from '../pages/address/userProfile/userProfile';
import { PluginShowComponent } from '../pages/home/component/pluginShow/pluginShow.component';
import { ResetPasswordPage } from '../pages/setting/resetPassword/resetPassword';
import { ExamCustomFramePage } from '../pages/exam/customFrame/customFrame';
import { MacAddressPage } from '../pages/macAddress/macAddress';
import { OrganizationAddressPage } from '../pages/address/organizationAddress/organizationAddress';
import { EmailPage } from '../pages/email/email';
import { IcmpPlaceholderComponent } from './component/placeholder/placeholder.component';
import { OopStormPage } from '../pages/setting/about/oopStorm/oopStorm';
import { ImagePreviewPage } from '../pages/setting/feedback/imagePreview';
import { IcmpKeyboardAttachDirective } from './directives/keyboardAttach.directive';

export function interceptorFactory(xhrBackend: XHRBackend, requestOptions: RequestOptions, configsService: ConfigsService,
                                   userService: UserService, deviceService: DeviceService, store: Store<number>) {
  let service = new HttpInterceptor(xhrBackend, requestOptions, configsService, userService, deviceService, store);
  return service;
}

export function createTranslateLoader(http: Http) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

@NgModule({
  declarations: [
    MyApp,
    IcmpDblclickDirective,
    SearchFilterPipe,
    MenuFolderComponent,
    IcmpSpinnerComponent,
    SearchboxComponent,
    AddCustomPluginsComponent,
    HomeCustomComponent,
    PluginColldoctorComponent,
    PluginRegRemindComponent,
    PluginShowComponent,
    IcmpPlaceholderComponent,
    FileTypeImageComponent,
    TabsPage,
    AdminPage,
    LoginPage,
    HomePage,
    HomePluginsManagerPage,
    HomeMenusManagerPage,
    SettingPage,
    UserInfoPage,
    AboutPage,
    FeedbackPage,
    NewsNoticePage,
    SafeAndPrivacyPage,
    GeneralPage,
    QueryNoticeDetailPage,
    QueryListPage,
    QueryListConditionPage,
    StatisticsQueryPage,
    StatisticsViewPage,
    ApplicationPage,
    TodoListPage,
    TodoDetailPage,
    TodoOpinionPage,
    QueryDetailPage,
    InstaShotPage,
    AddressPage,
    ChatListPage,
    AddFriendPage,
    ApplyPage,
    GroupPage,
    CreateGroupPage,
    UserProfilePage,
    ResetPasswordPage,
    ExamCustomFramePage,
    MacAddressPage,
    OrganizationAddressPage,
    EmailPage,
    OopStormPage,
    ImagePreviewPage,
    IcmpKeyboardAttachDirective
  ],
  imports: [
    IonicModule.forRoot(MyApp, {
      tabsHideOnSubPages: 'true',
      platforms: {
        ios: {
          backButtonText: '返回'
        }
      }
    }),
    StoreModule.provideStore(reducer),
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: (createTranslateLoader),
        deps: [Http]
      }
    }),
    IonicStorageModule.forRoot(),
    BrowserModule,
    HttpModule,
    DragulaModule
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    MenuFolderComponent,
    SearchboxComponent,
    TabsPage,
    AdminPage,
    LoginPage,
    HomePage,
    HomePluginsManagerPage,
    HomeMenusManagerPage,
    SettingPage,
    UserInfoPage,
    AboutPage,
    FeedbackPage,
    NewsNoticePage,
    SafeAndPrivacyPage,
    GeneralPage,
    QueryNoticeDetailPage,
    QueryListPage,
    QueryListConditionPage,
    StatisticsQueryPage,
    StatisticsViewPage,
    ApplicationPage,
    TodoListPage,
    TodoDetailPage,
    TodoOpinionPage,
    QueryDetailPage,
    InstaShotPage,
    AddressPage,
    ChatListPage,
    AddFriendPage,
    ApplyPage,
    GroupPage,
    CreateGroupPage,
    UserProfilePage,
    ResetPasswordPage,
    ExamCustomFramePage,
    MacAddressPage,
    OrganizationAddressPage,
    EmailPage,
    OopStormPage,
    ImagePreviewPage
  ],
  providers: [
    StatusBar,
    SpellService,
    File,
    FileChooser,
    FilePath,
    FileTransfer,
    FileTransferObject,
    FileOpener,
    Keyboard,
    SplashScreen,
    UniqueDeviceID,
    Device,
    AppVersion,
    InAppBrowser,
    AppVersionUpdateService,
    SecureStorageService,
    CryptoService,
    BackButtonService,
    ConfigsService,
    ToastService,
    RoutersService,
    FileService,
    UtilsService,
    UserService,
    DeviceService,
    PushService,
    Camera,
    ImagePicker,
    PhotoService,
    AppMinimize,
    NativeStorage,
    SearchFilterPipe,
    {provide: Http, useFactory: interceptorFactory, deps: [XHRBackend, RequestOptions, ConfigsService, UserService, DeviceService, Store]},
    {provide: APP_CONSTANT, useValue: appConstant},
    {provide: ICMP_CONSTANT, useValue: icmpConstant}
  ]
})
export class AppModule {}
