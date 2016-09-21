'use strict';

require('mocha');
var assert = require('assert');
var Separator = require('choices-separator');
var utils = require('../lib/utils');
var Choices = require('..');

describe('prompt-choices', function() {
  describe('main export', function() {
    it('should export a function', function() {
      assert.equal(typeof Choices, 'function');
    });

    it('should instantiate', function() {
      var choices = new Choices();
      assert(choices instanceof Choices);
    });
  });

  describe('utils', function() {
    it('should arrayify a value', function() {
      assert.deepEqual(utils.arrayify('string'), ['string']);
      assert.deepEqual(utils.arrayify(['string']), ['string']);
      assert.deepEqual(utils.arrayify(), []);
    });
  });

  describe('choices', function() {
    it('should add choices passed to the ctor to the `original` array', function() {
      var fixture = ['foo', 'bar', 'baz'];
      var choices = new Choices(fixture);
      assert.deepEqual(choices.original, fixture);
    });

    it('should add normalized choices to the `items` array', function() {
      var fixture = ['foo', 'bar', 'baz'];
      var choices = new Choices(fixture);
      assert.deepEqual(choices.items, [
        {
          checked: false,
          name: 'foo',
          value: 'foo',
          short: 'foo'
        }, {
          checked: false,
          name: 'bar',
          value: 'bar',
          short: 'bar'
        }, {
          checked: false,
          name: 'baz',
          value: 'baz',
          short: 'baz'
        }
      ]);
    });
  });

  describe('.length', function() {
    it('should get the length of the choices array', function() {
      var fixture = ['foo', 'bar', 'baz'];
      var choices = new Choices(fixture);

      assert.equal(choices.length, 3);
    });

    it('should throw when length is set directly', function() {
      var fixture = ['foo', 'bar', 'baz'];
      var choices = new Choices(fixture);
      var count = 0;

      assert.throws(function() {
        count++;
        choices.length = 5;
      }, /length/);

      assert.equal(count, 1);
    });
  });

  describe('separators', function() {
    it('should add a separator to choices.choices', function() {
      var fixture = ['foo', new Choices.Separator(), 'bar', 'baz'];
      var choices = new Choices(fixture);
      assert.deepEqual(choices.choices, [
        {
          checked: false,
          name: 'foo',
          value: 'foo',
          short: 'foo'
        },
        choices.separator(),
        {
          checked: false,
          name: 'bar',
          value: 'bar',
          short: 'bar'
        }, {
          checked: false,
          name: 'baz',
          value: 'baz',
          short: 'baz'
        }
      ]);
    });

    it('should not add a separator to choices.items', function() {
      var fixture = ['foo', new Choices.Separator(), 'bar', 'baz'];
      var choices = new Choices(fixture);
      assert.deepEqual(choices.items, [
        {
          checked: false,
          name: 'foo',
          value: 'foo',
          short: 'foo'
        },
        {
          checked: false,
          name: 'bar',
          value: 'bar',
          short: 'bar'
        }, {
          checked: false,
          name: 'baz',
          value: 'baz',
          short: 'baz'
        }
      ]);
    });

    it('should convert a separator object to a separator instance', function() {
      var fixture = ['foo', {type: 'separator'}, 'bar', 'baz'];
      var choices = new Choices(fixture);
      assert.deepEqual(choices.choices, [
        {
          checked: false,
          name: 'foo',
          value: 'foo',
          short: 'foo'
        },
        choices.separator(),
        {
          checked: false,
          name: 'bar',
          value: 'bar',
          short: 'bar'
        }, {
          checked: false,
          name: 'baz',
          value: 'baz',
          short: 'baz'
        }
      ]);
    });

    it('should suport a custom separator string', function() {
      var fixture = ['foo', new Choices.Separator('==='), 'bar', 'baz'];
      var choices = new Choices(fixture);
      assert.deepEqual(choices.choices, [
        {
          checked: false,
          name: 'foo',
          value: 'foo',
          short: 'foo'
        },
        choices.separator('==='),
        {
          checked: false,
          name: 'bar',
          value: 'bar',
          short: 'bar'
        }, {
          checked: false,
          name: 'baz',
          value: 'baz',
          short: 'baz'
        }
      ]);

      assert.notDeepEqual(choices.choices, [
        {
          checked: false,
          name: 'foo',
          value: 'foo',
          short: 'foo'
        },
        choices.separator(),
        {
          checked: false,
          name: 'bar',
          value: 'bar',
          short: 'bar'
        }, {
          checked: false,
          name: 'baz',
          value: 'baz',
          short: 'baz'
        }
      ]);
    });
  });

  describe('.keymap', function() {
    it('should create a keymap of the given items', function() {
      var fixture = ['foo', 'bar', 'baz'];
      var choices = new Choices(fixture);
      assert.deepEqual(choices.keymap, {
        foo: {
          checked: false,
          name: 'foo',
          value: 'foo',
          short: 'foo'
        },
        bar: {
          checked: false,
          name: 'bar',
          value: 'bar',
          short: 'bar'
        },
        baz: {
          checked: false,
          name: 'baz',
          value: 'baz',
          short: 'baz'
        }
      });
    });
  });

  describe('.toggle', function() {
    it('should `toggle` the checked value for the given choice', function() {
      var fixture = ['foo', 'bar', 'baz'];
      var choices = new Choices(fixture);
      choices.toggle(2);
      assert.deepEqual(choices.items[2], {
        checked: true,
        name: 'baz',
        value: 'baz',
        short: 'baz'
      });
    });
  });

  describe('.toggle', function() {
    it('should `toggle` the `checked` value of all choices', function() {
      var fixture = ['foo', 'bar', 'baz'];
      var choices = new Choices(fixture);
      choices.toggle(2);
      assert.deepEqual(choices.items[2], {
        checked: true,
        name: 'baz',
        value: 'baz',
        short: 'baz'
      });
    });
  });

  describe('.enable', function() {
    it('should enable a choice', function() {
      var fixture = ['foo', 'bar', 'baz'];
      var choices = new Choices(fixture);
      choices.enable(2);
      assert.deepEqual(choices.items[2], {
        checked: true,
        name: 'baz',
        value: 'baz',
        short: 'baz'
      });
    });
  });

  describe('.disable', function() {
    it('should disable a choice', function() {
      var fixture = ['foo', 'bar', 'baz'];
      var choices = new Choices(fixture);
      choices.disable(2);
      assert.deepEqual(choices.items[2], {
        checked: false,
        name: 'baz',
        value: 'baz',
        short: 'baz'
      });
    });
  });

  describe('.get', function() {
    it('should get a choice', function() {
      var fixture = ['foo', 'bar', 'baz'];
      var choices = new Choices(fixture);

      assert.deepEqual(choices.get(1), {
        checked: false,
        name: 'bar',
        value: 'bar',
        short: 'bar'
      });
    });

    it('should throw an error when choice is not a number', function() {
      var fixture = ['foo', 'bar', 'baz'];
      var choices = new Choices(fixture);
      var count = 0;

      assert.throws(function() {
        count++;
        choices.get('foo');
      }, /expected/);
      assert.equal(count, 1);
    });
  });

  describe('.getIndex', function() {
    it('should get the index of the specified string choice', function() {
      var fixture = ['foo', 'bar', 'baz'];
      var choices = new Choices(fixture);

      assert.equal(choices.getIndex('foo'), 0);
    });

    it('should get the index of the specified numerical choice', function() {
      var fixture = ['foo', 'bar', 'baz'];
      var choices = new Choices(fixture);

      assert.equal(choices.getIndex(1), 1);
    });

    it('should return -1 when a string choice does not exist', function() {
      var fixture = ['foo', 'bar', 'baz'];
      var choices = new Choices(fixture);

      assert.equal(choices.getIndex('qux'), -1);
    });

    it('should return -1 when a numerical choice does not exist', function() {
      var fixture = ['foo', 'bar', 'baz'];
      var choices = new Choices(fixture);

      assert.equal(choices.getIndex(5), -1);
    });
  });

  describe('.getChoice', function() {
    it('should get the choice with the specified key', function() {
      var fixture = ['foo', 'bar', 'baz'];
      var choices = new Choices(fixture);

      assert.deepEqual(choices.getChoice('foo'), {
        checked: false,
        name: 'foo',
        value: 'foo',
        short: 'foo'
      });
    });

    it('should get the choice at the specified index', function() {
      var fixture = ['foo', 'bar', 'baz'];
      var choices = new Choices(fixture);

      assert.deepEqual(choices.getChoice(2), {
        checked: false,
        name: 'baz',
        value: 'baz',
        short: 'baz'
      });
    });
  });

  describe('.indexOf', function() {
    it('should get the choice with the specified key', function() {
      var fixture = ['foo', 'bar', 'baz'];
      var choices = new Choices(fixture);

      assert.deepEqual(choices.indexOf('foo'), {
        checked: false,
        name: 'foo',
        value: 'foo',
        short: 'foo'
      });
    });
  });

  describe('.forEach', function() {
    it('should iterate over choices', function() {
      var fixture = ['foo', 'bar', 'baz'];
      var choices = new Choices(fixture);

      choices.forEach(function(choice, i) {
        assert.equal(choice.name, fixture[i]);
      });
    });
  });

  describe('.filter', function() {
    it('should filter choices', function() {
      var fixture = ['foo', 'bar', 'baz'];
      var choices = new Choices(fixture);

      var arr = choices.filter(function(choice, i) {
        return choice.name === 'foo';
      });

      assert.deepEqual(choices.where('foo'), [{
        checked: false,
        name: 'foo',
        value: 'foo',
        short: 'foo'
      }]);
    });
  });

  describe('.where', function() {
    it('should get the choices that matches the given string', function() {
      var fixture = ['foo', 'bar', 'baz'];
      var choices = new Choices(fixture);

      assert.deepEqual(choices.where('foo'), [{
        checked: false,
        name: 'foo',
        value: 'foo',
        short: 'foo'
      }]);
    });

    it('should get the choices that matches the given regex', function() {
      var fixture = ['foo', 'bar', 'baz'];
      var choices = new Choices(fixture);

      assert.deepEqual(choices.where(/^b/), [
        {
          checked: false,
          name: 'bar',
          value: 'bar',
          short: 'bar'
        },
        {
          checked: false,
          name: 'baz',
          value: 'baz',
          short: 'baz'
        }
      ]);
    });

    it('should get the choices that matches the given object', function() {
      var fixture = ['foo', 'bar', 'baz'];
      var choices = new Choices(fixture);

      assert.deepEqual(choices.where({name: 'bar'}), [
        {
          checked: false,
          name: 'bar',
          value: 'bar',
          short: 'bar'
        }
      ]);
    });

    it('should get the choices that matches the given function', function() {
      var fixture = ['foo', 'bar', 'baz'];
      var choices = new Choices(fixture);

      assert.deepEqual(choices.where(function(choice) {
        return choice.name === 'bar';
      }), [
        {
          checked: false,
          name: 'bar',
          value: 'bar',
          short: 'bar'
        }
      ]);
    });

    it('should not get a choice when the object key does not exist', function() {
      var fixture = ['foo', 'bar', 'baz'];
      var choices = new Choices(fixture);

      assert.deepEqual(choices.where({wrong: 'foo'}), []);
    });
  });
});
