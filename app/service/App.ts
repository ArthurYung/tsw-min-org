import { Service } from 'egg';
import appDB, { ReportInfo, UserInfo } from '../../db';
import { createAppKey } from '../../utils/util';

export default class App extends Service {
  /**
   * 验证appKey是否合法
   * @param appKey - appkey
   */
  public verificationAppKey(appKey: string) {
    return appDB.hasApp(appKey);
  }

  /**
   * 获取appKey相关信息
   */
  public getAppInfo(appId: string) {
    return appDB.getAppByUid(appId);
  }

  // 返回体format
  public unAuthorizationRes(code) {
    return {
      code: code === 401 ? 4001 : 4003,
      message: code === 401 ? 'cannot find appKey' : 'appKey is invalid',
    };
  }

  // 添加appkey下的测试号(env)
  public addTestUid(appKey, env) {
    appDB.addAppEnv(appKey, env);
  }

  // 返回appkey查询的响应内容
  public checkAppKeyReturns(appKey: string) {
    return this.verificationAppKey(appKey);
    // if (!appKey) {
    //   return this.unAuthorizationRes(401);
    // }
    // const checkRes = await this.verificationAppKey(appKey);
    // if (!checkRes) {
    //   return this.unAuthorizationRes(403);
    // }
    // return { code: 0 };
  }

  // 保存上报数据
  public saveReportData(reportData: ReportInfo) {
    return appDB.addLog(reportData.appKey, reportData.env, reportData);
  }

  // 获取用户的上报数据
  public getReportData(appKey: string, uid: string) {
    return appDB.getLogs(appKey, uid);
  }

  // 根据appID查找appKey
  public getAppKey(appId: string) {
    return appDB.getAppKey(appId);
  }

  // 获取app下的测试id列表
  public async getAppConfig(appKey: string) {
    const appInfo = await appDB.getApp(appKey);

    if (appInfo) {
      return {
        envList: appInfo.tests || [],
        enabled: appInfo.enabled,
      };
    }

    return null;
  }

  // 获取上报详情
  public getReport(rid: string) {
    return appDB.getReport(rid);
  }

  // 创建一个app
  public createApp(appname: string, remarks: string, managerInfo: UserInfo<string>) {
    const appInfo = {
      appKey: createAppKey(appname),
      remarks: remarks || '',
      manager: managerInfo,
      users: [],
      latestDate: new Date().toLocaleDateString(),
      appName: appname,
      tests: [],
      createDate: new Date().toLocaleDateString(),
      enabled: true,
    };

    return appDB.addApp(appInfo).then(() => {
      appDB.updateUserApp(managerInfo.uid, appInfo.appKey);
      return appInfo;
    });
  }

  public deleteApp(appId: string, uid: string) {
    return appDB.deleteApp(appId, uid);
  }

  public updateEnabled(appId: string, enabled: boolean) {
    return appDB.updateAppEnable(appId, enabled);
  }
}
