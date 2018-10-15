import * as request from 'supertest';
import mm from 'egg-mock';

describe('RESTful', () => {
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
      .get('/api/rest')
      .expect('index')
      .expect(200);
  });

  it('normal, no', () => {
    return request(app.callback())
      .get('/api/rest/no')
      .expect(404);
  });

  it('full, index 404', () => {
    return request(app.callback())
      .get('/api/rest2')
      .expect(404);
  });

  it('full, index', () => {
    return request(app.callback())
      .get('/api/rest2/custom')
      .expect('index')
      .expect(200);
  });

  it('full, new', () => {
    return request(app.callback())
      .get('/api/rest2/new')
      .expect('new')
      .expect(200);
  });

  it('full, show', () => {
    return request(app.callback())
      .get('/api/rest2/xxx')
      .expect('show_xxx')
      .expect(200);
  });

  it('full, edit', () => {
    return request(app.callback())
      .get('/api/rest2/xxx/edit')
      .expect('edit_xxx')
      .expect(200);
  });

  it('full, create', () => {
    return request(app.callback())
      .post('/api/rest2')
      .expect('create')
      .expect(200);
  });

  it('full, update', () => {
    return request(app.callback())
      .put('/api/rest2/xxx')
      .expect('update_xxx')
      .expect(200);
  });

  it('full, destroy', () => {
    return request(app.callback())
      .delete('/api/rest2/xxx')
      .expect('destroy_xxx')
      .expect(200);
  });

});
