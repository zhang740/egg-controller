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
      .get('/api/ctrl/hi?type=normal')
      .expect('normal')
      .expect(200);
  });

  it('middleware', () => {
    return request(app.callback())
      .get('/api/ctrl/hi?type=mw')
      .expect('ctrl:middleware')
      .expect(200);
  });

});
