import { Service } from 'egg';
import appDB, { AppInfoPromiseReturn } from '../../db';

export default class User extends Service {
  // 添加用户
  public addUser(username: string, uid: string, remarks = '暂无说明') {
    return appDB.addUser(username, uid, remarks);
  }

  // 获取用户信息
  public getUserInfo<K extends boolean>(uid: string, appInfo: K): AppInfoPromiseReturn<K> {
    return appDB.getUser(uid, appInfo);
  }

  public async hasUser(uid: string): Promise<boolean> {
    const checkRes = await appDB.hasUser(uid);
    return !!checkRes.data;
  }

  public clearUidCookie(): void {
    this.ctx.cookies.set('uid', '', {
      expires: new Date(),
    });
  }
}
