'use strict';

require('mocha');
var assert = require('assert');
var isWindows = require('is-windows');
var Actions = require('../lib/actions');
var Choices = require('..');

describe('Actions', function() {
  it('should export a function', function() {
    assert.equal(typeof Actions, 'function');
  });

  it('should instantiate', function() {
    var choices = new Choices(['foo', 'bar']);
    var actions = new Actions(choices, {});
    assert(actions instanceof Actions);
  });

  it('should throw an error when undefined', function() {
    assert.throws(function() {
      new Actions();
    });
  });

  it('should toggle a choice when actions.space is called', function() {
    var choices = new Choices(['foo', 'bar']);
    var actions = new Actions(choices, {});

    choices.toggle();
    assert.equal(choices.get('foo').checked, true);
    assert.equal(choices.get('bar').checked, true);

    actions.space(0);
    assert.equal(choices.get('foo').checked, false);
  });

  it('should move the pointer up', function() {
    var fixture = ['foo', 'bar', 'baz'];
    var choices = new Choices(fixture);
    var actions = new Actions(choices);
    var res = choices.render(0);
    if (isWindows()) {
      assert.equal(res, '\n\u001b[36m>\u001b[39m( ) foo\n ( ) bar\n ( ) baz');
    } else {
      assert.equal(res, '\n\u001b[36m❯\u001b[39m◯ foo\n ◯ bar\n ◯ baz');
    }

    choices.position = actions.up(1);
    res = choices.render(1);

    if (isWindows()) {
      assert.equal(res, '\n ( ) foo\n\u001b[36m>\u001b[39m( ) bar\n ( ) baz');
    } else {
      assert.equal(res, '\n ◯ foo\n\u001b[36m❯\u001b[39m◯ bar\n ◯ baz');
    }
  });

  it('should not move the pointer down when on the last choice', function() {
    var fixture = ['foo', 'bar', 'baz'];
    var choices = new Choices(fixture);
    var actions = new Actions(choices);
    var res = choices.render(2);
    if (isWindows()) {
      assert.equal(res, '\n ( ) foo\n ( ) bar\n\u001b[36m❯\u001b[39m( ) baz');
    } else {
      assert.equal(res, '\n ◯ foo\n ◯ bar\n\u001b[36m❯\u001b[39m◯ baz');
    }

    choices.position = actions.down(1);
    res = choices.render(choices.position);

    if (isWindows()) {
      assert.equal(res, '\n ( ) foo\n ( ) bar\n\u001b[36m❯\u001b[39m( ) baz');
    } else {
      assert.equal(res, '\n ◯ foo\n ◯ bar\n\u001b[36m❯\u001b[39m◯ baz');
    }
  });

  it('should move the pointer in the given direction', function() {
    var fixture = ['foo', 'bar', 'baz'];
    var choices = new Choices(fixture);
    var actions = new Actions(choices);
    var res = choices.render(0);

    if (isWindows()) {
      assert.equal(res, '\n\u001b[36m>\u001b[39m( ) foo\n ( ) bar\n ( ) baz');
    } else {
      assert.equal(res, '\n\u001b[36m❯\u001b[39m◯ foo\n ◯ bar\n ◯ baz');
    }

    choices.position = actions.up(1);
    res = choices.render(1);

    if (isWindows()) {
      assert.equal(res, '\n ( ) foo\n\u001b[36m>\u001b[39m( ) bar\n ( ) baz');
    } else {
      assert.equal(res, '\n ◯ foo\n\u001b[36m❯\u001b[39m◯ bar\n ◯ baz');
    }
  });

  it('should move the cursor up one row', function() {
    var fixture = ['foo', 'bar', 'baz'];
    var choices = new Choices(fixture);
    var actions = new Actions(choices);
    var res = choices.render(1);

    assert.equal(choices.position, 1);
    if (isWindows()) {
      assert.equal(res, '\n ◯ foo\n\u001b[36m❯\u001b[39m◯ bar\n ◯ baz');
    } else {
      assert.equal(res, '\n ◯ foo\n\u001b[36m❯\u001b[39m◯ bar\n ◯ baz');
    }

    choices.position = actions.up(1);
    assert.equal(choices.position, 0);
    res = choices.render(choices.position);

    if (isWindows()) {
      assert.equal(res, '\n\u001b[36m❯\u001b[39m◯ foo\n ◯ bar\n ◯ baz');
    } else {
      assert.equal(res, '\n\u001b[36m❯\u001b[39m◯ foo\n ◯ bar\n ◯ baz');
    }
  });

  it('should move the cursor and select the given number', function() {
    var fixture = ['foo', 'bar', 'baz'];
    var choices = new Choices(fixture);
    var actions = new Actions(choices);
    var res = choices.render(1);

    assert.equal(choices.position, 1);
    if (isWindows()) {
      assert.equal(res, '\n ◯ foo\n\u001b[36m❯\u001b[39m◯ bar\n ◯ baz');
    } else {
      assert.equal(res, '\n ◯ foo\n\u001b[36m❯\u001b[39m◯ bar\n ◯ baz');
    }

    choices.position = actions.down(1);
    assert.equal(choices.position, 2);

    choices.position = actions.number(1);
    assert.deepEqual(choices.checked, ['foo']);

    res = choices.render(choices.position);
    if (isWindows()) {
      assert.equal(res, '\n\u001b[36m❯\u001b[39m\u001b[32m◉\u001b[39m foo\n ◯ bar\n ◯ baz');
    } else {
      assert.equal(res, '\n\u001b[36m❯\u001b[39m\u001b[32m◉\u001b[39m foo\n ◯ bar\n ◯ baz');
    }

    choices.position = actions.number(3);
    assert.deepEqual(choices.checked, ['foo', 'baz']);

    res = choices.render(choices.position);
    if (isWindows()) {
      assert.equal(res, '\n\u001b[36m❯\u001b[39m\u001b[32m◉\u001b[39m foo\n ◯ bar\n ◯ baz');
    } else {
      assert.equal(res, '\n \u001b[32m◉\u001b[39m foo\n ◯ bar\n\u001b[36m❯\u001b[39m\u001b[32m◉\u001b[39m baz');
    }
  });

  it('should use a custom Actions instance to move the cursor', function() {
    var fixture = ['foo', 'bar'];
    var choices = new Choices(fixture);
    var actions = new Actions(choices, choices.options);
    var res = choices.render(1);
    if (isWindows()) {
      assert.equal(res, '\n ( ) foo\n\u001b[36m❯\u001b[39m( ) bar');
    } else {
      assert.equal(res, '\n ◯ foo\n\u001b[36m❯\u001b[39m◯ bar');
    }

    choices.position = actions.up(1);
    choices.render(2);

    if (isWindows()) {
      assert.equal(res, '\n ( ) foo\n\u001b[36m❯\u001b[39m( ) bar');
    } else {
      assert.equal(res, '\n ◯ foo\n\u001b[36m❯\u001b[39m◯ bar');
    }
  });
});
