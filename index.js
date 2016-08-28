'use strict';

var Separator = require('enquirer-separator');
var Choice = require('./lib/choice');
var utils = require('./lib/utils');

/**
 * Choices collection
 * Collection of multiple `choice` objects
 * @param {Array} choices  All `choice` to keep in the collection
 */

function Choices(choices, answers) {
  this.choices = [];
  this.keymap = {};

  choices = utils.arrayify(choices);
  var len = choices.length;
  var idx = -1;

  while (++idx < len) {
    var choice = choices[idx];
    if (choice.type === 'separator') {
      if (!choice.isSeparator) {
        choice = new Separator(choice.line);
      }
    } else {
      choice = new Choice(choice, answers);
      this.keymap[choice.key] = choice;
    }
    this.choices.push(choice);
  }
};

/**
 * Get a valid choice from the collection
 * @param  {Number} `idx` The selected choice index
 * @return {Object|undefined} Return the matched choice object or undefined
 */

Choices.prototype.getChoice = function(idx) {
  if (utils.isNumber(idx) && idx !== ' ') {
    return this.realChoices[idx];
  }
  if (typeof idx === 'string') {
    return this.keymap[idx];
  }
};

/**
 * Get a valid choice from the collection
 * @param  {Number} idx The selected choice index
 * @return {Choice|Undefined} Return the matched choice or undefined
 */

Choices.prototype.getIndex = function(key) {
  if (utils.isNumber(key) && key !== -1 && key < this.realLength) {
    return key;
  }
  if (typeof key === 'string') {
    return this.pluck('value').indexOf(key);
  }
  return 0;
};

/**
 * Get a raw element from the collection
 * @param  {Number} idx  The selected index value
 * @return {Choice|Undefined} Return the matched choice or undefined
 */

Choices.prototype.get = function(idx) {
  if (!utils.isNumber(idx)) {
    throw new TypeError('expected index to be a number');
  }
  return this.choices[idx];
};

/**
 * Match the valid choices against a where clause
 * @param  {Object} whereClause Lodash `where` clause
 * @return {Array}              Matching choices or empty array
 */

Choices.prototype.where = function(val) {
  return this.realChoices.filter(function(choice) {
    if (typeof val === 'function') {
      return val(choice);
    }
    if (typeof val === 'string') {
      return !!choice[val];
    }

    if (utils.isObject(val)) {
      for (var key in val) {
        if (!choice.hasOwnProperty(key)) {
          return false;
        }
        if (val[key] !== choice[key]) {
          return false;
        }
      }
    }
    return true;
  });
};

/**
 * Pluck a particular key from the choices
 * @param  {String} propertyName Property name to select
 * @return {Array}               Selected properties
 */

Choices.prototype.pluck = function(key) {
  return this.realChoices.map(function(choice) {
    return choice[key];
  });
};

// Expose usual Array methods
Choices.prototype.indexOf = function() {
  return this.choices.indexOf.apply(this.choices, arguments);
};

Choices.prototype.forEach = function() {
  return this.choices.forEach.apply(this.choices, arguments);
};

Choices.prototype.filter = function() {
  return this.choices.filter.apply(this.choices, arguments);
};

Choices.prototype.push = function() {
  var choices = utils.flatten([].slice.call(arguments));
  var len = choices.length;
  var idx = -1;

  while (++idx < len) {
    var choice = choices[idx];
    this.choices.push(new Choice(choice));
    if (choice.type !== 'separator') {
      this.realChoices.push(choice);
    }
  }
  return this.choices;
};

Object.defineProperty(Choices.prototype, 'realChoices', {
  set: function() {
    throw new Error('.realChoices is a getter and cannot be defined');
  },
  get: function() {
    var choices = [];
    var idx = -1;
    while (++idx < this.length) {
      var choice = this.choices[idx];
      if (choice.type !== 'separator' && !choice.disabled) {
        choices.push(choice);
      }
    }
    return choices;
  }
});

Object.defineProperty(Choices.prototype, 'length', {
  set: function() {
    throw new Error('.length is a getter and cannot be defined');
  },
  get: function() {
    return this.choices.length;
  }
});

Object.defineProperty(Choices.prototype, 'realLength', {
  set: function() {
    throw new Error('.realLength is a getter and cannot be defined');
  },
  get: function() {
    return this.realChoices.length;
  }
});

Object.defineProperty(Choices.prototype, 'all', {
  get: function() {
    return this.choices;
  }
});

module.exports = Choices;
