'use strict';

var util = require('util');
var utils = require('./utils');

/**
 * Create a new `Choice` to create a normalized choice object from the given input.
 * @param {String|Object} `val` Choice value. If an object is passed, it should contains at least one of `value` or `name` property.
 * @api public
 */

function Choice(choice, answers) {
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

  utils.define(this, 'isChoice', true);
  this.disabled = false;
  this.checked = false;

  utils.extend(this, choice);
  this.name = choice.name || choice.value;
  this.value = choice.hasOwnProperty('value') ? choice.value : choice.name;
  this.short = choice.short || choice.name;

  if (typeof choice.disabled === 'function') {
    this.disabled = !!choice.disabled.call(this, answers);
  } else {
    this.disabled = !!choice.disabled;
  }
};

/**
 * Expose Choice
 */

module.exports = Choice;
