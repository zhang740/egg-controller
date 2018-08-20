const request = require('supertest');
const mm = require('egg-mock');
const assert = require('assert');

describe('test/lib/route.test.js', () => {
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

  it('from query', () => {
    return request(app.callback())
      .post('/from/query?a=aaa')
      .send({ a: 'bbb' })
      .expect(200)
      .then(res => {
        assert.deepEqual(res.body, { a: 'aaa' });
      });
  });

  it('from body', () => {
    return request(app.callback())
      .post('/from/body?a=aaa')
      .send({ a: 'bbb' })
      .expect(200)
      .then(res => {
        assert.deepEqual(res.body, { a: 'bbb' });
      });
  });

  it('from query, no data from param', () => {
    return request(app.callback())
      .post('/from/param/ccc?a=aaa')
      .send({ a: 'bbb' })
      .expect(200)
      .then(res => {
        assert.deepEqual(res.body, { a: 'ccc' });
      });
  });

});

