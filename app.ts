import * as fs from 'fs';
import * as path from 'path';
import { Application } from 'egg';
import { registerRoute } from './lib/register';
import { loadDir } from './lib/util';

export default (app: Application) => {
  const config = app.config.controller;

  if (config.autoLoad) {
    [].concat(config.ctrlDir)
      .map(dir => path.isAbsolute(dir) ? dir : path.join(app.baseDir, dir))
      .forEach(dir => {
        return fs.existsSync(dir) && loadDir(dir);
      });
  }

  app.beforeStart(() => {
    registerRoute(app);
  });
};
