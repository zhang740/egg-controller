import * as request from 'supertest';
import mm from 'egg-mock';

describe('sort', () => {
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

  it('sort', () => {
    return request(app.callback())
      .get('/sort/xxx')
      .expect('sort')
      .expect(200);
  });

  it('sort2', () => {
    return request(app.callback())
      .get('/sort/abc')
      .expect('sort2')
      .expect(200);
  });

});
