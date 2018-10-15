import { Controller } from 'egg';
import { route, controller, MiddlewareType, getParamDataObj } from '../../../../../lib';

const ctrlMiddleware: MiddlewareType = (app, typeInfo) => {
  return async (ctx, next) => {
    const params = await getParamDataObj(ctx, typeInfo);
    if (params.type === 'mw') {
      ctx.body = 'ctrl:middleware';
      return;
    }
    return next();
  };
};

@controller({ name: 'Test for @controller', prefix: '/api/ctrl', middleware: [ctrlMiddleware] })
export class CtrlController extends Controller {
  @route()
  hi(type: string) {
    return type;
  }
}
