'use strict';

var isNumber = require('is-number');
var utils = require('lazy-cache')(require);
var fn = require;
require = utils;

/**
 * Lazily required module dependencies
 */

require('arr-flatten', 'flatten');
require('define-property', 'define');
require('extend-shallow', 'extend');
require('isobject', 'isObject');
require = fn;

/**
 * Returns true if `val` is a number (also ensures that val
 * is not whitespace, which is cast to `0`)
 */

utils.isNumber = function(val) {
  return isNumber(val) && !/^\s+$/.test(String(val));
};

/**
 * Cast `val` to an array.
 */

utils.arrayify = function(val) {
  return val ? (Array.isArray(val) ? val : [val]) : [];
};

/**
 * Expose `utils` modules
 */

module.exports = utils;
