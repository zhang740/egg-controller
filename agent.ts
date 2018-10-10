import * as path from 'path';
import { Agent } from 'egg';
import { genAPISDKByPath } from './lib/meta/gen_sdk';

export default (agent: Agent) => {
  const config = agent.config.controller;

  if (config.genSDK.enable) {
    let { SDKDir, templatePath, type, filter } = config.genSDK;
    if (!SDKDir) {
      throw new Error(`[egg-controller] NEED 'SDKDir' in config!`);
    }
    const ctrlDir = ([] as string[]).concat(config.ctrlDir).map(dir => {
      return path.isAbsolute(dir) ? dir : path.join(agent.baseDir, dir);
    });
    SDKDir = path.isAbsolute(SDKDir) ? SDKDir : path.join(agent.baseDir, SDKDir);

    console.log('[egg-controller] gen api sdk.');
    genAPISDKByPath(ctrlDir, SDKDir, templatePath, type, filter);

    ctrlDir.forEach(dir => {
      (agent as any).watcher.watch(dir, (file: any) => {
        console.log('[egg-controller] file changed', file.path);
        genAPISDKByPath(file.path, SDKDir, templatePath, type, filter);
      });
    });
  }
};
