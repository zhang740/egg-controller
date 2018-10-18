import * as co from 'co';
import { Controller, Application } from 'egg';
import { getGlobalType } from 'power-di/utils';
import { ControllerMetadataType, ControllerType, RouteType, MiddlewareType, MethodType } from './type';
import { isGeneratorFunction, getNameAndMethod, getCurrentLoadFilePath } from './util';
import { route } from './route';

const CtrlMetaSymbol = Symbol('CtrlMetaSymbol');
const controllers: ControllerType[] = [];
/** 控制器列表 */
export function getControllers(app?: Application) {
  controllers
    .filter(info => !info.init)
    .forEach(info => initController(info.classType, app));
  return controllers;
}
/** 路由列表 */
export function getRoutes<ExtType = any>(app?: Application): RouteType<ExtType>[] {
  return getControllers(app).map(ctrl => ctrl.routes)
    .reduce((pv, cv) => pv.concat(cv), []);
}

/** global default middleware */
const defaultMiddleware: MiddlewareType[] = [];
export function addDefaultMiddleware(middleware: MiddlewareType | MiddlewareType[]) {
  defaultMiddleware.push(...[].concat(middleware));
}

export function getControllerMetadata(CtrlType: any): ControllerType {
  const descriptor = Object.getOwnPropertyDescriptor(CtrlType, CtrlMetaSymbol);
  if (!descriptor) {
    const value: ControllerType = {
      classType: CtrlType,
      filePath: getCurrentLoadFilePath(),
      routes: [],
      middleware: [],
      init: false,
    };
    controllers.push(value);
    Object.defineProperty(CtrlType, CtrlMetaSymbol, {
      enumerable: false,
      configurable: false,
      value,
    });
    return getControllerMetadata(CtrlType);
  }
  return descriptor.value;
}

export function controller(meta: ControllerMetadataType = {}) {
  return (target) => {
    const metadata = getControllerMetadata(target);
    Object.assign(metadata, meta);
  };
}

function initController(target: any, app?: Application) {
  const typeGlobalName = getGlobalType(target);
  const metadata = getControllerMetadata(target);
  if (metadata.init) {
    return;
  }
  metadata.init = true;

  const prefix = (metadata.prefix) ||
    `/${typeGlobalName.split('_')[0].toLowerCase().replace('controller', '')}`;

  if (metadata.restful) {
    const restDefine: { name: string, method: MethodType, path: string }[] = [
      { name: 'index', method: 'get', path: `${prefix}` },
      { name: 'new', method: 'get', path: `${prefix}/new` },
      { name: 'show', method: 'get', path: `${prefix}/:id` },
      { name: 'edit', method: 'get', path: `${prefix}/:id/edit` },
      { name: 'create', method: 'post', path: `${prefix}` },
      { name: 'update', method: 'put', path: `${prefix}/:id` },
      { name: 'destroy', method: 'delete', path: `${prefix}/:id` },
    ];
    restDefine.forEach(rest => {
      const func = target.prototype[rest.name];

      if (typeof func !== 'function') {
        return;
      }
      const routeInfo = metadata.routes.find(r => r.functionName === rest.name);
      if (routeInfo) {
        if (!routeInfo.method) routeInfo.method = rest.method;
        if (!routeInfo.url) routeInfo.url = rest.path;
      } else {
        route({
          method: rest.method, url: rest.path,
        })(target.prototype, rest.name, undefined);
      }
    });
  }

  metadata.routes.forEach(route => {
    route.middleware.unshift(...metadata.middleware);
    route.middleware.unshift(...defaultMiddleware);

    // catch the middleware error for onError
    route.middleware = route.middleware.map(mw => {
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

    /** complete path & method info */
    const parsedPath = getNameAndMethod(route.functionName);
    if (!route.url) {
      route.url = `${prefix}/${parsedPath.name}`;
    } else if (typeof route.url === 'string') {
      const methodAndPath = route.url.split(/\s+/).map(s => s.trim());
      if (
        methodAndPath.length > 1 &&
        ['get', 'put', 'post', 'delete', 'patch'].indexOf(methodAndPath[0].toLowerCase()) >= 0
      ) {
        route.method = [...new Set([]
          .concat(methodAndPath[0] || [])
          .concat(route.method || []))
        ];
        route.url = methodAndPath[1];
      }
    }
    if (!route.method) {
      route.method = parsedPath.method;
    }

    if (app) {
      route.url = typeof route.url === 'function' ? route.url(app) : route.url;
    }

    // parse params in path
    [].concat(route.url)
      .forEach(url => {
        if (typeof url === 'string') {
          url.split('/').forEach(item => {
            if (item.startsWith(':')) {
              const paramName = item.substr(1);
              if (route.paramTypes.every(pt => pt.paramName !== paramName)) {
                route.paramTypes.push({
                  name: paramName,
                  paramName: paramName,
                  type: String,
                  source: 'Param',
                  validateType: undefined,
                });
              }
            }
          });
        }
      });
  });
}

export abstract class RESTfulController extends Controller {
  abstract index(): any;
  abstract new(): any;
  abstract show(id: any): any;
  abstract edit(id: string): any;
  abstract create(): any;
  abstract update(id: string): any;
  abstract destroy(id: string): any;
}
