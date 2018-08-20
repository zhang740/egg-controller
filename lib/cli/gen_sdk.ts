import * as path from 'path';
import { genAPISDKByPath } from '../meta';
const utils = require('egg-utils');

export async function genAPISDK(baseDir: string) {
  const framework = utils.getFrameworkPath({ baseDir });
  const egg = require(framework);

  const app = new egg.Application();
  const config = app.config.controller;
  let { SDKDir, templatePath, filter, type } = config.genSDK;
  SDKDir = path.isAbsolute(SDKDir) ? SDKDir : path.join(app.baseDir, SDKDir);
  await Promise.all(
    [].concat(config.ctrlDir)
      .map(dir => path.isAbsolute(dir) ? dir : path.join(app.baseDir, dir))
      .map(async dir => genAPISDKByPath(dir, SDKDir, templatePath, type, filter))
  );
  console.log('[egg-controller] gen api sdk.');
}
