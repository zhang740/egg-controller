import { Controller } from 'egg';
import { controller, RESTfulController, route } from '../../../../../lib';

@controller({ name: 'Test rest for @controller', prefix: '/api/rest', restful: true })
export class RESTSimpleController extends Controller {
  index() {
    return 'index';
  }

  no() {
    return 'no';
  }
}

@controller({ name: 'Test rest for @controller', prefix: '/api/rest2', restful: true })
export class RESTFullController extends RESTfulController {

  @route({ url: '/api/rest2/custom' })
  index() {
    return 'index';
  }

  new() {
    return 'new';
  }

  show(id: string) {
    return `show_${id}`;
  }

  edit(id: string) {
    return `edit_${id}`;
  }

  @route()
  create() {
    return 'create';
  }

  update(id: string) {
    return `update_${id}`;
  }

  destroy(id: string) {
    return `destroy_${id}`;
  }

  no() {
    return 'no';
  }
}
