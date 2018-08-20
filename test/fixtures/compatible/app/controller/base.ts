import { Controller } from 'egg';
import { route } from '../../../../../lib';

export class HomeController extends Controller {
  @route('/noChangeBody')
  hi() {
    console.log('in controller noChangeBody');
  }
}
