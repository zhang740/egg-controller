import { route } from '../../../../../lib';

export class EncryptController {

  @route('POST /api/encrypt/a', { encrypt: true })
  async a1(data: string) {
    return { data };
  }

}
