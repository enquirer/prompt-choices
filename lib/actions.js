'use strict';

var utils = require('./utils');

function Actions(choices) {
  if (typeof choices === 'undefined') {
    throw new TypeError('expected choices to be an object');
  }
  utils.define(this, 'choices', choices);
}

Actions.prototype.number = function(pos, radio) {
  if (pos <= this.choices.length && pos >= 0) {
    this.choices[radio === true ? 'radio' : 'toggle'](pos - 1);
  }
  return pos - 1;
};

Actions.prototype.down = function(pos) {
  var n = (pos < this.choices.length - 1) ? pos + 1 : 0;
  this.choices.position = n;
  return n;
};

Actions.prototype.up = function(pos) {
  var n = (pos > 0) ? pos - 1 : this.choices.length - 1;
  this.choices.position = n;
  return n;
};

Actions.prototype.enter = function(pos) {
  return pos;
};

Actions.prototype.space = function(pos) {
  this.choices.radio();
  return pos;
};

Actions.prototype.tab = function(pos) {
  return pos;
};

Actions.prototype.a = function() {
  var choice = this.choices.get('all');
  if (choice && this.choices.length > 2) {
    this.choices[choice.checked ? 'uncheck' : 'check']();
    this.choices[choice.checked ? 'uncheck' : 'check']('none');
  } else {
    this.choices.toggle();
  }
  return this.choices.position;
};

Actions.prototype.i = function() {
  this.choices.forEach(function(choice) {
    choice.checked = !choice.checked;
  });
  switch (this.choices.checked.length) {
    case 0:
      this.choices.check('none');
      this.choices.uncheck('all');
      break;
    case this.choices.items.length - 2:
      this.choices.uncheck('none');
      this.choices.check('all');
      break;
    default: {
      this.choices.uncheck(['all', 'none']);
      break;
    }
  }
  return this.choices.position;
};

/**
 * Expose `Actions`
 */

module.exports = Actions;
