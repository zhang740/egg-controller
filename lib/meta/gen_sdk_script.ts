import { genFromData, CliConfig } from 'openapi-generator';
import { getRoutes } from '../controller';
import { loadFile } from '../util';
import { convertToOpenAPI } from '../openapi';
import { EggAppConfig } from 'egg';

process.on(
  'message',
  (message: { files: string[]; filter: string[]; config: CliConfig; appConfig: EggAppConfig }) => {
    try {
      const { files, filter, config, appConfig } = message;

      if (config.hook) {
        Object.keys(config.hook).forEach(key => {
          if (typeof config.hook[key] === 'string') {
            config.hook[key] = new Function(`return ${config.hook[key]}`)();
          }
        });
      }

      files.forEach(file => loadFile(file));
      const openAPIData = convertToOpenAPI(
        {
          base: { version: '1.0', title: '' },
        },
        getRoutes(appConfig).filter(route => {
          return filter.some(r => {
            const match = r.match(new RegExp('^/(.*?)/([gimyu]*)$'));
            const regex = new RegExp(match[1], match[2]);
            return [].concat(route.url).some(url => regex.test(url.toString()));
          });
        })
      );

      genFromData(
        {
          ...config,
        },
        openAPIData
      );
    } catch (error) {
      console.log('[GenSDK Error]', error);
    }
    process.exit(0);
  }
);
process.send('gensdk:ready');
