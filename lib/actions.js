'use strict';

var utils = require('./utils');

function Actions(choices, options) {
  if (typeof choices === 'undefined') {
    throw new TypeError('expected choices to be an object');
  }
  this.options = options || {};
  utils.define(this, 'choices', choices);
  this.length = this.choices.length;
  this.num = 0;
}

Actions.prototype.up = function(num) {
  return (num > 0) ? num - 1 : this.choices.length - 1;
};

Actions.prototype.down = function(num) {
  return (num < this.choices.length - 1) ? num + 1 : 0;
};

Actions.prototype.number = function(num) {
  var n = Number(num);
  if (n <= this.choices.length && n > 0) {
    if (this.choices.radio) {
      this.choices.radio();
    } else {
      this.space(n - 1);
    }
  }
  return n - 1;
};

Actions.prototype.a = function() {
  if (this.choices.radio) this.choices.radio();
  return this.choices.position;
};

Actions.prototype.i = function() {
  if (this.choices.radio) this.choices.radio();
  return this.choices.position;
};

Actions.prototype.space = function(num) {
  this.choices.spaceKeyPressed = true;
  this.choices.toggle(num, this.options.radio);
  return num;
};

/**
 * Expose `Actions`
 */

module.exports = Actions;
