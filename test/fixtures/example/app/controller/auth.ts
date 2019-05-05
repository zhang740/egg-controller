import { Controller } from 'egg';
import { route, controller } from '../../../../../lib';
import { DefaultAuth, ForbiddenAuth, NeedParamAuth, OptParamAuth } from '../auth/default';

@controller({ prefix: '/auth' })
export class AuthController extends Controller {
  @route({ auth: [DefaultAuth] })
  default() { }

  @route({ auth: [NeedParamAuth] })
  needParam() { }

  @route({ auth: [NeedParamAuth] })
  needParamOk(id: string) { }

  @route({ auth: [ForbiddenAuth] })
  forbidden() { }

  @route({ auth: [OptParamAuth] })
  opt(id?: string) { }
}
