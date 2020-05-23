import { route } from '../../../../../lib';
import { NotFoundError } from '../../../../../lib/error';

export class RouteController {
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
  async noData() {}

  @route({ url: '/home/notfound', name: '404' })
  async notFound() {
    throw new NotFoundError();
  }

  @route({ url: config => `/home/${config.env}`, name: '根据config生成url' })
  async customByconfig() {
    return 'customByconfig';
  }

  /** need the type info 'number' of array */
  @route('/home/getArray', {
    name: 'array',
    validateMetaInfo: [
      {
        name: 'id',
        rule: {
          type: 'array',
          itemType: 'number',
        },
      },
    ],
    schemas: {
      params: [
        {
          name: 'id3',
          in: 'query',
          schema: {
            type: 'array',
            items: {
              type: 'number',
            },
          },
        },
      ],
    },
  })
  async getArray(id: any, id2: number[], id3: any) {
    return { id, id2, id3 };
  }
}
