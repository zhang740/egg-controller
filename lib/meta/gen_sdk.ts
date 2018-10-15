

import * as path from 'path';
import { fork } from 'child_process';
import { getDirFiles } from '../util';

/** 根据路径生成APISDK */
export async function genAPISDKByPath(
  ctrlDir: string | string[],
  targetSDKDir: string,
  templatePath?: string,
  type = 'js',
  filter = [/^\/api\//g],
) {
  return new Promise((resolve, _reject) => {
    const files: string[] = [];
    [].concat(ctrlDir).forEach(dir => {
      files.push(...getDirFiles(dir));
    });

    const p = fork(path.join(__dirname, 'gen_sdk_script.js'), null, {
      stdio: 'inherit',
      encoding: 'utf8',
    } as any);
    p.on('message', (_data) => {
      p.send({
        targetSDKDir, files,
        templatePath: templatePath,
        type,
        filter: filter.map(f => f.toString()),
      });
    });
    p.on('exit', () => {
      resolve();
    });
  });
}
