import { EggAppConfig, EggAppInfo, PowerPartial } from 'egg';

export default (appInfo: EggAppInfo) => {
  const config = {} as PowerPartial<EggAppConfig>;

  // override config from framework / plugin
  // use for cookie sign key, should change to your own and keep security
  config.keys = appInfo.name + '_1594374236178_9784';

  // add your egg config in here
  config.middleware = [];

  config.security = {
    csrf: {
      enable: false,
    },
  };

  config.view = {
    defaultViewEngine: 'nunjucks',
  };

  config.bodyParser = {
    encoding: 'utf8',
    formLimit: '10mb',
    jsonLimit: '10mb',
    textLimit: '10mb',
  };

  // add your special config in here
  const bizConfig = {
    sourceUrl: `https://github.com/eggjs/examples/tree/master/${appInfo.name}`,
  };

  // the return config will combines to EggAppConfig
  return {
    ...config,
    ...bizConfig,
  };
};
