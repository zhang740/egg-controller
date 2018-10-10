import {
  OpenApiBuilder, InfoObject, ContactObject, TagObject,
  OperationObject, ResponsesObject, ParameterObject,
} from 'openapi3-ts';
import { getGlobalType } from 'power-di/utils';
import { RouteType } from '../type';
import { getValue } from '../util';

/** convert routeData to OpenAPI(3.x) json schema */
export function convertToOpenAPI(info: {
  base: InfoObject, contact?: ContactObject,
}, data: RouteType[]) {
  const builder = new OpenApiBuilder();
  builder.addInfo({
    ...info.base,
    title: info.base.title || '[untitled]',
    version: info.base.version || '0.0.0',
  });
  info.contact && builder.addContact(info.contact);

  const tags: TagObject[] = [];
  const paths: { [path: string]: { [method: string]: OperationObject } } = {};
  data.forEach(item => {
    [].concat(item.url).forEach(url => {
      if (typeof url === 'string') {
        if (!tags.find(t => t.name === item.typeGlobalName)) {
          tags.push({
            name: item.typeGlobalName,
            description: item.description,
          });
        }
        if (!paths[url]) {
          paths[url] = {};
        }
        [].concat(item.method).forEach((method: string) => {
          method = method.toLowerCase();

          const params = item.paramTypes;
          const responses: ResponsesObject = {
            default: { description: 'default' }
          };

          paths[url][method] = {
            tags: [item.typeGlobalName],
            summary: item.name,
            description: item.description,
            parameters: params.length ? params.map(p => {
              const type = getValue(() => p.validateType.type, getGlobalType(p.type)).toLowerCase();
              return {
                name: p.paramName || p.name,
                in: 'query',
                schema: {
                  type: ['array', 'boolean', 'integer', 'number', 'object', 'string']
                    .some(t => t === type) ? type : 'object',
                  items: type === 'array' ? {
                    type: getValue(() => p.validateType.itemType, 'object'),
                  } : undefined,
                },
              } as ParameterObject;
            }) : undefined,
            requestBody: ['post', 'put'].find(m => m === item.method) ? {
              content: {
                'application/json': {
                  schema: {},
                  example: { value: {} }
                }
              },
            } : undefined,
            responses,
          };
        });
      } else {
        // TODO
      }
    });
  });

  tags.forEach(tag => builder.addTag(tag));
  Object.keys(paths).forEach(path => builder.addPath(path, paths[path]));
  return JSON.parse(builder.getSpecAsJson());
}
