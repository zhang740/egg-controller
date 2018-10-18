import { Controller } from 'egg';
import { route } from '../../../../../lib';

export class IndexController extends Controller {
  @route('/')
  hi() {
    return `hi, egg`;
  }

  @route('/pathParamTest/:paramName')
  paramInPath() {
    return arguments[0];
  }
}
