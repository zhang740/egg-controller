import * as path from 'path';
import { genAPISDKByPath } from '../meta';
const utils = require('egg-utils');

export async function genAPISDK(baseDir: string) {
  const framework = utils.getFrameworkPath({ baseDir });
  const appConfig = utils.getConfig({ baseDir, framework });
  let { filter, ...rest } = appConfig.controller.genSDK;
  rest.sdkDir = path.isAbsolute(rest.sdkDir) ? rest.sdkDir : path.join(baseDir, rest.sdkDir);
  await Promise.all(
    [].concat(appConfig.controller.ctrlDir)
      .map(dir => path.isAbsolute(dir) ? dir : path.join(baseDir, dir))
      .map(async dir => genAPISDKByPath(dir, filter, rest, appConfig))
  );
  console.log('[egg-controller] gen api sdk.');
}
