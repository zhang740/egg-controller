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
    compatible: {
      ret404WhenNoChangeBody: true,
    }
  },
};
