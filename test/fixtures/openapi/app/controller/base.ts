import { Controller } from 'egg';
import { route } from '../../../../../lib';

export class HomeController extends Controller {
  @route('/api/normal', { name: 'get' })
  getNormal() {
    return 'ok';
  }

  @route('/api/query', { name: 'get with query: q' })
  getQuery(q: string) {
    return 'ok';
  }

  @route('/api/query/:q', { name: 'get with path: q' })
  getParam(q: string) {
    return 'ok';
  }

  @route('/api/complex/:q', { name: 'get complex' })
  getComplex(q: string, p: number) {
    return 'ok';
  }

  @route('POST /api/body', { name: 'post with body: q' })
  post(q: { a: string, b: number }) {
    return 'ok';
  }
}
