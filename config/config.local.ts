import { EggAppConfig, PowerPartial } from 'egg';

export default () => {
  const config: PowerPartial<EggAppConfig> = {
    xframe: {
      enable: false,
    },
  };
  return config;
};
