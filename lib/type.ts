import { Application, Context } from 'egg';
import { MethodType } from './util';
export { MethodType };
import { ParamInfoType } from './param';
import { SchemaObject } from 'openapi3-ts';

/** 路由注解元信息 */
export interface RouteMetadataType<ExtType = any> {
  /** router name */
  name?: string;
  /** http method */
  method?: MethodType | MethodType[];
  /** http path */
  url?: string | RegExp | string[] | RegExp[] | ((appConfig: any) => string);
  /** router description */
  description?: string;
  /** before middleware of router */
  middleware?: MiddlewareType[];
  /** router extinfo */
  extInfo?: ExtType;
  /** callback of the router function throw error */
  onError?: (ctx: Context, error: Error) => void;
  /**
   * @deprecated
   * param valid metadata
   * */
  validateMetaInfo?: {
    name: string;
    rule: {
      type: string | any;
      required?: boolean;
      default?: any;
      [other: string]: any;
    };
  }[];
  /** param schema */
  paramSchema?: { [name: string]: SchemaObject };
  /** RSA encrypt */
  encrypt?: boolean;

  /** close Tracking, default: false */
  noTracking?: boolean;
  /** bizLogger type */
  logType?: string;
  /** bizLogger action, which default to equal `${url}` */
  logAction?: string;
}

export type MiddlewareFunctionType = (ctx: any, next: any) => any;
/** 路由中间件类型 */
export type MiddlewareType = (
  app: Application,
  typeInfo: RouteType
) => MiddlewareFunctionType | MiddlewareFunctionType[];

/** 路由类型信息 */
export interface RouteType<ExtType = any> extends RouteMetadataType<ExtType> {
  readonly typeClass: any;
  readonly typeGlobalName: string;
  readonly functionName: string;
  paramTypes: ParamInfoType[];
  returnType: any;
  function: Function;
}

/** 控制器注解元信息 */
export interface ControllerMetadataType {
  name?: string;
  description?: string;
  /** prefix for @route url */
  prefix?: string;
  /** middleware of the class's routers, earlier than router's middleware */
  middleware?: MiddlewareType[];
  /** gen rest urls */
  restful?: boolean;
}

/** 控制器类型信息 */
export interface ControllerType extends ControllerMetadataType {
  /** file path of controller */
  readonly filePath: string;
  readonly classType: any;
  init: boolean;
  routes: RouteType[];
}
