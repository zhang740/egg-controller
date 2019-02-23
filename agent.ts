import * as path from 'path';
import { Agent } from 'egg';
import { genAPISDKByPath } from './lib/meta/gen_sdk';

export default (agent: Agent) => {
  const config = agent.config.controller;

  if (config.genSDK.enable) {
    let { enable, filter, ...rest } = config.genSDK;
    if (!rest.sdkDir) {
      throw new Error(`[egg-controller] NEED 'SDKDir' in config!`);
    }
    const ctrlDir = ([] as string[]).concat(config.ctrlDir).map(dir => {
      return path.isAbsolute(dir) ? dir : path.join(agent.baseDir, dir);
    });
    rest.sdkDir = path.isAbsolute(rest.sdkDir)
      ? rest.sdkDir
      : path.join(agent.baseDir, rest.sdkDir);

    console.log('[egg-controller] gen api sdk.');
    genAPISDKByPath(ctrlDir, filter, rest, agent.config, config.fork);

    ctrlDir.forEach(dir => {
      (agent as any).watcher.watch(dir, (file: any) => {
        console.log('[egg-controller] file changed', file.path);
        genAPISDKByPath(
          file.path,
          filter,
          {
            ...rest,
            autoClear: false,
          },
          agent.config,
          config.fork
        );
      });
    });
  }
};
