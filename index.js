'use strict';

module.exports = {
  rules: {
    'enum': require('./enum').rule,
    'no-duplicate-requires': require('./no-duplicate-requires').rule,
    'no-missing-requires': require('./no-missing-requires').rule,
    'no-unused-requires': require('./no-unused-requires').rule,
    'one-provide-or-module': require('./one-provide-or-module').rule,
    'requires-first': require('./requires-first').rule,
    'valid-provide-and-module': require('./valid-provide-and-module').rule,
    'valid-requires': require('./valid-requires').rule
  }
};
