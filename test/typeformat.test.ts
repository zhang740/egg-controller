import * as request from 'supertest';
import mm from 'egg-mock';

describe('type format', () => {
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

  it('string', () => {
    return request(app.callback())
      .get('/typeformat/string?data=123')
      .expect(204);
  });

  it('number', () => {
    return request(app.callback())
      .get('/typeformat/number?data=123')
      .expect(204);
  });

  it('boolean', () => {
    return request(app.callback())
      .get('/typeformat/boolean?data=true')
      .expect(204);
  });
});
