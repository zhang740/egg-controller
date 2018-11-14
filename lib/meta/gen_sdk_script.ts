import { genSDK, genFromData, CliConfig } from 'openapi-generator';
import { getRoutes } from '../controller';
import { loadFile } from '../util';
import { convertToOpenAPI } from '../openapi';

process.on('message', (message: {
  files: string[], filter: string[], config: CliConfig
}) => {
  try {
    const { files, filter, config } = message;
    files.forEach(file => loadFile(file));
    const openAPIData = convertToOpenAPI({
      base: { version: '1.0', title: '' }
    }, getRoutes().filter(route => {
      return filter.some(r => {
        const match = r.match(new RegExp('^/(.*?)/([gimyu]*)$'));
        const regex = new RegExp(match[1], match[2]);
        return [].concat(route.url).some(url => regex.test(url.toString()));
      });
    }));

    genFromData({
      ...config,
    }, openAPIData);
  } catch (error) {
    console.log('[GenSDK Error]', error);
  }
  process.exit(0);
});
process.send('gensdk:ready');
