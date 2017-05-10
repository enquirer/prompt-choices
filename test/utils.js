'use strict';

require('mocha');
var assert = require('assert');
var utils = require('../lib/utils');

describe('utils', function() {
  it('should arrayify a value', function() {
    assert.deepEqual(utils.arrayify('string'), ['string']);
    assert.deepEqual(utils.arrayify(['string']), ['string']);
    assert.deepEqual(utils.arrayify(), []);
  });
});
