import { Context } from 'egg';
import { getGlobalType } from 'power-di/utils';
import { RouteType } from './type';
import { getValue } from './util';
export type ParamGetterType = (ctx: Context, name: string, type: any) => any;

export interface ParamInfoType {
  /** 函数参数名 */
  name: string;
  /** 请求参数名 */
  paramName: string;
  getter?: ParamGetterType;
  /** 参数类型 */
  type: any;
  hidden?: boolean;
  /** 增强参数类型，ts-metadata */
  validateType: any;
}

const extRules: {
  [typeKey: string]: {
    param: {
      [index: string]: ParamGetterType;
    },
    config: {
      [name: string]: {
        paramName: string,
        hidden?: boolean,
        source?: string,
      };
    },
  }
} = {};

const getRuleKey = (target: any, key: any) => `${getGlobalType(target.constructor)}_${key}`;

export function getMethodRules(target: any, key: string) {
  const ruleKey = getRuleKey(target, key);
  if (!extRules[ruleKey]) {
    extRules[ruleKey] = {
      param: {},
      config: {},
    };
  }
  return extRules[ruleKey];
}

export function FromCustom(custom: ParamGetterType, paramName?: string, config?: {
  hidden?: boolean;
  source?: string;
}): ParameterDecorator {
  return (target, key, index) => {
    const methodRule = getMethodRules(target, key as string);
    methodRule.param[index] = custom;
    methodRule.config[index] = {
      paramName,
      ...config,
    };
  };
}
export function FromBody(paramName?: string): ParameterDecorator {
  return FromCustom(
    (ctx: Context, name: string) => (ctx.request.body as any)[paramName || name],
    paramName,
    { source: 'Body' }
  );
}
export function FromParam(paramName?: string): ParameterDecorator {
  return FromCustom(
    (ctx: Context, name: string) => (ctx.params as any)[paramName || name],
    paramName,
    { source: 'Param' }
  );
}
export function FromQuery(paramName?: string): ParameterDecorator {
  return FromCustom(
    (ctx: Context, name: string) => (ctx.query as any)[paramName || name],
    paramName,
    { source: 'Query' }
  );
}
export function FromHeader(paramName?: string): ParameterDecorator {
  return FromCustom(
    (ctx: Context, name: string) => (ctx.request.header as any)[paramName || name],
    paramName,
    { source: 'Header' }
  );
}

async function getArgs(ctx: Context, typeInfo: RouteType) {
  return await Promise.all(typeInfo.paramTypes.map(async p => {
    const name = p.name;
    let argValue = undefined;

    const type = getValue(() => p.validateType.type, p.type);

    // 获取参数值
    if (p.getter) {
      argValue = await p.getter(ctx, name, p.type);
    } else {
      const param = ctx.params || {};
      const query = ctx.query || {};
      const queries = ctx.queries || {};
      const body = (ctx.request || {} as any).body || {};

      const isArrayType = typeof type === 'string' ? type.toLowerCase() === 'array' : type === Array;

      if (name in param) {
        argValue = param[name];
      } else if (name in query && !isArrayType) {
        argValue = query[name];
      } else if (`${name}[]` in queries && isArrayType) {
        // query传参支持数组形式 /xxx?a[]=1&a[]=2 => a = [1, 2]
        argValue = queries[`${name}[]`];
      } else if (name in body) {
        argValue = body[name];
      }
    }

    if (argValue === undefined) {
      return argValue;
    }

    // 类型转换
    switch (type) {
      case Number:
      case 'number':
        argValue = parseFloat(argValue);
        break;

      case 'int':
      case 'integer':
        argValue = parseInt(argValue);
        break;

      case Date:
      case 'date':
      case 'dateTime':
      case 'datetime':
        argValue = new Date(argValue);

      case Boolean:
      case 'boolean':
        if (argValue === 'true' || argValue === '1' || argValue === 1) {
          argValue = true;
        } else if (argValue === 'false' || argValue === '0' || argValue === 0) {
          argValue = false;
        }
        break;

      case Object:
      case undefined:
        try {
          argValue = JSON.parse(argValue);
        } catch (error) {
        }
        break;

      // TODO 自定义类型，new实例，或者属性赋值

      // string, enum 无需转换
    }

    return argValue;
  }));
}

const ParamSymbol = Symbol('Params#EggARoute');
export async function getParamData(ctx: Context, typeInfo?: RouteType) {
  if (!Object.getOwnPropertyDescriptor(ctx, ParamSymbol) && typeInfo) {
    // lock, because `getArgs` is async function.
    Object.defineProperty(ctx, ParamSymbol, {
      enumerable: false,
      configurable: true,
      writable: true,
    });

    Object.defineProperty(ctx, ParamSymbol, {
      enumerable: false,
      configurable: false,
      writable: false,
      value: await getArgs(ctx, typeInfo),
    });
  }
  return (ctx as any)[ParamSymbol] as any[];
}

export async function getParamDataObj(ctx: Context, typeInfo: RouteType) {
  const paramData = await getParamData(ctx, typeInfo);
  const paramObj: any = {};
  typeInfo.paramTypes.forEach((pt, i) => {
    paramObj[pt.name] = paramData[i];
  });
  return paramObj;
}
