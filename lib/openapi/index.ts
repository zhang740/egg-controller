import {
  OpenApiBuilder,
  InfoObject,
  ContactObject,
  TagObject,
  OperationObject,
  ResponsesObject,
  ParameterObject,
  SchemaObject,
  OpenAPIObject,
  RequestBodyObject,
} from 'openapi3-ts';
import { getGlobalType } from 'power-di/utils';
import { RouteType } from '../type';
import { getValue } from '../util';
import { getControllerMetadata } from '../controller';
import { ParamInfoType } from '../param';

/** convert routeData to OpenAPI(3.x) json schema */
export function convertToOpenAPI(
  info: {
    base: InfoObject;
    contact?: ContactObject;
  },
  data: RouteType[]
) {
  const builder = new OpenApiBuilder();
  builder.addInfo({
    ...info.base,
    title: info.base.title || '[untitled]',
    version: info.base.version || '0.0.0',
  });
  info.contact && builder.addContact(info.contact);

  const tags: TagObject[] = [];
  const paths: { [path: string]: { [method: string]: OperationObject } } = {};
  let typeCount = 1;

  data.forEach(item => {
    [].concat(item.url).forEach(url => {
      if (typeof url !== 'string') {
        // TODO
        return;
      }

      url = url
        .split('/')
        .map((item: string) => (item.startsWith(':') ? `{${item.substr(1)}}` : item))
        .join('/');

      if (!tags.find(t => t.name === item.typeGlobalName)) {
        const ctrlMeta = getControllerMetadata(item.typeClass);
        tags.push({
          name: item.typeGlobalName,
          description:
            (ctrlMeta && [ctrlMeta.name, ctrlMeta.description].filter(s => s).join(' ')) ||
            undefined,
        });
      }
      if (!paths[url]) {
        paths[url] = {};
      }
      [].concat(item.method).forEach((method: string) => {
        method = method.toLowerCase();

        function paramFilter(p: ParamInfoType) {
          if (p.source === 'Any') {
            return ['post', 'put'].every(m => m !== item.method);
          }
          return p.source !== 'Body';
        }

        function convertValidateToSchema(validateType: any) {
          if (validateType.type === 'object' && validateType.rule) {
            let properties: any = {};
            const required = [];
            Object.keys(validateType.rule).forEach(key => {
              properties[key] = convertValidateToSchema(validateType.rule[key]);
              if (validateType.rule[key].required) {
                required.push(key);
              }
            });

            const typeName = `GenType_${typeCount++}`;
            builder.addSchema(typeName, {
              type: validateType.type,
              required: required,
              properties,
            });
            return {
              $ref: `#/components/schemas/${typeName}`,
            };
          }

          return {
            type: validateType.type,
            items: validateType.itemType
              ? validateType.itemType === 'object'
                ? convertValidateToSchema(validateType.rule)
                : { type: validateType.itemType }
              : undefined,
            enum: Array.isArray(validateType.values)
              ? validateType.values.map(v => convertValidateToSchema(v))
              : undefined,
            maximum: validateType.max,
            minimum: validateType.min,
          } as SchemaObject;
        }
        function getTypeSchema(p: ParamInfoType) {
          if (p.schema) {
            return p.schema;
          } else if (p.validateType && p.validateType.type) {
            return convertValidateToSchema(p.validateType);
          } else {
            const type = getGlobalType(p.type);
            const isSimpleType = ['array', 'boolean', 'integer', 'number', 'object', 'string'].some(
              t => t === type.toLowerCase()
            );
            // TODO complex type process
            return {
              type: isSimpleType ? type.toLowerCase() : 'object',
              items:
                type === 'Array'
                  ? {
                      type: 'object',
                    }
                  : undefined,
            } as SchemaObject;
          }
        }

        // param
        const inParam = item.paramTypes.filter(paramFilter);

        // req body
        const inBody = item.paramTypes.filter(p => !paramFilter(p));
        let requestBody: RequestBodyObject;
        if (inBody.length) {
          const requestBodySchema: SchemaObject = {
            type: 'object',
            properties: {},
          };
          inBody.forEach(p => {
            if (p.required || getValue(() => p.validateType.required)) {
              if (!requestBodySchema.required) {
                requestBodySchema.required = [];
              }
              requestBodySchema.required.push(p.paramName);
            }
            requestBodySchema.properties[p.paramName] = getTypeSchema(p);
          });
          const reqBodyTypeName = `ReqType_${typeCount++}`;
          builder.addSchema(reqBodyTypeName, requestBodySchema);

          const reqMediaType = 'application/json';
          requestBody = {
            content: {
              [reqMediaType]: {
                schema: {
                  $ref: `#/components/schemas/${reqBodyTypeName}`,
                },
              },
            },
          };
        }

        // res
        const responses: ResponsesObject = {
          default: { description: 'default' },
        };

        paths[url][method] = {
          operationId: item.functionName,
          tags: [item.typeGlobalName],
          summary: item.name,
          description: item.description,
          parameters: inParam.length
            ? inParam.map(p => {
                const source =
                  p.source === 'Header' ? 'header' : p.source === 'Param' ? 'path' : 'query';
                return {
                  name: p.paramName,
                  in: source,
                  required:
                    source === 'path' || p.required || getValue(() => p.validateType.required),
                  schema: getTypeSchema(p),
                } as ParameterObject;
              })
            : undefined,
          requestBody,
          responses,
        };
      });
    });
  });

  tags.forEach(tag => builder.addTag(tag));
  Object.keys(paths).forEach(path => builder.addPath(path, paths[path]));
  return JSON.parse(builder.getSpecAsJson()) as OpenAPIObject;
}
