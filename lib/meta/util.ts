import * as fs from 'fs';
import * as path from 'path';
import { getGlobalType } from 'power-di/lib/utils';
import { getRoutes, RouteMetadataType, ParamInfoType } from '../';
import * as nunjucks from 'nunjucks';

export function toHyphenCase(s: string) {
  s = s.replace(/([A-Z])/g, '_$1').toLowerCase();
  if (s.startsWith('_')) {
    s = s.substr(1);
  }
  return s;
}

export function toCamelCase(s: string) {
  return s.replace(/_(\w)/g, function (_all, letter) {
    return letter.toUpperCase();
  });
}

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

function mkdir(dir: string) {
  if (!fs.existsSync(dir)) {
    mkdir(path.dirname(dir));
    fs.mkdirSync(dir);
  }
}

export class GenConfig {
  /** filename style */
  camelCase?: boolean = false;
  /** gen type */
  type?: 'ts' | 'js' = 'ts';
  /** route filter */
  filter?: (route: RouteMetadataType) => boolean;
}

/**
 * 生成APISDK
 * @param sdkDir
 * @param templatePath
 * @param config camelCase type filter
 */
export function genAPISDK(
  sdkDir: string,
  templatePath: string,
  config?: GenConfig
) {
  config = { ...new GenConfig, ...config || {} };
  mkdir(sdkDir);
  templatePath = templatePath || path.join(sdkDir, 'sdk.njk');
  if (!fs.existsSync(templatePath)) {
    console.log(`[genAPISDK] No template! ${templatePath}`);
    try {
      fs.writeFileSync(templatePath, fs.readFileSync(path.join(__dirname, 'sdk.njk')));

      const baseServiceFile = path.join(path.parse(templatePath).dir, 'base.ts');
      if (!fs.existsSync(baseServiceFile)) {
        fs.writeFileSync(baseServiceFile, fs.readFileSync(path.join(__dirname, 'base.njk')));
      }
    } catch (error) {
      console.log('[genAPISDK] Write default template error!', error);
      return;
    }
  }

  // 模版中函数支持的变量
  const metadata: {
    [key: string]: {
      name: string,
      description: string,
      functionName: string,
      method: string,
      url: string,
      params: {
        /** 函数参数名 */
        name: string,
        /** 请求参数名 */
        paramName: string,
        /** 类型 */
        type: string,
      }[],
    }[],
  } = {};

  getRoutes()
    .filter(route => {
      if (config.filter) {
        return config.filter(route);
      }
      return true;
    })
    .forEach(route => {
      const ClassName = route.typeGlobalName;

      if (!metadata[ClassName]) {
        metadata[ClassName] = [];
      }
      const clsMetadata = metadata[ClassName];

      let url: string = [].concat(route.url)[0];
      const urlPaths = url.split('/');
      const paramTypes = route.paramTypes.filter(pt => !pt.hidden);

      let sendData: ParamInfoType[] = [];
      paramTypes.forEach(pt => {
        if (urlPaths.indexOf(`:${pt.name}`) >= 0) {
          url = url.replace(`:${pt.name}`, `\${${pt.name}}`);
        } else {
          sendData.push(pt);
        }
      });

      clsMetadata.push({
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
      });
    });

  const fileTemplate = fs.readFileSync(templatePath, 'utf8');
  Object.keys(metadata).forEach(className => {
    const typeName = className.replace('Controller', '');

    const fileContent = nunjucks.renderString(fileTemplate, {
      genType: config.type,
      className: typeName[0].toLowerCase() + typeName.slice(1),
      methodMetadata: metadata[className],
    });

    const filePath = path.join(
      sdkDir,
      `${config.camelCase ? typeName : toHyphenCase(typeName)}.${config.type}`,
    );
    fs.writeFileSync(filePath, fileContent, { encoding: 'utf8' });
    console.log('[GenSDK] gen', filePath);
  });
}
