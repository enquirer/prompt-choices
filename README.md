# prompt-choices [![NPM version](https://img.shields.io/npm/v/prompt-choices.svg?style=flat)](https://www.npmjs.com/package/prompt-choices) [![NPM monthly downloads](https://img.shields.io/npm/dm/prompt-choices.svg?style=flat)](https://npmjs.org/package/prompt-choices) [![NPM total downloads](https://img.shields.io/npm/dt/prompt-choices.svg?style=flat)](https://npmjs.org/package/prompt-choices) [![Linux Build Status](https://img.shields.io/travis/enquirer/prompt-choices.svg?style=flat&label=Travis)](https://travis-ci.org/enquirer/prompt-choices)

> Create an array of multiple choice objects for use in prompts.

## Install

Install with [npm](https://www.npmjs.com/):

```sh
$ npm install --save prompt-choices
```

Install with [yarn](https://yarnpkg.com):

```sh
$ yarn add prompt-choices
```

## Usage

```js
var Choices = require('prompt-choices');
var choices = new Choices(['foo', 'bar', 'baz']);
```

## API

### [Choices](index.js#L19)

Create a new `Choices` collection.

**Params**

* `choices` **{Array}**: One or more `choice` strings or objects.

**Example**

```js
var choices = new Choices(['foo', 'bar', 'baz']);
var choices = new Choices([{name: 'foo'}, {name: 'bar'}, {name: 'baz'}]);
```

### [.render](index.js#L45)

Render the current choices.

**Params**

* `position` **{Number}**: Cursor position
* `options` **{Object}**
* `returns` **{String}**

### [.addChoices](index.js#L72)

Add an array of normalized `choice` objects to the `choices` array. This method is called in the constructor, but it can also be used to add choices after instantiation.

**Params**

* `choices` **{Array|Object}**: One or more choices to add.

**Example**

```js
choices.addChoices(['a', 'b', 'c']);
```

### [.choice](index.js#L111)

Create a new `Choice` object.

**Params**

* `choice` **{String|Object}**
* `returns` **{Object}**: Returns a choice object.

**Example**

```js
choices.choice('blue');
```

### [.separator](index.js#L126)

Create a new `Separator` object. See [choices-separator](https://github.com/enquirer/choices-separator) for more details.

**Params**

* `separator` **{String}**: Optionally pass a string to use as the separator.
* `returns` **{Object}**: Returns a separator object.

**Example**

```js
choices.separator();
```

### [.hasChoice](index.js#L142)

Get a non-separator choice from the collection.

**Params**

* `idx` **{Number}**: The selected choice index
* `returns` **{Object|undefined}**: Return the matched choice object or undefined

**Example**

```js
choices.hasChoice(1);
choices.hasChoice('foo');
```

### [.getChoice](index.js#L158)

Get a non-separator choice from the collection.

**Params**

* `idx` **{Number}**: The selected choice index
* `returns` **{Object|undefined}**: Return the matched choice object or undefined

**Example**

```js
choices.getChoice(1);
choices.getChoice('foo');
```

### [.getIndex](index.js#L176)

Get the index of a non-separator choice from the collection.

**Params**

* `key` **{String}**: The key of the choice to get
* `returns` **{Number}**: Index of the choice or `-1`;

**Example**

```js
choices.getChoice('foo');
```

### [.get](index.js#L194)

Get the choice or separator object at the specified index.

**Params**

* `idx` **{Number}**: The index of the object to get
* `returns` **{Object}**: Returns the specified choice

**Example**

```js
choices.getChoice(1);
```

### [.enable](index.js#L211)

Enable the choice at the given `idx`.

**Params**

* `idx` **{Number}**: The index of the choice to enable.

**Example**

```js
choices.enable(1);
```

### [.disable](index.js#L229)

Disable the choice at the given `idx`.

**Params**

* `idx` **{Number}**: The index of the choice to enable.

**Example**

```js
choices.disable(1);
```

### [.toggle](index.js#L249)

Toggle the choice at the given `idx`.

**Params**

* `idx` **{Number}**: The index of the choice to toggle.

**Example**

```js
choices.toggle(1);
// radio mode
choices.toggle(1, true);
```

### [.where](index.js#L266)

Return choices that return truthy based on the given `val`.

**Params**

* `val` **{Object|Function|String|RegExp}**
* `returns` **{Array}**: Matching choices or empty array

### [.isValidIndex](index.js#L312)

Returns true if the given `index` is a valid choice index.

**Params**

* `key` **{String}**: Property name to use for plucking objects.
* `returns` **{Array}**: Plucked objects

### [.key](index.js#L323)

Return the `.key` property from the choice at the given index.

**Params**

* `key` **{String}**: Property name to use for plucking objects.
* `returns` **{Array}**: Plucked objects

### [.pluck](index.js#L334)

Pluck an object with the specified key from the choices collection.

**Params**

* `key` **{String}**: Property name to use for plucking objects.
* `returns` **{Array}**: Plucked objects

### [.length](index.js#L362)

Getter for getting the length of the collection.

### [.Separator](index.js#L408)

Create a new `Separator` object. See [choices-separator](https://github.com/enquirer/choices-separator) for more details.

**Params**

* `separator` **{String}**: Optionally pass a string to use as the separator.
* `returns` **{Object}**: Returns a separator object.

**Example**

```js
new Choices.Separator();
```

## Attribution

Code is partially based on the `Choices` class in Inquirer.

## About

### Related projects

* [enquirer](https://www.npmjs.com/package/enquirer): Intuitive, plugin-based prompt system for node.js. Much faster and lighter alternative to Inquirer, with all… [more](https://github.com/enquirer/enquirer) | [homepage](https://github.com/enquirer/enquirer "Intuitive, plugin-based prompt system for node.js. Much faster and lighter alternative to Inquirer, with all the same prompt types and more, but without the bloat.")
* [prompt-base](https://www.npmjs.com/package/prompt-base): Base prompt module used for creating custom prompt types for Enquirer. | [homepage](https://github.com/enquirer/prompt-base "Base prompt module used for creating custom prompt types for Enquirer.")
* [prompt-question](https://www.npmjs.com/package/prompt-question): Question object, used by Enquirer and prompt plugins. | [homepage](https://github.com/enquirer/prompt-question "Question object, used by Enquirer and prompt plugins.")

### Contributing

Pull requests and stars are always welcome. For bugs and feature requests, [please create an issue](../../issues/new).

### Building docs

_(This project's readme.md is generated by [verb](https://github.com/verbose/verb-generate-readme), please don't edit the readme directly. Any changes to the readme must be made in the [.verb.md](.verb.md) readme template.)_

To generate the readme, run the following command:

```sh
$ npm install -g verbose/verb#dev verb-generate-readme && verb
```

### Running tests

Running and reviewing unit tests is a great way to get familiarized with a library and its API. You can install dependencies and run tests with the following command:

```sh
$ npm install && npm test
```

### Author

**Jon Schlinkert**

* [github/jonschlinkert](https://github.com/jonschlinkert)
* [twitter/jonschlinkert](https://twitter.com/jonschlinkert)

### License

Copyright © 2017, [Jon Schlinkert](https://github.com/jonschlinkert).
Released under the [MIT License](LICENSE).

***

_This file was generated by [verb-generate-readme](https://github.com/verbose/verb-generate-readme), v0.6.0, on April 29, 2017._