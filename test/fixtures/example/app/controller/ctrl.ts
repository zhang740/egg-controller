import { Controller } from 'egg';
import { route, controller } from '../../../../../lib';

@controller({ name: 'Test for @controller', prefix: '/api/ctrl' })
export class CtrlController extends Controller {
  @route()
  hi() {
    return `hi, egg`;
  }
}
