import { getInstance } from 'egg-aop';
import { BadRequestError, ForbiddenError } from '../error';
import { getParamDataObj } from '../param';
import { getRoleInfo, BaseAuth } from '../auth/BaseAuth';
import { Context, Application } from 'egg';
import { RouteType } from '../type';

export const SkipAuthSymbol = Symbol('SkipAuthSymbol');
export const authMiddleware = (app: Application, typeInfo: RouteType) => {
  if (!app.config.controller.auth) {
    return;
  }
  return async (ctx: Context, next: any) => {
    if ((ctx as any).SkipAuthSymbol) {
      return next();
    }
    const paramObj = await getParamDataObj(ctx, typeInfo);
    await Promise.all(
      (typeInfo.auth || [])
        .map(async permRole => {
          const params = getRoleInfo(permRole).params.map(p => {
            if (paramObj[p] === undefined) {
              throw new BadRequestError(`Permission [${permRole.name}] NEED Param [${p}]`);
            }
            return paramObj[p];
          });
          if (!(await getInstance<BaseAuth>(permRole, ctx.app, ctx).has(...params))) {
            throw new ForbiddenError(
              `Forbidden, Need: [${permRole.displayName || permRole.name}] Permission.`
            );
          }
        })
        .filter(r => r)
    );

    return next();
  };
};
