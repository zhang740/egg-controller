import * as crypto from 'crypto';
const request = require('supertest');
const mm = require('egg-mock');
const assert = require('assert');

describe('encrypt', () => {
  let app: any;
  before(() => {
    app = mm.app({
      baseDir: 'example',
      plugin: 'controller',
    });
    return app.ready();
  });

  after(() => app.close());

  afterEach(mm.restore);

  it('normal', () => {
    const publicKey = [
      '-----BEGIN PUBLIC KEY-----',
      require('./fixtures/example/config/public').default,
      '-----END PUBLIC KEY-----'
    ].join('\n');
    return request(app.callback())
      .post('/api/encrypt/a')
      .send({
        encrypt: crypto.publicEncrypt(publicKey, new Buffer(
          JSON.stringify({ data: 123 })
        ))
      })
      .expect(200)
      .expect({ data: 123 });
  });
});
