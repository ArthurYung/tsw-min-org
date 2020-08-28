import { Controller } from 'egg';
import { reverseArr } from '../../utils/util';

export default class HomeController extends Controller {
  // 首页
  public async index() {
    const { ctx, service } = this;
    const uid = ctx.cookies.get('uid');
    const userInfo = await service.user.getUserInfo(uid, true);
    if (!userInfo) {
      service.user.clearUidCookie();
      ctx.redirect('/home/account');
    } else {
      await ctx.render('home.nj', { userInfo });
    }

  }

  // 登录页
  public async account() {
    const { ctx } = this;
    const uid = ctx.cookies.get('uid');
    if (uid) {
      ctx.redirect('/home');
      return;
    }
    await ctx.render('account.nj');
  }

  // 应用详情页
  public async appInfo() {
    const { ctx, service } = this;
    const { appId } = ctx.params;
    if (!appId) {
      // 跳转至主页
      ctx.redirect('/home');
      return;
    }

    const appInfo = await service.app.getAppInfo(appId);
    if (appInfo) {
      await ctx.render('/appInfo.nj', appInfo);
    } else {
      ctx.redirect('/home');
    }
  }

  // 日志详情页
  public async logs() {
    const { ctx, service } = this;
    const { appId, uid } = ctx.params;
    if (!appId || !uid) {
      // 跳转至主页
      ctx.redirect('/home');
      return;
    }
    const findRes = await service.app.getAppKey(appId);
    const reportDB = await service.app.getReportData(findRes.data, uid);
    const logs = reverseArr(reportDB);
    await ctx.render('/logs.nj', { logs });
  }

  public async capture() {
    const { ctx, service } = this;
    const { rid } = ctx.params;
    const captureInfo = await service.app.getReport(rid);

    if (!captureInfo.data) {
      ctx.redirect('/home');
      return;
    }

    const { captureRequests } = captureInfo.data;
    await ctx.render('/capture.nj', { captureRequests });
  }
}
