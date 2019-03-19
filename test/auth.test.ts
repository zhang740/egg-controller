import * as request from 'supertest';
import mm from 'egg-mock';

describe('auth', () => {
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

  it('default', () => {
    return request(app.callback())
      .get('/auth/default')
      .expect(204);
  });

  it('need param', () => {
    return request(app.callback())
      .get('/auth/needParam')
      .expect(400);
  });

  it('need param ok', () => {
    return request(app.callback())
      .get('/auth/needParamOk?id=123')
      .expect(204);
  });

  it('need param fail', () => {
    return request(app.callback())
      .get('/auth/needParamOk?id=fail')
      .expect(403);
  });

  it('forbidden', () => {
    return request(app.callback())
      .get('/auth/forbidden')
      .expect(403);
  });
});
