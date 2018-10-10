import * as Parameter from 'parameter';
import { Application, Context } from 'egg';
import { RouteType } from '../type';
import { getParamData } from '../param';
import { ParamValidateError } from '../error';

export function paramValidateMiddleware(app: Application, typeInfo: RouteType) {
  if (!app.config.controller.paramValidate) {
    return;
  }

  const parameter = new Parameter({ validateRoot: true });

  return async function (ctx: Context, next: any) {
    const paramData = await getParamData(ctx, typeInfo);
    typeInfo.paramTypes.forEach((param, index) => {
      if (!param.validateType) {
        return;
      }

      let errorMsg = 'param error';
      const paramName = param.name;
      const rule = { [paramName]: param.validateType };
      const data = typeof paramData[index] !== 'undefined' ? { [paramName]: paramData[index] } : {};

      const error = parameter.validate(rule, data);
      if (error) {
        const reason = [
          `param validate fail，paramName：${paramName}`,
          `Value：${JSON.stringify(paramData[index])}`,
          `Rule：${JSON.stringify(rule)}`,
          `Info：${JSON.stringify(error)}`,
        ].join(', ');
        if (ctx.app.env !== 'prod') {
          errorMsg = reason;
        } else {
          ctx.logger.info(`[egg-controller] param error, request: ${reason}`);
        }

        throw new ParamValidateError(errorMsg);
      }
    });
    return next();
  };
}
