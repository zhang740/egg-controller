import { Controller } from 'egg';
import { route } from '../../../../../lib';

interface RespModel {
  a: string;
  b?: { c: number };
}

interface RequestModel {
  a: string;
  b: { c?: number };
}

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
  post(q: { a: string; b: number }) {
    return 'ok';
  }

  @route('POST /api/complex', { name: 'complex' })
  complex(id: string, data: RequestModel) {
    return {} as RespModel;
  }
}
