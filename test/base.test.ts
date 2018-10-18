import * as request from 'supertest';
import mm from 'egg-mock';

describe('base', () => {
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
      .get('/')
      .expect('hi, egg')
      .expect(200);
  });

  it('pathParamTest', () => {
    return request(app.callback())
      .get('/pathParamTest/aaa')
      .expect('aaa')
      .expect(200);
  });

  it('pathParamTest', () => {
    return request(app.callback())
      .get('/funcPath/example')
      .expect('ok')
      .expect(200);
  });

});
