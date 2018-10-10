import * as request from 'supertest';
import mm from 'egg-mock';

describe('test/lib/route_validate.test.js', () => {
  let app: any;
  before(() => {
    app = mm.app({
      baseDir: 'example',
      plugin: 'controller',
    } as any);
    return app.ready();
  });

  after(() => app.close());

  afterEach(mm.restore);

  it('normal', () => {
    return request(app.callback())
      .post('/api/validate/p1')
      .send({ data: 'qwe' })
      .expect('qwe')
      .expect(200);
  });

  it('validate fail, string too long', () => {
    return request(app.callback())
      .post('/api/validate/p1')
      .send({ data: 'qweqwe' })
      .expect(400);
  });

});

