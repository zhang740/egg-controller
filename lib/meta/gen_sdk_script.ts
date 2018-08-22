import * as path from 'path';
import { genAPISDK, RouteMetadataType } from 'api-gensdk';
import { getRoutes } from '../route';
import { getGlobalType } from 'power-di/utils';

function getType(data: { type: string, itemType?: string, values?: string[] }): string {
  switch (data && data.type) {
    case 'number':
    case 'int':
    case 'integer':
      return 'number';

    case 'date':
    case 'dateTime':
    case 'datetime':
      return 'Date';

    case 'string':
    case 'email':
    case 'password':
    case 'url':
      return 'string';

    case 'boolean':
      return 'boolean';

    case 'enum':
      return data.values ? data.values.map(v => `'${v}'`).join(' | ') : 'any';

    case 'array':
      return `${getType({ type: data.itemType })}[]`;

    default:
      return 'any';
  }
}

process.on('message', (message: {
  targetSDKDir: string, files: string[], templatePath: string, filter: string[], type: 'js' | 'ts'
}) => {
  try {
    const { targetSDKDir, files, templatePath, filter, type } = message;
    files.forEach(file => require(file));
    genAPISDK(
      getRoutes().filter(route => {
        return filter.some(r => {
          const match = r.match(new RegExp('^/(.*?)/([gimyu]*)$'));
          const regex = new RegExp(match[1], match[2]);
          return [].concat(route.url).some(url => regex.test(url.toString()));
        });
      }).map(route => {
        let url: string = [].concat(route.url)[0];
        const urlPaths = url.split('/');
        const paramTypes = route.paramTypes.filter(pt => !pt.hidden);

        paramTypes.forEach(pt => {
          if (urlPaths.indexOf(`:${pt.name}`) >= 0) {
            url = url.replace(`:${pt.name}`, `\${${pt.name}}`);
          }
        });

        return {
          className: route.typeGlobalName,
          name: route.name || '[暂无名称]',
          description: route.description || '',
          functionName: route.functionName,
          method: [].concat(route.method).find(m =>
            ['get', 'post', 'put', 'delete', 'patch'].indexOf(m.toLowerCase()) >= 0
          ),
          url,
          params: paramTypes.map(pt => {
            let type = pt.validateType ?
              getType(pt.validateType) :
              getType({ type: getGlobalType(pt.type).toLowerCase() });
            return { name: pt.name, paramName: pt.paramName || pt.name, type };
          }),
        } as RouteMetadataType;
      }),
      {
        sdkDir: targetSDKDir,
        templatePath: templatePath || path.join(targetSDKDir, 'sdk.njk'),
        type,
      });
  } catch (error) {
    console.log('[GenSDK Error]', error);
  }
  process.exit(0);
});
process.send('gensdk:ready');
