import { Controller } from 'egg';
import { route } from '../../../../../lib';

export class SortController extends Controller {
  @route('/sort/*')
  sort() {
    return `sort`;
  }

  @route('/sort/abc')
  sort2() {
    return `sort2`;
  }

}
