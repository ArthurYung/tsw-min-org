import { Controller } from 'egg';
import { md5 } from '../../utils/util';
import { errorReturn, errorCode } from '../error-code';

export default class WebController extends Controller {

  public async login() {
    const { ctx, service } = this;
    const { username, remarks } = ctx.request.body;
    if (!username) {
      ctx.body = errorReturn(4007);
      service.user.clearUidCookie();
    }
    // 种下cookie
    const uid = md5(username);
    const hasUser = await service.user.hasUser(uid);
    if (!hasUser) {
      await service.user.addUser(username, uid, remarks);
    }
    ctx.cookies.set('uid', uid);
    // 跳转至主页
    ctx.redirect('/home');
  }

  public async addUid() {
    const { ctx, service } = this;
    const { uid, appKey } = ctx.request.body;
    if (!uid) {
      ctx.body = errorReturn(9001);
      return;
    }

    if (!appKey) {
      ctx.body = errorReturn(9002);
      return;
    }

    await service.app.addTestUid(appKey, uid);
    ctx.body = { code: 0 };
  }

  // 创建app
  public async addApp() {
    const { ctx, service } = this;
    const { appname, remarks } = ctx.request.body;
    const uid = ctx.cookies.get('uid');
    if (!uid || !appname) {
      ctx.body = errorReturn(9001);
      return;
    }

    if (!appname) {
      ctx.body = errorReturn(9002);
      return;
    }

    try {
      const managerInfo = await service.user.getUserInfo(uid, false);

      if (!managerInfo) {
        ctx.body = errorReturn(4040);
        return;
      }

      const appInfo = await service.app.createApp(appname, remarks, managerInfo);

      ctx.body = {
        code: 0,
        message: 'success',
        data: appInfo,
      };

    } catch (e) {
      console.log(e);
      ctx.status = 500;
      ctx.body = { code: 5002, message: e.message };
    }
  }

  public async deleteApp() {
    const { ctx, service } = this;
    const { appId } = ctx.params;
    const { uid } = ctx.request.body;

    if (!uid) {
      ctx.body = errorReturn(9001);
      return;
    }

    if (!appId) {
      ctx.body = errorReturn(4008);
      return;
    }

    const code = await service.app.deleteApp(appId, uid);

    ctx.body = {
      code,
      message: errorCode[code] || '删除成功',
    };
  }

  public async appEnabled() {
    const { ctx, service } = this;
    const { enabled } = ctx.request.body;
    const { appId } = ctx.params;

    if (!appId) {
      ctx.body = errorReturn(9001);
      return;
    }

    const code = await service.app.updateEnabled(appId, enabled);

    ctx.body = {
      code,
      message: errorCode[code] || '修改成功',
    };
  }
}

