import * as path from 'path';
import { CliConfig } from 'openapi-generator';

export default {
  controller: {
    /** auto load controller in 'ctrlDir', only require file, can't load to ctx */
    autoLoad: true,
    /** controllers dir path，support array */
    ctrlDir: path.join('app', 'controller') as string | string[],
    /** param validate */
    paramValidate: true,
    /** generate frontend request sdk */
    genSDK: {
      enable: false,
      sdkDir: path.join('app', 'assets', 'service'),
      /** route filter for generate, default: ^\/api\/ */
      filter: [/^\/api\//g],
      type: 'ts',
      serviceType: 'class',
      camelCase: true,
    } as { enable: boolean, filter?: RegExp[] } & CliConfig,
    /** api info report */
    apiReport: {
      enable: false,
      /** send url, data is OpenAPI 3.0 schema json data */
      url: '',
    },
    /** RSA key */
    encrypt: {
      publicKey: '',
      privateKey: '',
      /** PKCS8 | PKCS1 (default) */
      type: 'PKCS1',
    },
    compatible: {
      /**
       * return 404 when controller didn't change ctx.body (egg default)
       * if 'false', will return 204 (default)
       */
      ret404WhenNoChangeBody: false,
    }
  },
  aop: {
    autoRegisterToCtx: true,
  },
};
