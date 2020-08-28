import * as assert from 'assert';
import appDB, { ReportInfo } from '../../db/index';

describe('test/db/db.test.ts', () => {

  const testAppInfo = {
    appKey: 'test-app',
    manager: {
      uid: '098f6bcd4621d373cade4e832627b4f6',
      username: 'test',
    },
    users: [],
    tests: [ 'test01' ],
    appName: 'test-app',
    latestDate: new Date().toLocaleDateString(),
  };

  it('set appInfo', async () => {
    await appDB.addApp(testAppInfo);
    const appInfo = await appDB.getApp(testAppInfo.appKey);
    assert((appInfo as any).appKey === testAppInfo.appKey);
  });

  it('set Log', async () => {
    const logInfo = {
      logs: [ 'jajaja' ],
      appKey: 'test',
      requests: [{ a: 1 }],
    };

    await appDB.addLog('test-app', 'test01', logInfo as unknown as ReportInfo);
    const appLogs = await appDB.getLogs('test-app', 'test01') || [];
    assert(appLogs[0].appKey === 'test');
  });

  it('get report', async () => {
    const reportInfo = (await appDB.getReport('2726e1602276cdf229ac05c7ac2ad6b8')).data || {} as ReportInfo;
    console.log(reportInfo);
    assert(reportInfo.appKey === 'test');
  });

  it('test schedule', async () => {
    appDB.cleanLogsCallback();
    await new Promise(resolve => {
      setTimeout(() =>
        resolve()
      , 3 * 1000);
    });
    const reportInfo = await appDB.getReport('2726e1602276cdf229ac05c7ac2ad6b8');
    assert(reportInfo.data === undefined);
  });
});
