'use strict';

var log = require('log-utils');
var extend = require('extend-shallow');
var define = require('define-property');
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
  }
  if (choice.isChoice || choice instanceof Choice) {
    return choice;
  }
  define(this, 'cache', {});
  this.initChoice(choice, options);
}

/**
 * Initialize choice.
 * @param {Object} `choice`
 * @param {Object} `options`
 */

Choice.prototype.initChoice = function(choice, options) {
  define(this, 'isChoice', true);

  this.name = null;
  this.short = null;
  this.value = null;
  this.disabled = false;
  this.checked = false;

  define(this, 'position', 0);
  define(this, 'index', 0);
  define(this, 'options', options || {});
  extend(this, choice);

  this.name = choice.name || choice.value;
  this.value = choice.hasOwnProperty('value') ? choice.value : choice.name;
  this.short = choice.short || choice.name;
  define(this, 'key', this.key || this.short);

  this.pointer = utils.pointer(this.options);
  if (!this.options.pointer) {
    this.pointer = log.cyan(this.pointer);
  }

  define(this, 'prefix', this.padding(this.pointer));
};

Choice.prototype.render = function(idx, options) {
  options = options || {};
  if (typeof options.pointer === 'string') {
    this.pointer = options.pointer;
  }
  if (this.type === 'separator') {
    return this.value;
  }
  this.position = idx;
  return this.line;
};

Choice.prototype.toggle = function() {
  this.checked = !this.checked;
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
    define(this.cache, 'pointer', val);
  },
  get: function() {
    var pointer = this.cache.pointer || this.options.pointer;
    if (this.position !== this.index) {
      return (this.prefix = this.padding(pointer));
    }
    return pointer;
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
  configurable: true,
  set: function(line) {
    if (typeof line === 'string') this.value = line;
  },
  get: function() {
    var line = this.value;
    if (typeof this.disabled === 'string') {
      this.pointer = this.prefix;
      line += ' (' + this.disabled + ')';
    } else if (this.disabled === true) {
      this.pointer = this.prefix;
      line += ' (Disabled)';
    }
    return this.pointer + this.symbol + ' '
      + this.format(line).replace(/\s+$/, '')
      + '\n';
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
    define(this.cache, 'disabled', disabled);
  },
  get: function() {
    if (typeof this.cache.disabled === 'function') {
      return this.cache.disabled.call(this, this.options.answers);
    }
    return this.cache.disabled;
  }
});

/**
 * Expose Choice
 */

module.exports = Choice;
