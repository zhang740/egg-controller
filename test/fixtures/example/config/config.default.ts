'use strict';

export default {
  security: {
    csrf: {
      ignore: [
        '/*'
      ]
    }
  },
  controller: {
    encrypt: {
      publicKey: require('./public').default,
      privateKey: require('./private').default,
      type: 'PKCS1',
    },
  }
};
