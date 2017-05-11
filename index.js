'use strict';

var Paginator = require('terminal-paginator');
var debug = require('debug')('prompt-choices');
var define = require('define-property');
var visit = require('collection-visit');
var Actions = require('./lib/actions');
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

function Choices(choices, options) {
  debug('initializing from <%s>', __filename);
  if (utils.isObject(choices) && choices.isChoices) {
    return choices;
  }
  this.options = options || {};
  define(this, 'isChoices', true);
  define(this, 'answers', this.options.answers || {});
  this.original = utils.clone(choices);
  this.paginator = new Paginator(this.options);
  this.position = 0;
  this.choices = [];
  this.items = [];
  this.keys = [];
  this.keymap = {};
  this.addChoices(choices);
}

/**
 * Render the current choices.
 *
 * @param {Number} `position` Cursor position
 * @param {Object} `options`
 * @return {String}
 * @api public
 */

Choices.prototype.render = function(position, options) {
  var opts = utils.extend({}, this.options, options);
  var len = this.choices.length;
  var idx = -1;
  var buf = '';

  this.position = position || 0;
  while (++idx < len) {
    buf += this.choices[idx].render(this.position, opts);
  }

  var str = '\n' + buf.replace(/\s+$/, '');
  return this.paginator.paginate(str, this.position, opts.limit);
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
  var len = choices.length;
  var idx = -1;

  while (++idx < len) {
    this.addChoice(choices[idx]);
  }
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
  if (choice.type === 'separator') {
    if (!choice.isSeparator) {
      choice = this.separator(choice.line);
    }

  } else if (choice.disabled) {
    choice = this.choice(choice);

  } else {
    choice = this.choice(choice);
    choice.index = this.items.length;
    this.keymap[choice.key] = choice;
    this.keys.push(choice.key);
    this.items.push(choice);
  }

  // push normalized "choice" object onto array
  this.choices.push(choice);
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
  return new Choice(choice, this.options);
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
  return this.getIndex(val) !== -1;
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
 * Call the given `method` on `choices.actions`
 *
 * ```js
 * choices.action('up', 1);
 * ```
 * @param {String} `method`
 * @param {Number} `pos`
 * @api public
 */

Choices.prototype.action = function(method, pos) {
  var action = this.actions[method];
  if (typeof action !== 'function') {
    throw new Error('choices.action "' + method + '" does not exist');
  }
  return action.call(this.actions, pos);
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
    this.getChoice(val).toggle();
  }
  return this;
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
      if (opts.radio && choice.name === 'all' || choice.name === 'none') {
        return acc;
      }
      if (choice.checked === true) {
        acc.push((opts.radio || opts.objects) ? choice : choice.value);
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
 * Getter for instantiating the `Actions` utility class
 */

Object.defineProperty(Choices.prototype, 'actions', {
  set: function(actions) {
    utils.define(this, '_actions', actions);
  },
  get: function() {
    if (!this._actions) {
      utils.define(this, '_actions', new Actions(this, this.options));
    }
    return this._actions;
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
