import * as request from 'supertest';
import mm from 'egg-mock';

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

  it('async function & middleware', () => {
    return request(app.callback())
      .get('/mw/amw?type=ok')
      .expect(200)
      .expect('amwCtrl:ok');
  });
  it('async function & middleware, err', () => {
    return request(app.callback())
      .get('/mw/amw?type=block')
      .expect(403);
  });

  it('async function & gen middleware', () => {
    return request(app.callback())
      .get('/mw/agmw?type=ok')
      .expect(200)
      .expect('agmwCtrl:ok');
  });
  it('async function & gen middleware, err', () => {
    return request(app.callback())
      .get('/mw/agmw?type=block')
      .expect(403);
  });

  it('gen function & async middleware', () => {
    return request(app.callback())
      .get('/mw/gamw?type=ok')
      .expect(200)
      .expect('gamwCtrl:ok');
  });
  it('gen function & async middleware, err', () => {
    return request(app.callback())
      .get('/mw/gamw?type=block')
      .expect(403);
  });

  it('gen function & middleware', () => {
    return request(app.callback())
      .get('/mw/ggmw?type=ok')
      .expect(200)
      .expect('ggmwCtrl:ok');
  });

  it('gen function & middleware, err', () => {
    return request(app.callback())
      .get('/mw/ggmw?type=block')
      .expect(403);
  });

  it('multi middleware, throw err', () => {
    return request(app.callback())
      .get('/mw/multi')
      .expect(400);
  });
});

