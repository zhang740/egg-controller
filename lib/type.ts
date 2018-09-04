import { Application, Context } from 'egg';
import { MethodType } from './util';
export { MethodType };
import { ParamInfoType } from './param';

/** 注解元信息 */
export interface RouteMetadataType<ExtType = any> {
  /** router name */
  name?: string;
  /** http method */
  method?: MethodType | MethodType[];
  /** http path */
  url?: string | RegExp | string[] | RegExp[] | ((app: Application) => string);
  /** router description */
  description?: string;
  /** before middleware of router */
  middleware?: MiddlewareType[];
  /** router extinfo */
  extInfo?: ExtType;
  /** callback of the router function throw error */
  onError?: (ctx: Context, error: Error) => void;
  /** param valid metadata */
  validateMetaInfo?: any[];
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
export type MiddlewareType = (app: Application, typeInfo: RouteType) => MiddlewareFunctionType | MiddlewareFunctionType[];

/** 路由类型信息 */
export interface RouteType<ExtType = any> extends RouteMetadataType<ExtType> {
  typeClass: any;
  typeGlobalName: string;
  functionName: string;
  paramTypes: ParamInfoType[];
  returnType: any;
  call: () => (ctx: Context) => any;
}
