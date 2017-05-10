'use strict';

require('mocha');
var assert = require('assert');
var isWindows = require('is-windows');
var Choice = require('../lib/choice');

describe('choice', function() {
  it('should export a function', function() {
    assert.equal(typeof Choice, 'function');
  });

  it('should instantiate', function() {
    var choice = new Choice('foo');
    assert(choice instanceof Choice);
  });

  it('should throw an error when undefined', function() {
    assert.throws(function() {
      new Choice();
    });
  });

  it('should enable the choice', function() {
    var choice = new Choice({name: 'foo'});
    choice.checked = true;
    assert.equal(choice.checked, true);
  });

  it('should disabled the choice', function() {
    var choice = new Choice({name: 'foo'});
    choice.checked = false;
    assert.equal(choice.checked, false);
  });

  it('should create a separator choice', function() {
    var choice = new Choice({type: 'separator'});
    assert(choice.isSeparator);
  });

  it('should return a choice if already an instance', function() {
    var foo = new Choice('foo');
    var bar = new Choice(foo);
    assert.strictEqual(bar, foo);
  });

  it('should set choice.name with the given string', function() {
    var choice = new Choice('foo');
    assert.deepEqual(choice.name, 'foo');
  });

  it('should set choice.name from value', function() {
    var choice = new Choice({value: 'foo'});
    assert.deepEqual(choice.name, 'foo');
  });

  it('should take a custom pointer', function() {
    var choice = new Choice({name: 'foo'}, {pointer: '>'});
    assert.deepEqual(choice.pointer, '>');
  });

  it('should get choice.pointer', function() {
    var choice = new Choice({name: 'foo'});
    if (isWindows()) {
      assert.deepEqual(choice.pointer, '\u001b[36m>\u001b[39m');
    } else {
      assert.deepEqual(choice.pointer, '\u001b[36m❯\u001b[39m');
    }
  });

  it('should throw when trying to set choice.symbol', function() {
    var choice = new Choice({name: 'foo'});
    assert.throws(function() {
      choice.symbol = 'foo';
    });
  });

  it('should get choice.line', function() {
    var choice = new Choice({name: 'foo'});
    assert.equal(choice.line, '\u001b[36m❯\u001b[39m◯ foo\n');
  });

  it('should get a disabled choice.line', function() {
    var choice = new Choice({name: 'foo'});
    choice.disabled = true;
    assert.equal(choice.line, ' \u001b[90mⓧ\u001b[39m \u001b[2mfoo (Disabled)\u001b[22m\n');
  });

  it('should get a disabled choice.line with custom message', function() {
    var choice = new Choice({name: 'foo'});
    choice.checked = false;
    choice.disabled = 'N/A';
    assert.equal(choice.line, ' \u001b[90mⓧ\u001b[39m \u001b[2mfoo (N/A)\u001b[22m\n');
  });

  it('should call a custom disabled function', function() {
    var choice = new Choice({name: 'foo'});
    choice.checked = false;
    choice.disabled = function() {
      return 'N/A';
    };
    assert.equal(choice.line, ' \u001b[90mⓧ\u001b[39m \u001b[2mfoo (N/A)\u001b[22m\n');
  });

  it('should set choice.line', function() {
    var choice = new Choice({name: 'foo'});
    choice.line = 'bar';
    assert.equal(choice.line, '\u001b[36m❯\u001b[39m◯ bar\n');
  });

  it('should render a choice', function() {
    var choice = new Choice({name: 'foo'});
    if (isWindows()) {

    } else {
      assert.equal(choice.render(), ' ◯ foo\n');
    }
  });

  it('should render the pointer when choice is at the same position', function() {
    var choice = new Choice({name: 'foo'});
    if (isWindows()) {

    } else {
      assert.equal(choice.render(0), '\u001b[36m❯\u001b[39m◯ foo\n');
    }
  });

  it('should render a custom pointer', function() {
    var choice = new Choice({name: 'foo'}, {pointer: '>'});
    assert.equal(choice.render(0), '>◯ foo\n');
  });

  it('should render a custom pointer from render options', function() {
    var choice = new Choice({name: 'foo'});
    assert.equal(choice.render(0, {pointer: '>'}), '>◯ foo\n');
  });

  it('should render a separator', function() {
    var choice = new Choice({type: 'separator', value: ' ---\n'});
    assert.equal(choice.render(), ' ---\n');
  });

  it('should render a blank separator', function() {
    var choice = new Choice({type: 'separator', value: ''});
    assert.equal(choice.render(), '');
  });

  it('should render a checked choice', function() {
    var choice = new Choice({name: 'foo'});
    choice.checked = true;

    if (isWindows()) {

    } else {
      assert.equal(choice.render(), ' \u001b[32m◉\u001b[39m foo\n');
    }
  });

  it('should render a disabled choice', function() {
    var choice = new Choice({name: 'foo'});
    choice.disabled = true;

    if (isWindows()) {

    } else {
      assert.equal(choice.render(), ' \u001b[90mⓧ\u001b[39m \u001b[2mfoo (Disabled)\u001b[22m\n');
    }
  });

  it('should format a choice', function() {
    var choice = new Choice({name: 'foo'});
    choice.options.format = function(str) {
      return str.toUpperCase();
    };

    if (isWindows()) {

    } else {
      assert.equal(choice.render(), ' ◯ FOO\n');
    }
  });
});
