import 'reflect-metadata';
import * as co from 'co';
import { Context } from 'egg';
import { getGlobalType } from 'power-di/utils';
import { getInstance } from 'egg-aop';
import { getParameterNames, getNameAndMethod, isGeneratorFunction } from './util';
import { RouteType, RouteMetadataType, MiddlewareType } from './type';
import { ParamInfoType, getMethodRules, getParamData } from './param';
import { paramValidateMiddleware } from './middleware/param';

let defaultMiddleware: MiddlewareType[] = [];

export function addDefaultMiddleware(middleware: MiddlewareType | MiddlewareType[]) {
  defaultMiddleware = defaultMiddleware.concat(middleware);
}

const routes: RouteType[] = [];

/** 路由注解 */
export function route<T = any>(url?: string | RegExp | RouteMetadataType<T>, data: RouteMetadataType<T> = {}): MethodDecorator {
  if (typeof url === 'string' || url instanceof RegExp) {
    data.url = url;
  } else if (url) {
    // url is metadata
    data = url;
  }

  return function (target: any, key: string) {
    const typeGlobalName = getGlobalType(target.constructor);
    const CtrlType = target.constructor;
    const routeFn: Function = target[key];

    const paramTypes = Reflect.getMetadata('design:paramtypes', target, key) || [];

    /** from @ali/ts-metadata */
    const validateMetaInfo: any[] = [
      ...(Reflect.getMetadata('custom:validateRule', target, key) || data.validateMetaInfo || [])
    ];

    const methodRules = getMethodRules(target, key);

    const typeInfo: RouteType = {
      onError: function (_ctx, err) {
        throw err;
      },
      ...data,
      typeGlobalName,
      typeClass: CtrlType,
      functionName: key,
      paramTypes: getParameterNames(routeFn).map((name, i) => {
        const config = methodRules.config[i] || {} as ParamInfoType;
        const validateTypeIndex = validateMetaInfo.findIndex(v => v.name === name);
        return {
          name,
          type: paramTypes[i],
          paramName: config.paramName,
          getter: methodRules.param[i],
          hidden: config.hidden,
          validateType: validateTypeIndex >= 0 ?
            validateMetaInfo.splice(validateTypeIndex, 1)[0].rule : undefined,
        };
      }),
      returnType: Reflect.getMetadata('design:returntype', target, key),
      middleware: (data.middleware || []),
      call: () => target[key],
    };
    if (validateMetaInfo.length) {
      throw new Error(`[egg-controller] route: ${typeGlobalName}.${key} param validate defined error! no param use: ${JSON.stringify(validateMetaInfo)}`);
    }

    const parsedPath = getNameAndMethod(typeInfo.functionName);
    if (!typeInfo.url) {
      const ctrl = typeGlobalName
        .split('_')[0]
        .toLowerCase()
        .replace('controller', '');
      typeInfo.url = `/${ctrl}/${parsedPath.name}`;
    } else if (typeof typeInfo.url === 'string') {
      const methodAndPath = typeInfo.url.split(/\s+/).map(s => s.trim());
      if (
        methodAndPath.length > 1 &&
        ['get', 'put', 'post', 'delete', 'patch'].indexOf(methodAndPath[0].toLowerCase()) >= 0
      ) {
        typeInfo.method = [...new Set([]
          .concat(methodAndPath[0] || [])
          .concat(typeInfo.method || []))
        ];
        typeInfo.url = methodAndPath[1];
      }
    }

    if (!typeInfo.method) {
      typeInfo.method = parsedPath.method;
    }

    routes.push(typeInfo);

    // ensure initMiddleware is execute first
    typeInfo.middleware.unshift(...defaultMiddleware);
    // add param validate middleware
    typeInfo.middleware.push(paramValidateMiddleware);

    // catch the middleware error for onError
    typeInfo.middleware = typeInfo.middleware.map(mw => {
      return (app: any, typeInfo: RouteType) => {
        const func: any = mw(app, typeInfo);
        return [].concat(func).filter(s => s).map(item => {
          return async function (ctx: any, next: any) {
            try {
              if (isGeneratorFunction(item)) {
                return await co(item.apply(this, [ctx, next]));
              } else {
                return await item.apply(this, [ctx, next]);
              }
            } catch (error) {
              typeInfo.onError(ctx, error);
            }
          };
        });
      };
    });

    let value: any = routeFn;

    value = async function (this: any, ctx: Context) {
      // 'this' maybe is Controller or Context, in Chair.
      ctx = (this.request && this.response ? this : this.ctx) || ctx;
      const ctrl = getInstance(CtrlType, ctx.app, ctx);
      const args = await getParamData(ctx, typeInfo);
      try {
        let ret;
        if (isGeneratorFunction(routeFn)) {
          ret = await co(ctrl[key](...args));
        } else {
          ret = await Promise.resolve(ctrl[key](...args));
        }
        if (ret instanceof Error) {
          if (ctx.app.env === 'local') {
            throw new Error('请 throw Error 替代 return Error');
          } else {
            throw ret;
          }
        } else if (ret !== undefined) {
          ctx.body = ret;
        }

        const { ret404WhenNoChangeBody } = ctx.app.config.controller.compatible;
        if (!ret404WhenNoChangeBody && ctx.body === undefined && ctx.status === 404) {
          ctx.status = 204;
        }
        return ret;
      } catch (error) {
        typeInfo.onError(ctx, error);
      }
    };

    value.__name = key;
    typeInfo.call = () => value;
  };
}

/** 路由列表 */
export function getRoutes<ExtType = any>() {
  return routes as RouteType<ExtType>[];
}
