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
    return request(app.callback()).get('/typeformat/string?data=123').expect(204);
  });

  it('number', () => {
    return request(app.callback()).get('/typeformat/number?data=123').expect(204);
  });

  it('boolean', () => {
    return request(app.callback()).get('/typeformat/boolean?data=true').expect(204);
  });

  it('boolean', () => {
    return request(app.callback())
      .post('/typeformat/boolean')
      .send({
        data: true,
      })
      .expect(204);
  });

  it('array', () => {
    return request(app.callback())
      .get('/typeformat/array?id[]=1&&id[]=2&id2[]=1&&id2[]=2&id3[]=1&&id3[]=2')
      .expect({ id: [1, 2], id2: ['1', '2'], id3: ['1', '2'] })
      .expect(200);
  });

  it('array, egg array', () => {
    return request(app.callback())
      .get('/typeformat/array?id=1&&id=2')
      .expect({ id: [1, 2] })
      .expect(200);
  });

  it('array, one element', () => {
    return request(app.callback())
      .post('/typeformat/array')
      .send({ ids: [1] })
      .expect([1])
      .expect(200);
  });

  it('array, multi element', () => {
    return request(app.callback())
      .post('/typeformat/array')
      .send({ ids: [1, 2, 3] })
      .expect([1, 2, 3])
      .expect(200);
  });
});
