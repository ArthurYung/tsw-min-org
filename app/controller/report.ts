import { Controller } from 'egg';
import { errorReturn } from '../error-code';

export default class ConfigController extends Controller {
  public async postReportLogs() {
    const { ctx, service } = this;
    const reportContext = ctx.request.body || {};

    if (!reportContext.appKey) {
      ctx.body = errorReturn(4001);
      return;
    }

    const checkAppKey = await service.app.checkAppKeyReturns(reportContext.appKey);

    if (!checkAppKey) {
      ctx.body = errorReturn(4003);
      return;
    }

    await service.app.saveReportData(reportContext);

    ctx.body = { code: 0, message: 'report success' };
  }

  public async getReportLogs() {
    const { ctx, service } = this;
    const { uid, appKey } = ctx.request.query;
    const logList = await service.app.getReportData(appKey, uid);

    ctx.body = { code: 0, reports: logList };
  }

  // 获取uidList;
  public async getProxyEnvList() {
    const { ctx, service } = this;
    const appKey = ctx.request.query?.appKey || '';

    if (!appKey) {
      ctx.body = errorReturn(4001);
      return;
    }

    const checkAppKey = await service.app.checkAppKeyReturns(appKey);

    if (!checkAppKey) {
      ctx.body = errorReturn(4003);
      return;
    }

    const appConfig = await service.app.getAppConfig(appKey);

    ctx.body = {
      code: 0,
      data: appConfig,
    };
  }
}
