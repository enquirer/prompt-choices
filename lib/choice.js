'use strict';

var log = require('log-utils');
var radio = require('radio-symbol');
var strip = require('strip-color');
var utils = require('./utils');

/**
 * Create a new `Choice` to create a normalized choice object from the given input.
 * @param {String|Object} `val` Choice value. If an object is passed, it should contains at least one of `value` or `name` property.
 * @api public
 */

function Choice(choice, options) {
  if (typeof choice === 'string') {
    choice = { name: choice };
  }
  if (!utils.isObject(choice)) {
    throw new TypeError('expected choice to be a string or object');
  }
  if (choice.type === 'separator' || choice.isSeparator) {
    choice.isSeparator = true;
    return choice;
  }
  if (choice.isChoice || choice instanceof Choice) {
    return choice;
  }
  this.initChoice(choice, options);
}

/**
 * Initialize choice.
 * @param {Object} `choice`
 * @param {Object} `options`
 */

Choice.prototype.initChoice = function(choice, options) {
  utils.define(this, 'isChoice', true);
  this.name = null;
  this.short = null;
  this.value = null;
  this.disabled = false;
  this.checked = false;

  utils.define(this, 'position', 0);
  utils.define(this, 'index', 0);
  utils.define(this, 'options', options || {});

  utils.extend(this, choice);
  this.name = choice.name || choice.value;
  this.value = choice.hasOwnProperty('value') ? choice.value : choice.name;
  this.short = choice.short || choice.name;
  utils.define(this, 'key', this.key || this.short);

  this.pointer = log.cyan(utils.pointer(this.options));
  if (this.options.hasOwnProperty('pointer')) {
    this.pointer = this.options.pointer;
  }

  utils.define(this, 'prefix', this.padding(this.pointer));
};

Choice.prototype.render = function(idx, options) {
  options = options || {};
  if (typeof options.pointer === 'string') {
    this.pointer = options.pointer;
  }
  if (this.type === 'separator') {
    return this.value || ' ---\n';
  }
  this.position = idx;
  return this.line;
};

Choice.prototype.toggle = function() {
  this.checked = !this.checked;
  return this;
};

Choice.prototype.enable = function(prop) {
  utils.set(this, prop, true);
  return this;
};

Choice.prototype.disable = function(prop) {
  utils.set(this, prop, false);
  return this;
};

Choice.prototype.format = function(str) {
  if (typeof this.options.format === 'function') {
    str = this.options.format.call(this, str);
  }
  return this.disabled ? log.dim(str) : str;
};

Choice.prototype.padding = function(val) {
  return Array(strip(val).length + 1).join(' ');
};

/**
 * Getter for getting the pointer to use before each line in the prompt
 * @name .pointer
 * @api public
 */

Object.defineProperty(Choice.prototype, 'pointer', {
  set: function(val) {
    utils.define(this, '_pointer', val);
  },
  get: function() {
    var val = typeof this._pointer !== 'string'
      ? this.options.pointer
      : this._pointer;

    if (this.position !== this.index) {
      return (this.prefix = this.padding(val));
    }
    return val;
  }
});

/**
 * Getter for getting the checkbox or radio symbol to use.
 * @name .symbol
 * @api public
 */

Object.defineProperty(Choice.prototype, 'symbol', {
  set: function() {
    throw new Error('.symbol is a getter and cannot be defined');
  },
  get: function() {
    var symbol = this.options.checkbox || radio;
    if (this.disabled) {
      return symbol.disabled;
    }
    return this.checked ? symbol.on : symbol.off;
  }
});

/**
 * Getter for getting the line to render for a choice
 * @name .line
 * @api public
 */

Object.defineProperty(Choice.prototype, 'line', {
  set: function() {
    throw new Error('.line is a getter and cannot be defined');
  },
  get: function() {
    var val = this.value;
    if (typeof this.disabled === 'string') {
      this._pointer = this.prefix;
      val += ' (' + this.disabled + ')';
    } else if (this.disabled === true) {
      this._pointer = this.prefix;
      val += ' (Disabled)';
    }
    return this.pointer + this.symbol + ' ' + this.format(val) + '\n';
  }
});

/**
 * Getter for getting the line to render for a choice
 * @name .line
 * @api public
 */

Object.defineProperty(Choice.prototype, 'disabled', {
  enumerable: true,
  set: function(disabled) {
    utils.define(this, '_disabled', disabled);
  },
  get: function() {
    if (typeof this._disabled === 'function') {
      return this._disabled.call(this, this.options.answers);
    }
    return this._disabled;
  }
});

/**
 * Expose Choice
 */

module.exports = Choice;
