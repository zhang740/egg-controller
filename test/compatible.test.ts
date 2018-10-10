import * as request from 'supertest';
import mm from 'egg-mock';

describe('test/lib/compatible.test.js', () => {
  let app: any;
  before(() => {
    app = mm.app({
      baseDir: 'compatible',
      plugin: 'controller',
    } as any);
    return app.ready();
  });

  after(() => app.close());

  afterEach(mm.restore);

  it('noChangeBody', () => {
    return request(app.callback())
      .get('/noChangeBody')
      .expect(404);
  });

});

