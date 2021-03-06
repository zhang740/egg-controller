import * as path from 'path';
import { fork as cpFork } from 'child_process';
import { getDirFiles } from '../util';
import { CliConfig } from 'openapi-generator';
import { EggAppConfig } from 'egg';

/** 根据路径生成APISDK */
export async function genAPISDKByPath(
  ctrlDir: string | string[],
  filter = [/^\/api\//g],
  config: CliConfig,
  appConfig: EggAppConfig,
  fork = cpFork
) {
  return new Promise((resolve, _reject) => {
    const files: string[] = [];
    [].concat(ctrlDir).forEach(dir => {
      files.push(...getDirFiles(dir));
    });

    if (config.hook) {
      Object.keys(config.hook).forEach(key => {
        if (typeof config.hook[key] === 'function') {
          config.hook[key] = config.hook[key].toString();
        }
      });
    }

    const p = fork(path.join(__dirname, 'gen_sdk_script.js'), null, {
      stdio: 'inherit',
      encoding: 'utf8',
    } as any);
    p.on('message', _data => {
      p.send({
        files,
        config,
        filter: filter.map(f => f.toString()),
        appConfig,
      });
    });
    p.on('exit', () => {
      resolve();
    });
  });
}
