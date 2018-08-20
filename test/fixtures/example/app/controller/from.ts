import { route, FromBody, FromQuery, FromParam } from '../../../../../lib';

export class FromController {

  @route('POST /from/query')
  async a1(@FromQuery() a: string) {
    return { a };
  }

  @route('POST /from/body')
  async a2(@FromBody() a: string) {
    return { a };
  }

  @route('POST /from/param/:a')
  async a3(@FromParam() a: string) {
    return { a };
  }

}
