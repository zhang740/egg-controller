import { EggPlugin } from 'egg';

const plugin: EggPlugin = {
  aop: {
    enable: true,
    package: 'egg-aop',
  },
};

export default plugin;
