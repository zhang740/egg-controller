import * as path from 'path';

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
      /** generate code type, support ts/js */
      type: 'ts' as 'ts' | 'js',
      /** generate code dir path */
      SDKDir: path.join('app', 'assets', 'service'),
      /** generate template */
      templatePath: '',
      /** route filter for generate */
      filter: [/^\/api\//g] as RegExp[],
    },
    compatible: {
      /**
       * return 404 when controller didn't change ctx.body (egg default)
       * if 'false', will return 204
       */
      ret404WhenNoChangeBody: false,
    }
  },
  aop: {
    autoRegisterToCtx: true,
  },
};
