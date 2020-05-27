import { Controller } from 'egg';
import { route } from '../../../../../lib';
import { BadRequestError } from '../../../../../lib/error';

export class TypeFormatController extends Controller {
  @route('/typeformat/string')
  string(data: string) {
    if (typeof data !== 'string') {
      throw new BadRequestError(`${typeof data} ${data}`);
    }
  }

  @route('/typeformat/number')
  number(data: number) {
    if (typeof data !== 'number') {
      throw new BadRequestError(`${typeof data} ${data}`);
    }
  }

  @route('/typeformat/boolean')
  boolean(data: boolean) {
    if (typeof data !== 'boolean') {
      throw new BadRequestError(`${typeof data} ${data}`);
    }
  }

  @route('POST /typeformat/boolean')
  booleanPost(data: boolean) {
    if (typeof data !== 'boolean') {
      throw new BadRequestError(`${typeof data} ${data}`);
    }
  }

  /** need the type info 'number' of array */
  @route('/typeformat/array', {
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
  async array(id: any, id2: number[], id3: any) {
    return { id, id2, id3 };
  }

  @route('POST /typeformat/array')
  async postArray(ids: any) {
    return ids;
  }
}
