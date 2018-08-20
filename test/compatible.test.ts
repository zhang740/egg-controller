const request = require('supertest');
const mm = require('egg-mock');
const assert = require('assert');

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

