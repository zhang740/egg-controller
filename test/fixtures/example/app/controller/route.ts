import { route } from '../../../../../lib';
import { NotFoundError } from '../../../../../lib/error';

export class HomeController {

  @route({ url: '/home/index', name: '首页' })
  async index() {
    return 'homeIndex';
  }

  @route('/home/sort', { name: '简写' })
  async sort() {
    return 'homeSort';
  }

  @route('/home/post', { name: 'post' })
  async postData(param: any) {
    return param;
  }

  @route('/home/put', { name: 'put' })
  async put(id: number) {
    return id;
  }

  @route()
  async default() {
    return 'ok';
  }

  @route({ url: '/home/nodata', name: '无数据' })
  async noData() {
  }

  @route({ url: '/home/notfound', name: '404' })
  async notFound() {
    throw new NotFoundError();
  }

  @route({ url: (app) => `/home/${app.config.env}`, name: '根据config生成url（此类型暂不支持生成到前端SDK）' })
  async customByconfig() {
    return 'customByconfig';
  }
}
