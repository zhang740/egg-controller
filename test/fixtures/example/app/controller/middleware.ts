import { route, getParamDataObj, MiddlewareType } from '../../../../../lib';
import { ForbiddenError, BadRequestError } from '../../../../../lib/error';

const errorMiddleware: MiddlewareType = (app, typeInfo) => {
  return async (ctx, next) => {
    throw new BadRequestError();
  };
};
const asyncMiddleware: MiddlewareType = (app, typeInfo) => {
  return async (ctx, next) => {
    const params = await getParamDataObj(ctx, typeInfo);
    if (params.type === 'block') {
      throw new ForbiddenError(params.type);
    }
    return next();
  };
};

const genMiddleware: MiddlewareType = (app, typeInfo) => {
  return function* (ctx, next) {
    const params = yield getParamDataObj(ctx, typeInfo);
    if (params.type === 'block') {
      throw new ForbiddenError(params.type);
    }
    return next();
  };
};


export class MiddlewareController {

  @route({ url: '/mw/amw', name: 'async function & middleware', middleware: [asyncMiddleware] })
  async amw(type: string) {
    return `amwCtrl:${type}`;
  }

  @route({ url: '/mw/agmw', name: 'async function & gen middleware', middleware: [genMiddleware] })
  async agmw(type: string) {
    return `agmwCtrl:${type}`;
  }

  @route({ url: '/mw/gamw', name: 'gen function & async middleware', middleware: [asyncMiddleware] })
  * gamw(type: string) {
    return `gamwCtrl:${type}`;
  }

  @route({ url: '/mw/ggmw', name: 'gen function & middleware', middleware: [genMiddleware] })
  async ggmw(type: string) {
    return `ggmwCtrl:${type}`;
  }

  @route({ url: '/mw/multi', name: 'async function & middleware', middleware: [asyncMiddleware, errorMiddleware] })
  async multi() {
    return `multi`;
  }
}
