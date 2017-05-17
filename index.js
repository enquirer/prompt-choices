'use strict';

var Paginator = require('terminal-paginator');
var debug = require('debug')('prompt-choices');
var define = require('define-property');
var extend = require('extend-shallow');
var visit = require('collection-visit');
var Choice = require('./lib/choice');
var utils = require('./lib/utils');
var log = require('log-utils');

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

function Choices(choices, options) {
  debug('initializing from <%s>', __filename);
  if (utils.isObject(choices) && choices.isChoices) {
    return choices;
  }

  define(this, 'isChoices', true);
  this.options = extend({}, options);
  this.answers = this.options.answers || {};
  this.paginator = new Paginator(this.options);
  this.choices = [];
  this.items = [];
  this.keymap = {};
  this.keys = [];
  this.original = [];
  this.position = 0;

  if (choices) {
    this.original = utils.clone(choices);
    this.addChoices(choices);
  }
}

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
  return new Choice(choice, this.options);
};


/**
 * Returns a normalized `choice` object.
 *
 * @param {[type]} choice
 * @return {[type]}
 * @api public
 */

Choices.prototype.toChoice = function(choice) {
  if (choice.type === 'separator') {
    if (!choice.isSeparator) {
      choice = this.separator(choice.line, this.options);
    }
    return choice;
  }

  choice = this.choice(choice);
  if (!choice.disabled) {
    choice.index = this.items.length;
  }
  return choice;
};

/**
 * Add a normalized `choice` object to the `choices` array.
 *
 * ```js
 * choices.addChoice(['a', 'b', 'c']);
 * ```
 * @param {string|Object} `choice` One or more choices to add.
 * @api public
 */

