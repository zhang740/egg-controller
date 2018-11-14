import * as path from 'path';
import { genAPISDKByPath } from '../meta';
const utils = require('egg-utils');

export async function genAPISDK(baseDir: string) {
  const framework = utils.getFrameworkPath({ baseDir });
  const config = utils.getConfig({ baseDir, framework }).controller;
  let { filter, ...rest } = config.genSDK;
  rest.sdkDir = path.isAbsolute(rest.sdkDir) ? rest.sdkDir : path.join(baseDir, rest.sdkDir);
  await Promise.all(
    [].concat(config.ctrlDir)
      .map(dir => path.isAbsolute(dir) ? dir : path.join(baseDir, dir))
      .map(async dir => genAPISDKByPath(dir, filter, rest))
  );
  console.log('[egg-controller] gen api sdk.');
}
