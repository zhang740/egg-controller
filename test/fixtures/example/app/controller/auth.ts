import { Controller } from 'egg';
import { route, controller } from '../../../../../lib';
import { DefaultAuth, ForbiddenAuth, NeedParamAuth } from '../auth/default';

@controller({ prefix: '/auth' })
export class AuthController extends Controller {
  @route({ auth: [DefaultAuth] })
  default() {}

  @route({ auth: [NeedParamAuth] })
  needParam() {}

  @route({ auth: [NeedParamAuth] })
  needParamOk(id: string) {}

  @route({ auth: [ForbiddenAuth] })
  forbidden() {}
}
