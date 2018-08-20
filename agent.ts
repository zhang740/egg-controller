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
    const ctrlDir = path.isAbsolute(config.ctrlDir) ? config.ctrlDir : path.join(agent.baseDir, config.ctrlDir);
    SDKDir = path.isAbsolute(SDKDir) ? SDKDir : path.join(agent.baseDir, SDKDir);
    genAPISDKByPath(ctrlDir, SDKDir, templatePath, type, filter);
    console.log('[egg-controller] gen api sdk.');
    (agent as any).watcher.watch(ctrlDir, (file: any) => {
      console.log('[egg-controller] file changed', file.path);
      genAPISDKByPath(file.path, SDKDir, templatePath, type, filter);
    });
  }
};
