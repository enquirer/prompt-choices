'use strict';

var toggleArray = require('toggle-array');
var Separator = require('choices-separator');
var Choice = require('./lib/choice');
var utils = require('./lib/utils');

/**
 * Create a new `Choices` collection.
 *
 * ```js
 * var choices = new Choices(['foo', 'bar', 'baz']);
 * var choices = new Choices([{name: 'foo'}, {name: 'bar'}, {name: 'baz'}]);
 * ```
 * @param {Array} `choices` One or more `choice` strings or objects.
 * @api public
 */

function Choices(choices, answers) {
  choices = choices || [];
  utils.define(this, 'isChoices', true);
  utils.define(this, 'answers', answers || {});
  this.original = choices.slice();
  this.keymap = {};
  this.items = [];
  this.keys = [];
  this.addChoices(choices);
}

/**
 * Add an array of normalized `choice` objects to the `choices` array. This
 * method is called in the constructor, but it can also be used to add
 * choices after instantiation.
 *
 * ```js
 * choices.addChoices(['a', 'b', 'c']);
 * ```
 * @param {Array|Object} `choices` One or more choices to add.
 * @api public
 */

Choices.prototype.addChoices = function(choices) {
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
      choice = this.choice(choice);
      var key = choice.key || choice.name;
      this.keymap[key] = choice;
      this.keys.push(key);
    }
    // push normalized "choice" object onto array
    this.push(choice);
  }
};

/**
 * Create a new `Choice` object.
 *
 * ```js
 * choices.choice('blue');
 * ```
 * @param {String|Object} `choice`
 * @return {Object} Returns a choice object.
 * @api public
 */

Choices.prototype.choice = function(choice) {
  return new Choice(choice, this.answers);
};

/**
 * Create a new `Separator` object. See [choices-separator][] for more details.
 *
 * ```js
 * choices.separator();
 * ```
 * @param {String} `separator` Optionally pass a string to use as the separator.
 * @return {Object} Returns a separator object.
 * @api public
 */

Choices.prototype.separator = function(separator, options) {
  return new Separator(separator, options);
};

/**
 * Get a non-separator choice from the collection.
 *
 * ```js
 * choices.getChoice(1);
 * ```
 * @param {Number} `idx` The selected choice index
 * @return {Object|undefined} Return the matched choice object or undefined
 * @api public
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
 * Get the index of a non-separator choice from the collection.
 *
 * ```js
 * choices.getChoice('foo');
 * ```
 * @param {String} `key` The key of the choice to get
 * @return {Number} Index of the choice or `-1`;
 * @api public
 */

Choices.prototype.getIndex = function(key) {
  if (utils.isNumber(key) && key !== -1 && key < this.realLength) {
    return key;
  }
  if (typeof key === 'string') {
    return this.pluck('value').indexOf(key);
  }
  return -1;
};

/**
 * Get the choice or separator object at the specified index.
 *
 * ```js
 * choices.getChoice(1);
 * ```
 * @param {Number} `idx` The index of the object to get
 * @return {Object} Returns the specified choice
 * @api public
 */

Choices.prototype.get = function(idx) {
  if (!utils.isNumber(idx)) {
    throw new TypeError('expected index to be a number');
  }
  return this.items[idx];
};

/**
 * Enable the choice at the given `idx`.
 *
 * ```js
 * choices.enable(1);
 * ```
 * @param {Number} `idx` The index of the choice to enable.
 * @api public
 */

Choices.prototype.enable = function(idx) {
  this.getChoice(idx).checked = true;
  return this;
};

/**
 * Disable the choice at the given `idx`.
 *
 * ```js
 * choices.disable(1);
 * ```
 * @param {Number} `idx` The index of the choice to enable.
 * @api public
 */

Choices.prototype.disable = function(idx) {
  this.getChoice(idx).checked = false;
  return this;
};

/**
 * Enable the choice at the given `index`, and disable all other choices.
 *
 * ```js
 * choices.toggleChoices(1);
 * ```
 * @param {Number} `idx` The index of the choice to toggle.
 * @api public
 */

Choices.prototype.toggleChoices = function(idx) {
  toggleArray(this.items, 'checked', idx);
  return this;
};

/**
 * Toggle the choice at the given `idx`.
 *
 * ```js
 * choices.toggleChoice(1);
 * ```
 * @param {Number} `idx` The index of the choice to toggle.
 * @api public
 */

Choices.prototype.toggleChoice = function(idx) {
  var checked = this.getChoice(idx).checked;
  this.getChoice(idx).checked = !checked;
  return this;
};

/**
 * Return choices that return truthy based on the given `val`.
 *
 * @param {Object|Function|String} `val`
 * @return {Array} Matching choices or empty array
 * @api public
 */

Choices.prototype.where = function(val) {
  return this.realChoices.filter(function(choice) {
    if (typeof val === 'function') {
      return val(choice);
    }

    if (typeof val === 'string') {
      return choice.name === val || choice.key === val;
    }

    if (val instanceof RegExp) {
      return val.test(choice.name) || val.test(choice.key);
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
 * Pluck an object with the specified key from the choices collection.
 * @param {String} `key` Property name to use for plucking objects.
 * @return {Array} Plucked objects
 * @api public
 */

Choices.prototype.pluck = function(key) {
  return this.realChoices.map(function(choice) {
    return choice[key];
  });
};

/**
 * Convenience array methods
 */

Choices.prototype.indexOf = function() {
  return this.getChoice(this.keys.indexOf.apply(this.keys, arguments));
};

Choices.prototype.forEach = function() {
  return this.items.forEach.apply(this.items, arguments);
};

Choices.prototype.filter = function() {
  return this.items.filter.apply(this.items, arguments);
};

Choices.prototype.push = function() {
  var choices = utils.flatten([].slice.call(arguments));
  var len = choices.length;
  var idx = -1;

  while (++idx < len) {
    var choice = choices[idx];
    this.items.push(new Choice(choice));
    if (choice.type !== 'separator') {
      this.realChoices.push(choice);
    }
  }
  return this.items;
};

/**
 * Getter for getting the length of the collection.
 * @name .length
 * @api public
 */

Object.defineProperty(Choices.prototype, 'length', {
  set: function() {
    throw new Error('.length is a getter and cannot be defined');
  },
  get: function() {
    return this.items.length;
  }
});

/**
 * Getter for getting all non-separator choices from the collection.
 * @name .realChoices
 * @api public
 */

Object.defineProperty(Choices.prototype, 'realChoices', {
  set: function() {
    throw new Error('.realChoices is a getter and cannot be defined');
  },
  get: function() {
    var choices = [];
    var idx = -1;
    while (++idx < this.length) {
      var choice = this.items[idx];
      if (choice.type !== 'separator' && !choice.disabled) {
        choices.push(choice);
      }
    }
    return choices;
  }
});

/**
 * Getter for getting the length of the collection excluding non-separator choices.
 * @name .realLength
 * @api public
 */

Object.defineProperty(Choices.prototype, 'realLength', {
  set: function() {
    throw new Error('.realLength is a getter and cannot be defined');
  },
  get: function() {
    return this.realChoices.length;
  }
});

/**
 * Create a new `Separator` object. See [choices-separator][] for more details.
 *
 * ```js
 * new Choices.Separator();
 * ```
 * @param {String} `separator` Optionally pass a string to use as the separator.
 * @return {Object} Returns a separator object.
 * @api public
 */

Choices.Separator = Separator;

/**
 * Expose `Choices`
 */

module.exports = Choices;
