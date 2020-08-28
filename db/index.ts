import DB from './level';
import * as schedule from 'node-schedule';
import { getJsonHash } from '../utils/util';

export interface AppInfo {
  appKey: string;
  manager: { uid: string; username: string };
  users: string[];
  latestDate: string;
  appName: string;
  tests: string[];
  appId?: number;
  enabled: boolean;
}

export interface UserInfo<T = string> {
  username: string;
  uid: string;
  email?: string;
  apps: T[];
}

export interface ReportInfo {
  appKey: string;
  logs: string[];
  captureRequests: any[];
  env: string;
  rid?: string;
}

type AppInfoReturn<T> = T extends true ? UserInfo<AppInfo> : UserInfo

export type PromiseReturn<T> = Promise<{ data?: T; error?: Error }>;
export type AppInfoPromiseReturn<T> = Promise<AppInfoReturn<T>>

class ControlDB {
  constructor() {
    DB.createTable('user', 'json');
    DB.createTable('app', 'json');
    DB.createTable('log', 'json');
    DB.createTable('url', 'string');
    DB.createTable('report', 'json');
    this.initScheduleClean();
  }

  // 每天凌晨删除应用下的测试帐号以及日志数据
  private initScheduleClean() {
    schedule.scheduleJob('1 0 0 * * *', this.cleanLogsCallback);
  }

  public cleanLogsCallback() {
    const cleanIds: string[] = [];
    const readStream = DB.readStream({ values: false });
    readStream.on('data', data => {
      const key = data.toString();

      // 如果是app表的数据， 清除 appInfo中的test id
      if (key.startsWith('app.')) {
        const appKey = key.replace(/^app\./, '');
        DB.table('app').update(appKey, appInfo => {
          appInfo.tests = [];
          return appInfo;
        });
      } else if (key.startsWith('log.') || key.startsWith('report.')) {
        // 如果是log表和上报内容表，加入删除队列
        cleanIds.push(key);
      }
    });

    readStream.on('end', () => {
      // 结束后开始批量清除
      DB.batch(cleanIds.map(key => ({ key, type: 'del' })));
    });
  }

  // 判断是否存在当前appKey
  public hasApp(appKey: string) {
    return DB.table('app').asyncHas(appKey);
  }

  public hasUser(uid: string) {
    return DB.table('user').get(uid);
  }

  public async applyAppId(appInfo: AppInfo) {
    const uid = (await DB.createUniqueID()).toString();
    DB.table('url').put(uid, appInfo.appKey);
    appInfo.appId = uid;
  }

  // 添加app
  public async addApp(appInfo: AppInfo) {
    await this.applyAppId(appInfo);
    return DB.table('app').put(appInfo.appKey, appInfo);
  }

  // 添加用户
  public addUser(username: string, uid: string, remarks: string) {
    return DB.table('user').put(uid, { username, uid, remarks, apps: [] });
  }

  // 获取app内容
  public async getApp(appKey: string): Promise<AppInfo | null> {
    const res = await DB.table('app').get(appKey);
    if (res.error) return null;
    return res.data;
  }

  // 获取用户信息
  public async getUser<K extends boolean>(uid: string, appInfo: K): AppInfoPromiseReturn<K> {
    const res = await DB.table('user').get(uid);
    if (res.data && appInfo) {
      const promiseArr = res.data.apps.map(app => DB.table('app').get(app));
      res.data.apps = (
        await Promise.all<{ data?: UserInfo<AppInfo>; error?: Error}>(promiseArr)
          .then(res => res.filter(item => item.data).map(item => item.data))
          .catch(() => [])
      );
    }

    return res.data;
  }

  // 添加测试帐号
  public addAppEnv(appKey: string, env: string) {
    DB.table('app').update(appKey, appInfo => {
      appInfo.tests.push(env);
      return appInfo;
    });
  }

  // 添加日志
  public async addLog(appKey: string, uid: string, reportInfo: ReportInfo) {
    console.log('uid', uid);
    const rid = getJsonHash(reportInfo);
    reportInfo.rid = rid;
    try {
      await DB.table('report').put(rid, reportInfo);
      const logKey = `${appKey}.${uid}`;
      const uidLogs = (await DB.table('log').get(logKey)).data || [];

      uidLogs.push(rid);
      console.log(logKey, uidLogs.length);
      // 只保持50条上报日志， 超出的删除
      if (uidLogs.length > 50) {
        const expKey = uidLogs.shift() as string;
        DB.table('report').delete(expKey);
      }

      return DB.table('log').put(logKey, uidLogs);
    } catch (e) {
      console.log(e);
      return Promise.reject(e);
    }
  }

  // 获取日志内容
  public async getLogs(appKey: string, uid: string): Promise<any[]> {
    const res = await DB.table('log').get(`${appKey}.${uid}`);
    if (!res.data || !Array.isArray(res.data)) { return []; }
    console.log(`${appKey}.${uid}`, res.data.length);
    // promise 列表
    const promiseArr = res.data.map(reportId => DB.table('report').get(reportId));
    // 过滤不需要的数据
    const filterResFn = results => results.filter(item => item.data).map(item => item.data);

    return Promise.all(promiseArr).then(filterResFn).catch(() => []);
  }

  // 获取上报详情
  public getReport(rid: string): PromiseReturn<ReportInfo> {
    return DB.table('report').get(rid);
  }

  // 更新用户app列表
  public updateUserApp(uid: string, appKey: string) {
    DB.table('user').update(uid, userInfo => {
      userInfo.apps.push(appKey);
      return userInfo;
    });
  }

  public async getAppByUid(uid: string) {
    const { data: appKey } = await DB.table('url').get(uid.toString());
    if (!appKey) return null;
    return this.getApp(appKey);
  }

  public async getAppKey(uid: string) {
    return DB.table('url').get(uid.toString());
  }

  public async deleteApp(appId: string, uid: string): Promise<number> {
    const { data } = await DB.table('url').get(appId);
    if (!data) return 9004;
    try {
      await DB.table('url').delete(appId);
      await DB.table('app').delete(data);
      await DB.table('user').update(uid, userInfo => {
        userInfo.apps = userInfo.apps.filter(appKey => appKey !== data);
        return userInfo;
      });

      return 0;
    } catch (e) {
      return 5001;
    }
  }

  public async updateAppEnable(appId: string, enabled: boolean): Promise<number> {
    const { data } = await DB.table('url').get(appId);
    if (!data) return 9004;
    try {
      await DB.table('app').update(data, appInfo => {
        appInfo.enabled = enabled;
        return appInfo;
      });
      return 0;
    } catch (e) {
      return 5001;
    }
  }
}

let appDB = null as unknown as ControlDB;

if (!appDB) {
  appDB = new ControlDB();
}

export default appDB;

