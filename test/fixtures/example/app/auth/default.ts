import { BaseAuth } from '../../../../../lib';
import { ForbiddenError } from '../../../../../lib/error';
import { opt } from '../../../../../lib/auth/BaseAuth';

export class DefaultAuth extends BaseAuth {
  async has(): Promise<boolean> {
    return true;
  }
}

export class NeedParamAuth extends BaseAuth {
  async has(id: string): Promise<boolean> {
    return id === '123';
  }
}

export class ForbiddenAuth extends BaseAuth {
  has(): Promise<boolean> {
    throw new ForbiddenError();
  }
}

export class OptParamAuth extends BaseAuth {
  async has(@opt() id: string): Promise<boolean> {
    return !id || id === 'opt';
  }
}
