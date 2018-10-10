import {
  OpenApiBuilder, InfoObject, ContactObject, TagObject,
  OperationObject, ResponsesObject, ParameterObject, MediaTypeObject, SchemaObject,
} from 'openapi3-ts';
import { getGlobalType } from 'power-di/utils';
import { RouteType } from '../type';
import { getValue } from '../util';
import { getControllerMetadata } from '../controller';

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
          const ctrlMeta = getControllerMetadata(item.typeClass);
          tags.push({
            name: item.typeGlobalName,
            description: ctrlMeta && `${ctrlMeta.name || ''} ${ctrlMeta.description || ''}`,
          });
        }
        if (!paths[url]) {
          paths[url] = {};
        }
        [].concat(item.method).forEach((method: string) => {
          method = method.toLowerCase();

          const hasBody = ['post', 'put'].some(m => m === item.method);
          const paramFilter = p => {
            if (p.source === 'Any') {
              return !hasBody;
            }
            return p.source !== 'Body';
          };

          const inParam = item.paramTypes.filter(paramFilter);
          const inBody: MediaTypeObject = {
            schema: {
              properties: {},
            },
          };
          item.paramTypes.filter(p => !paramFilter(p))
            .forEach(p => {
              const type = getValue(() => p.validateType.type, getGlobalType(p.type)).toLowerCase();
              const props = (inBody.schema as SchemaObject).properties;
              props[p.paramName || p.name] = {
                type,
                items: type === 'array' ? {
                  type: getValue(() => p.validateType.itemType, 'object'),
                } : undefined,
              };
            });

          const responses: ResponsesObject = {
            default: { description: 'default' }
          };

          paths[url][method] = {
            tags: [item.typeGlobalName],
            summary: item.name,
            description: item.description,
            parameters: inParam.length ? inParam.map(p => {
              const type = getValue(() => p.validateType.type, getGlobalType(p.type)).toLowerCase();
              const source = p.source === 'Header' ? 'header' :
                p.source === 'Param' ? 'path' :
                  'query';
              return {
                name: p.paramName || p.name,
                in: source,
                required: source === 'path' || getValue(() => p.validateType.required),
                schema: {
                  type: ['array', 'boolean', 'integer', 'number', 'object', 'string']
                    .some(t => t === type) ? type : 'object',
                  items: type === 'array' ? {
                    type: getValue(() => p.validateType.itemType, 'object'),
                  } : undefined,
                },
              } as ParameterObject;
            }) : undefined,
            requestBody: hasBody ? {
              content: {
                'application/json': inBody,
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