Choices.prototype.addChoice = function(choice) {
  choice = this.toChoice(choice);
  if (!choice.disabled && choice.type !== 'separator') {
    this.keymap[choice.key] = choice;
    this.keys.push(choice.key);
    this.items.push(choice);
  }
  this.choices.push(choice);
  return this;
};

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

  if (this.options.radio === true && choices.length >= 2) {
    var blank = this.separator('');
    var line = this.separator();
    choices = [blank, 'all', 'none', line].concat(choices);
  }

  for (var i = 0; i < choices.length; i++) {
    this.addChoice(choices[i]);
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

Choices.prototype.addGroups = function(choices) {
  var head = [];
  var rest = [this.separator(this.options)];
  var keys = Object.keys(choices);

  for (var i = 0; i < keys.length; i++) {
    var key = keys[i];
    var arr = choices[key];

    head.push({name: key, choices: arr});

    var len = arr.length;
    var idx = -1;
    while (++idx < len) {
      var choice = arr[idx];
      rest.push({name: choice, group: key});
    }
  }

  return head.concat(rest);
};

/**
 * Create a new `Separator` object. See [choices-separator][]
 * for more details.
 *
 * ```js
 * choices.separator();
 * ```
 * @param {String} `separator` Optionally pass a string to use as the separator.
 * @return {Object} Returns a separator object.
 * @api public
 */

Choices.prototype.separator = function(separator, options) {
  return new utils.Separator(separator, options);
};

/**
 * Returns true if a choice exists.
 *
 * ```js
 * choices.hasChoice(1);
 * choices.hasChoice('foo');
 * ```
 * @param {Number} `val` The index or key of the choice to check for.
 * @return {Boolean}
 * @api public
 */

Choices.prototype.hasChoice = function(val) {
  return typeof this.get(val) !== 'undefined';
};

/**
 * Get the choice or separator object at the specified index.
 *
 * ```js
 * var choice = choices.get(1);
 * ```
 * @param {Number|String} `key` The name or index of the object to get
 * @return {Object} Returns the specified choice
 * @api public
 */

Choices.prototype.get = function(key) {
  if (typeof key === 'string') {
    key = this.getIndex(key);
  }
  if (!utils.isNumber(key)) {
    throw new TypeError('expected index to be a number or string');
  }
  return this.getChoice(key);
};

/**
 * Get a non-separator choice from the collection.
 *
 * ```js
 * choices.getChoice(1);
 * choices.getChoice('foo');
 * ```
 * @param {Number} `idx` The selected choice index
 * @return {Object|undefined} Return the matched choice object or undefined
 * @api public
 */

Choices.prototype.getChoice = function(idx) {
  if (typeof idx === 'string') {
    idx = this.getIndex(idx);
  }
  return this.items[idx];
};

/**
 * Get the index of a non-separator choice from the collection.
 *
 * ```js
 * var choices = new Choices(['foo', 'bar', 'baz']);
 * console.log(choices.getIndex('foo')); //=> 0
 * console.log(choices.getIndex('baz')); //=> 2
 * console.log(choices.getIndex('bar')); //=> 1
 * console.log(choices.getIndex('qux')); //=> -1
 * ```
 * @param {String} `key` The key of the choice to get
 * @return {Number} Index of the choice or `-1`;
 * @api public
 */

Choices.prototype.getIndex = function(key) {
  if (typeof key === 'string') {
    return this.items.indexOf(this.keymap[key]);
  }
  return this.isValidIndex(key) ? key : -1;
};

/**
 * Check the choice at the given `idx`.
 *
 * ```js
 * choices.check(1);
 * ```
 * @param {Number|Array} `val` The key(s) or index(s) of the choice(s) to check.
 * @api public
 */

Choices.prototype.check = function(val) {
  if (typeof val === 'undefined') {
    val = this.keys;
  }
  if (Array.isArray(val)) {
    visit(this, 'check', val);
    return this;
  }
  var choice = this.get(val);
  if (choice) {
    choice.checked = true;
  }
  return this;
};

/**
 * Disable the choice at the given `idx`.
 *
 * ```js
 * choices.uncheck(1);
 * ```
 * @param {Number} `idx` The index of the choice to enable.
 * @api public
 */

Choices.prototype.uncheck = function(val) {
  if (typeof val === 'undefined') {
    val = this.keys;
  }
  if (Array.isArray(val)) {
    visit(this, 'uncheck', val);
    return this;
  }
  var choice = this.get(val);
  if (choice) {
    choice.checked = false;
  }
  return this;
};

Choices.prototype.isChecked = function(val) {
  var choice = this.get(val);
  if (choice) {
    return choice.checked === true;
  }
};

/**
 * Toggle the choice at the given `idx`.
 *
 * ```js
 * choices.toggle(1);
 * // radio mode
 * choices.toggle(1, true);
 * ```
 * @param {Number} `idx` The index of the choice to toggle.
 * @api public
 */

Choices.prototype.toggle = function(val, radio) {
  if (typeof val === 'undefined') {
    val = this.keys;
  }
  if (Array.isArray(val)) {
    visit(this, 'toggle', val, radio);
    return this;
  }
  if (typeof val === 'string') {
    val = this.getIndex(val);
  }

  if (radio) {
    utils.toggle(this.items, 'checked', val);
  } else {
    var choice = this.get(val);
    if (choice) {
      choice.toggle();
    }
  }
  return this;
};

/**
 * When user press `enter` key
 */

Choices.prototype.radio = function() {
  if (this.length > 1) {
    var choice = this.get(this.position);
    if (choice.name === 'all') {
      this[choice.checked ? 'uncheck' : 'check']();
      this.toggle('none');

    } else if (choice.name === 'none') {
      this.uncheck();
      this.check(this.position);

    } else {
      this.uncheck(['all', 'none']);
      this.toggle(this.position);
    }

  } else {
    this.toggle(this.position);
  }
};

/**
 * Render the current choice "line".
 *
 * @param {Number} `position` Cursor position
 * @param {Object} `options`
 * @return {String}
 * @api public
 */

Choices.prototype.render = function(position, options) {
  var opts = utils.extend({}, this.options, options);
  var buf = '';

  this.position = position || 0;
  for (var i = 0; i < this.choices.length; i++) {
    buf += this.choices[i].render(this.position, opts);
  }

  var str = '\n' + buf.replace(/\s+$/, '');
  return this.paginator.paginate(str, this.position, opts.limit);
};

/**
 * Return choice values for choices that return truthy based
 * on the given `val`.
 *
 * @param {Object|Function|String|RegExp} `val`
 * @return {Array} Matching choices or empty array
 * @api public
 */

Choices.prototype.where = function(val) {
  if (typeof val === 'function') {
    return this.filter(val);
  }

  if (typeof val === 'string') {
    return this.filter(function(choice) {
      return choice.name === val || choice.key === val;
    });
  }

  if (utils.typeOf(val) === 'regexp') {
    return this.filter(function(choice) {
      return val.test(choice.name) || val.test(choice.key);
    });
  }

  if (utils.isObject(val)) {
    return this.filter(function(choice) {
      for (var key in val) {
        if (!choice.hasOwnProperty(key)) {
          return false;
        }
        return val[key] === choice[key];
      }
    });
  }

  if (Array.isArray(val)) {
    var acc = [];
    for (var i = 0; i < val.length; i++) {
      acc = acc.concat(this.where.call(this, val[i]));
    }
    return acc;
  }

  return [];
};

/**
 * Returns true if the given `index` is a valid choice index.
 * @param {String} `key` Property name to use for plucking objects.
 * @return {Array} Plucked objects
 * @api public
 */

Choices.prototype.isValidIndex = function(idx) {
  return utils.isNumber(idx) && idx !== -1 && idx < this.items.length;
};

/**
 * Return the `.key` property from the choice at the given index.
 * @param {String} `key` Property name to use for plucking objects.
 * @return {Array} Plucked objects
 * @api public
 */

Choices.prototype.key = function(key) {
  return this.getChoice(key).key;
};

/**
 * Pluck an object with the specified key from the choices collection.
 * @param {String} `key` Property name to use for plucking objects.
 * @return {Array} Plucked objects
 * @api public
 */

Choices.prototype.pluck = function(key) {
  return this.items.map(function(choice) {
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

/**
 * Getter for getting the checked choices from the collection.
 * @name .checked
 * @api public
 */

Object.defineProperty(Choices.prototype, 'checked', {
  set: function() {
    throw new Error('.checked is a getter and cannot be defined');
  },
  get: function() {
    var opts = this.options;
    return this.items.reduce(function(acc, choice) {
      if (opts.radio && (choice.name === 'all' || choice.name === 'none')) {
        return acc;
      }
      if (choice.checked === true) {
        acc.push(opts.objects ? choice : choice.value);
      }
      return acc;
    }, []);
  }
});

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
 * Create a new `Separator` object. See [choices-separator][] for more details.
 *
 * ```js
 * new Choices.Separator();
 * ```
 * @param {String} `separator` Optionally pass a string to use as the separator.
 * @return {Object} Returns a separator object.
 * @api public
 */

Choices.Separator = utils.Separator;

/**
 * Create a new `Separator` object. See [choices-separator][] for more details.
 *
 * ```js
 * var Choices = require('prompt-choices');
 * var choices = new Choices(['foo']);
 * console.log(Choices.isChoices(choices)); //=> true
 * console.log(Choices.isChoices({})); //=> false
 * ```
 * @param {String} `separator` Optionally pass a string to use as the separator.
 * @return {Object} Returns a separator object.
 * @api public
 */

Choices.isChoices = function(choices) {
  return utils.isObject(choices) && choices.isChoices;
};

/**
 * Create a new `Separator` object. See [choices-separator][] for more details.
 *
 * ```js
 * var Choices = require('prompt-choices');
 * var choices = new Choices(['foo']);
 * var foo = choices.getChoice('foo');
 * console.log(Choices.isChoice(foo)); //=> true
 * console.log(Choices.isChoice({})); //=> false
 * ```
 * @param {String} `separator` Optionally pass a string to use as the separator.
 * @return {Object} Returns a separator object.
 * @api public
 */

Choices.isChoice = function(choice) {
  return utils.isObject(choice) && choice.isChoice;
};

/**
 * Expose `Choices`
 */

module.exports = Choices;
