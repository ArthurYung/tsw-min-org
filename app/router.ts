import { Application } from 'egg';

export default (app: Application) => {
  const { controller, router } = app;

  // 上报接口
  router.post('/api/v1/logs', controller.report.postReportLogs);
  router.get('/api/v1/logs', controller.report.getReportLogs);
  router.get('/api/v1/env', controller.report.getProxyEnvList);

  router.get('/home/account', controller.home.account);
  router.get('/home', controller.home.index);
  router.get('/app/:appId', controller.home.appInfo);
  router.get('/app/:appId/:uid', controller.home.logs);
  router.get('/home/capture/:rid', controller.home.capture);

  router.put('/app/:appId/enabled', controller.webApi.appEnabled);
  router.post('/u/login', controller.webApi.login);
  router.post('/u/app', controller.webApi.addApp);
  router.put('/u/uid', controller.webApi.addUid);
  router.delete('/app/:appId', controller.webApi.deleteApp);
};
