import * as assert from 'assert';
import util = require('../lib/util');

describe('test/lib/route_util.test.js, getParameterNames', () => {

  it('normal function', () => {
    function test(a, b, c) { }

    const params = util.getParameterNames(test);
    assert.deepEqual(params, ['a', 'b', 'c']);
  });

  it('default param function', () => {
    function test(a, b = 1, c = 2) { const x = (d, e, f = 1) => { }; }
    const params = util.getParameterNames(test);
    assert.deepEqual(params, ['a', 'b', 'c']);
  });

  it('default param function complex', () => {
    function test(a, b = 1, c = 2, q = (t, y = 1) => { }) { const x = (d, e, f = 1) => { }; }
    const params = util.getParameterNames(test);
    assert.deepEqual(params, ['a', 'b', 'c', 'q']);
  });

  it('default param function complex2', () => {
    function test(a, b = 1, c = 2, q = (t, y = 1) => { }, r = (t, y = 1) => { }) {
      const x = (d, e, f = 1) => { };
    }
    const params = util.getParameterNames(test);
    assert.deepEqual(params, ['a', 'b', 'c', 'q', 'r']);
  });

  it('default param function complex3', () => {
    function test(x, y = (1 + 2) * 3) { }

    const params = util.getParameterNames(test);
    assert.deepEqual(params, ['x', 'y']);
  });

  it('default param function, when cov env', () => {
    const params = util.getParameterNames(`getSiteList(owner,onlineState,teamId,pageNum=(cov_bls626y0s.b[31][0]++,1),pageSize=(cov_bls626y0s.b[32][0]++,10)){cov_bls626y0s.f[41]++;cov_bls626y0s.s[131]++;return tslib_1.__awaiter(this,void 0,void 0,function*(){cov_bls626y0s.f[42]++;cov_bls626y0s.s[132]++;// tslint:disable-next-line:no-console
      console.log('[??????]',pageSize,this.ctx.query);const space=(cov_bls626y0s.s[133]++,yield this.sessionService.getSpace());let targetUsername=(cov_bls626y0s.s[134]++,null);cov_bls626y0s.s[135]++;if(owner){cov_bls626y0s.b[33][0]++;const u=(cov_bls626y0s.s[136]++,yield this.userService.getByUserId(owner));cov_bls626y0s.s[137]++;targetUsername=u.name;}else{cov_bls626y0s.b[33][1]++;}let targetOnlineState=(cov_bls626y0s.s[138]++,onlineState);// 仅限开启团队功能
      let targetTeamId=(cov_bls626y0s.s[139]++,space.meta.teamEnabled?(cov_bls626y0s.b[34][0]++,teamId):(cov_bls626y0s.b[34][1]++,null));const sites=(cov_bls626y0s.s[140]++,yield this.spaceService.getSpaceSiteList(space.spaceId,pageNum,pageSize,{owner:targetUsername,onlineState:targetOnlineState,teamId:targetTeamId}));cov_bls626y0s.s[141]++;return sites;});}`);
    assert.deepEqual(params, ['owner', 'onlineState', 'teamId', 'pageNum', 'pageSize']);
  });

});

describe('test/lib/route_util.test.js, getNameAndMethod', () => {

  it('get', () => {
    const params = util.getNameAndMethod('findUser');
    assert.deepEqual(params, { name: 'user', method: 'get' });
  });

  it('get, other', () => {
    const params = util.getNameAndMethod('other');
    assert.deepEqual(params, { name: 'other', method: 'get' });
  });

  it('post', () => {
    const params = util.getNameAndMethod('createUser');
    assert.deepEqual(params, { name: 'user', method: 'post' });
  });

  it('put', () => {
    const params = util.getNameAndMethod('modifyUser');
    assert.deepEqual(params, { name: 'user', method: 'put' });
  });

  it('delete', () => {
    const params = util.getNameAndMethod('deleteUser');
    assert.deepEqual(params, { name: 'user', method: 'delete' });
  });

});
