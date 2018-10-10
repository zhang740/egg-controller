import * as request from 'supertest';
import mm from 'egg-mock';

describe('ctrl', () => {
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
      .get('/api/ctrl/hi')
      .expect('hi, egg')
      .expect(200);
  });
});
