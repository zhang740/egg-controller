import { Controller } from 'egg';
import { route } from '../../../../../lib';
import { BadRequestError } from '../../../../../lib/error';

export class TypeFormatController extends Controller {
  @route('/typeformat/string')
  string(data: string) {
    if (typeof data !== 'string') {
      throw new BadRequestError(`${typeof data} ${data}`);
    }
  }

  @route('/typeformat/number')
  number(data: number) {
    if (typeof data !== 'number') {
      throw new BadRequestError(`${typeof data} ${data}`);
    }
  }

  @route('/typeformat/boolean')
  boolean(data: boolean) {
    if (typeof data !== 'boolean') {
      throw new BadRequestError(`${typeof data} ${data}`);
    }
  }

  @route('POST /typeformat/boolean')
  booleanPost(data: boolean) {
    if (typeof data !== 'boolean') {
      throw new BadRequestError(`${typeof data} ${data}`);
    }
  }
}
