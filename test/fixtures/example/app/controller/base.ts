import { Controller } from 'egg';
import { route } from '../../../../../lib';

export class HomeController extends Controller {
  @route('/')
  hi() {
    return `hi, egg`;
  }
}
