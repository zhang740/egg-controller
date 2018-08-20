import { route } from '../../../../../lib';

export class ParamController {

  @route('POST /api/validate/p1', { validateMetaInfo: [{ name: 'data', rule: { type: 'string', max: 5 } }] })
  async p1(data: string) {
    return data;
  }

}
