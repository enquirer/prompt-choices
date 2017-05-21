'use strict';

require('mocha');
var assert = require('assert');
var isWindows = require('is-windows');
var Separator = require('choices-separator');
var Actions = require('prompt-actions');
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

    it('should return an existing choices instance', function() {
      var fixture = ['foo', 'bar', 'baz'];
      var initial = new Choices(fixture);
      var choices = new Choices(initial);
      assert(initial === choices);
      assert.deepEqual(initial, choices);
      assert.deepEqual(choices.original, fixture);
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

  describe('.addChoices', function() {
    it('should add choices after instantiation', function() {
      var choices = new Choices();
      assert.deepEqual(choices.choices, []);
      choices.addChoices(['foo', 'bar', 'baz', {name: 'qux', disabled: true}]);
      assert.deepEqual(choices.choices, [
        {
          checked: false,
          name: 'foo',
          short: 'foo',
          value: 'foo'
        },
        {
          checked: false,
          name: 'bar',
          short: 'bar',
          value: 'bar'
        },
        {
          checked: false,
          name: 'baz',
          short: 'baz',
          value: 'baz'
        },
        {
          checked: false,
          name: 'qux',
          short: 'qux',
          value: 'qux'
        }
      ]);
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
    it('should not be checked by default', function() {
      var fixture = ['foo', 'bar', 'baz'];
      var choices = new Choices(fixture);
      assert.equal(choices.get('foo').checked, false);
      assert.equal(choices.get('bar').checked, false);
      assert.equal(choices.get('baz').checked, false);
    });

    it('should toggle all choices', function() {
      var fixture = ['foo', 'bar', 'baz'];
      var choices = new Choices(fixture);
      choices.toggle();
      assert.equal(choices.get('foo').checked, true);
      assert.equal(choices.get('bar').checked, true);
      assert.equal(choices.get('baz').checked, true);
      choices.toggle();
      assert.equal(choices.get('foo').checked, false);
      assert.equal(choices.get('bar').checked, false);
      assert.equal(choices.get('baz').checked, false);
    });

    it('should toggle the checked value for the given choice', function() {
      var fixture = ['foo', 'bar', 'baz', 'qux', 'fez'];
      var choices = new Choices(fixture);

      choices.toggle(0);
      assert.equal(choices.get('foo').checked, true);
      assert.equal(choices.get('bar').checked, false);
      assert.equal(choices.get('baz').checked, false);
      assert.equal(choices.get('qux').checked, false);
      assert.equal(choices.get('fez').checked, false);
      choices.toggle(0);
      assert.equal(choices.get('foo').checked, false);
      assert.equal(choices.get('bar').checked, false);
      assert.equal(choices.get('baz').checked, false);
      assert.equal(choices.get('qux').checked, false);
      assert.equal(choices.get('fez').checked, false);
    });

    it('should "radio" toggle all other choices when specified', function() {
      var fixture = ['foo', 'bar', 'baz', 'qux', 'fez'];
      var choices = new Choices(fixture);

      choices.toggle(0);
      assert.equal(choices.get('foo').checked, true);
      assert.equal(choices.get('bar').checked, false);
      assert.equal(choices.get('baz').checked, false);
      assert.equal(choices.get('qux').checked, false);
      assert.equal(choices.get('fez').checked, false);

      choices.toggle(0, true);
      assert.equal(choices.get('foo').checked, false);
      assert.equal(choices.get('bar').checked, true);
      assert.equal(choices.get('baz').checked, true);
      assert.equal(choices.get('qux').checked, true);
      assert.equal(choices.get('fez').checked, true);

      choices.toggle(4, true);
      assert.equal(choices.get('foo').checked, true);
      assert.equal(choices.get('bar').checked, true);
      assert.equal(choices.get('baz').checked, true);
      assert.equal(choices.get('qux').checked, true);
      assert.equal(choices.get('fez').checked, false);

      choices.toggle(4, true);
      assert.equal(choices.get('foo').checked, false);
      assert.equal(choices.get('bar').checked, false);
      assert.equal(choices.get('baz').checked, false);
      assert.equal(choices.get('qux').checked, false);
      assert.equal(choices.get('fez').checked, true);

      choices.check(2);
      assert.equal(choices.get('foo').checked, false);
      assert.equal(choices.get('bar').checked, false);
      assert.equal(choices.get('baz').checked, true);
      assert.equal(choices.get('qux').checked, false);
      assert.equal(choices.get('fez').checked, true);

      choices.toggle(2, true);
      assert.equal(choices.get('foo').checked, true);
      assert.equal(choices.get('bar').checked, true);
      assert.equal(choices.get('baz').checked, false);
      assert.equal(choices.get('qux').checked, true);
      assert.equal(choices.get('fez').checked, true);
    });

    it('should uncheck all other choices', function() {
      var fixture = ['foo', 'bar', 'baz'];
      var choices = new Choices(fixture);
      choices.toggle(1);
      assert.deepEqual(choices.items[1], {
        checked: true,
        name: 'bar',
        value: 'bar',
        short: 'bar'
      });

      assert.deepEqual(choices.items[2], {
        checked: false,
        name: 'baz',
        value: 'baz',
        short: 'baz'
      });
    });
  });

  describe('.check', function() {
    it('should check a choice', function() {
      var fixture = ['foo', 'bar', 'baz'];
      var choices = new Choices(fixture);
      choices.check(2);
      assert.deepEqual(choices.items[2], {
        checked: true,
        name: 'baz',
        value: 'baz',
        short: 'baz'
      });
    });

    it('should check an array of choices', function() {
      var fixture = ['foo', 'bar', 'baz'];
      var choices = new Choices(fixture);
      choices.uncheck();
      choices.check([0, 1]);
      assert.equal(choices.get('foo').checked, true)
      assert.equal(choices.get('bar').checked, true);
      assert.equal(choices.get('baz').checked, false);
    });

    it('should check all choices', function() {
      var fixture = ['foo', 'bar', 'baz'];
      var choices = new Choices(fixture);
      choices.toggle();
      choices.check();
      assert.equal(choices.get('foo').disabled, false)
      assert.equal(choices.get('bar').disabled, false);
      assert.equal(choices.get('baz').disabled, false);
    });

    it('should uncheck disabled choices', function() {
      var fixture = ['foo', 'bar', 'baz'];
      var choices = new Choices(fixture);
      choices.uncheck();
      assert.equal(choices.get('foo').checked, false)
      assert.equal(choices.get('bar').checked, false);
      assert.equal(choices.get('baz').checked, false);

      choices.toggle();
      choices.check();
      assert.equal(choices.get('foo').checked, true)
      assert.equal(choices.get('bar').checked, true);
      assert.equal(choices.get('baz').checked, true);
    });
  });

  describe('.uncheck', function() {
    it('should uncheck a choice', function() {
      var fixture = ['foo', 'bar', 'baz'];
      var choices = new Choices(fixture);
      choices.uncheck(2);
      assert.deepEqual(choices.items[2], {
        checked: false,
        name: 'baz',
        value: 'baz',
        short: 'baz'
      });
    });

    it('should uncheck an array of choices', function() {
      var fixture = ['foo', 'bar', 'baz'];
      var choices = new Choices(fixture);
      choices.toggle();
      choices.uncheck([0, 1]);
      assert.equal(choices.get('foo').checked, false)
      assert.equal(choices.get('bar').checked, false);
      assert.equal(choices.get('baz').checked, true);
    });

    it('should uncheck all choices', function() {
      var fixture = ['foo', 'bar', 'baz'];
      var choices = new Choices(fixture);
      choices.toggle();
      choices.uncheck();
      assert.equal(choices.get('foo').checked, false)
      assert.equal(choices.get('bar').checked, false);
      assert.equal(choices.get('baz').checked, false);
    });

    it('should uncheck disabled choices', function() {
      var fixture = ['foo', 'bar', 'baz'];
      var choices = new Choices(fixture);
      choices.toggle();
      assert.equal(choices.get('foo').checked, true)
      assert.equal(choices.get('bar').checked, true);
      assert.equal(choices.get('baz').checked, true);

      choices.uncheck();
      assert.equal(choices.get('foo').checked, false)
      assert.equal(choices.get('bar').checked, false);
      assert.equal(choices.get('baz').checked, false);
    });
  });

  describe('.hasChoice', function() {
    it('should return true if the given choice exists', function() {
      var fixture = ['foo', 'bar', 'baz'];
      var choices = new Choices(fixture);
      assert(choices.hasChoice('foo'));
      assert(choices.hasChoice('bar'));
      assert(choices.hasChoice('baz'));
    });

    it('should return false if the given choice does not exist', function() {
      var fixture = ['foo', 'bar', 'baz'];
      var choices = new Choices(fixture);
      assert(!choices.hasChoice('qux'));
      assert(!choices.hasChoice('fez'));
    });
  });

  describe('.get', function() {
    it('should get a choice by index', function() {
      var fixture = ['foo', 'bar', 'baz'];
      var choices = new Choices(fixture);

      assert.deepEqual(choices.get(1), {
        checked: false,
        name: 'bar',
        value: 'bar',
        short: 'bar'
      });
    });

    it('should get a choice by key', function() {
      var fixture = ['foo', 'bar', 'baz'];
      var choices = new Choices(fixture);

      assert.deepEqual(choices.get('bar'), {
        checked: false,
        name: 'bar',
        value: 'bar',
        short: 'bar'
      });
    });

    it('should throw an error when choice is not valid', function() {
      var fixture = ['foo', 'bar', 'baz'];
      var choices = new Choices(fixture);
      var count = 0;

      assert.throws(function() {
        count++;
        choices.get({});
      }, /expected/);

      assert.equal(count, 1);
    });
  });

  describe('.key', function() {
    it('should get the key for a choice', function() {
      var fixture = ['foo', 'bar', 'baz'];
      var choices = new Choices(fixture);

      assert.deepEqual(choices.key(1), 'bar');
      assert.deepEqual(choices.key(0), 'foo');
    });
  });

  describe('.checked', function() {
    it('should get only checked items', function() {
      var fixture = ['foo', 'bar', 'baz', 'qux'];
      var choices = new Choices(fixture);
      choices.check([1, 3]);

      assert.equal(choices.checked.length, 2);
      assert.equal(choices.checked[0], 'bar');
      assert.equal(choices.checked[1], 'qux');
    });

    it('should throw when set', function() {
      var fixture = ['foo', 'bar', 'baz', 'qux'];
      var choices = new Choices(fixture);
      assert.throws(function() {
        choices.checked = ['foo'];
      });
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
    it('should filter choices with the given function', function() {
      var fixture = ['foo', 'bar', 'baz'];
      var choices = new Choices(fixture);

      var fn = function(choice, i) {
        return choice.name === 'bar';
      };

      assert.deepEqual(choices.filter(fn), [{
        checked: false,
        name: 'bar',
        value: 'bar',
        short: 'bar'
      }]);
    });
  });

  describe('.pluck', function() {
    it('should pluck choice content by property name', function () {
      var choices = new Choices([{name: 'f', key: 'foo'}, {name: 'b', key: 'bar'}]);
      assert.deepEqual(choices.pluck('name'), ['f', 'b']);
    });

    it('should pluck choice content by property value', function () {
      var choices = new Choices([{name: 'f', key: 'foo'}, {name: 'b', key: 'bar'}]);
      assert.deepEqual(choices.pluck('key'), ['foo', 'bar']);
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

    it('should get the choices that match the given function', function() {
      var fixture = ['foo', 'bar', 'baz'];
      var choices = new Choices(fixture);

      var fn = function(choice) {
        return choice.name === 'bar';
      };

      assert.deepEqual(choices.where(fn), [
        {
          checked: false,
          name: 'bar',
          value: 'bar',
          short: 'bar'
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

    it('should get the choices that matches elements in an array of objects', function() {
      var fixture = ['foo', 'bar', 'baz'];
      var choices = new Choices(fixture);

      assert.deepEqual(choices.where([{name: 'foo'}, {name: 'bar'}]), [
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
        }
      ]);
    });

    it('should get the choices that matches elements in an array of strings', function() {
      var fixture = ['foo', 'bar', 'baz'];
      var choices = new Choices(fixture);

      assert.deepEqual(choices.where(['baz', 'bar']), [
        {
          checked: false,
          name: 'baz',
          value: 'baz',
          short: 'baz'
        },
        {
          checked: false,
          name: 'bar',
          value: 'bar',
          short: 'bar'
        }
      ]);
    });

    it('should get the choices that matches elements in an array of mixed values', function() {
      var fixture = ['foo', 'bar', 'baz'];
      var choices = new Choices(fixture);

      var fn = function(choice) {
        return choice.name === 'foo';
      };

      assert.deepEqual(choices.where([fn, 'bar', {name: 'baz'}]), [
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
        },
        {
          checked: false,
          name: 'baz',
          value: 'baz',
          short: 'baz'
        }
      ]);
    });

    it('should not get a choice when the object key does not exist', function() {
      var fixture = ['foo', 'bar', 'baz'];
      var choices = new Choices(fixture);

      assert.deepEqual(choices.where({wrong: 'foo'}), []);
    });
  });

  describe('.render', function() {
    it('should render choices', function() {
      var fixture = ['foo', 'bar', 'baz'];
      var choices = new Choices(fixture);
      var res = choices.render(0);
      if (isWindows()) {
        assert.equal(res, '\n\u001b[36m❯\u001b[39m( ) foo\n ( ) bar\n ( ) baz');
      } else {
        assert.equal(res, '\n\u001b[36m❯\u001b[39m◯ foo\n ◯ bar\n ◯ baz');
      }
    });

    it('should put the cursor next to the specified choice', function() {
      var fixture = ['foo', 'bar'];
      var choices = new Choices(fixture);
      var res = choices.render(1);
      if (isWindows()) {
        assert.equal(res, '\n ( ) foo\n\u001b[36m❯\u001b[39m( ) bar');
      } else {
        assert.equal(res, '\n ◯ foo\n\u001b[36m❯\u001b[39m◯ bar');
      }
    });

    it('should render an enabled choice', function() {
      var fixture = ['foo', 'bar', 'baz'];
      var choices = new Choices(fixture);
      choices.getChoice(1).toggle();
      var res = choices.render(0);
      if (isWindows()) {
        assert.equal(res, '\n\u001b[36m❯\u001b[39m( ) foo\n \u001b[32m(*)\u001b[39m bar\n ( ) baz');
      } else {
        assert.equal(res, '\n\u001b[36m❯\u001b[39m◯ foo\n \u001b[32m◉\u001b[39m bar\n ◯ baz');
      }
    });

    it('should render a disabled choice', function() {
      var fixture = ['foo', 'bar', 'baz'];
      var choices = new Choices(fixture);
      choices.getChoice(1).disabled = true;
      var res = choices.render(0);
      if (isWindows()) {
        assert.equal(res, '\n\u001b[36m❯\u001b[39m( ) foo\n \u001b[90m(|)\u001b[39m \u001b[2mbar (Disabled)\u001b[22m\n ( ) baz');
      } else {
        assert.equal(res, '\n\u001b[36m❯\u001b[39m◯ foo\n \u001b[90mⒾ\u001b[39m \u001b[2mbar (Disabled)\u001b[22m\n ◯ baz');
      }
    });
  });

  describe('.paginate', function() {
    it('should paginate choices when specified', function() {
      var fixture = ['foo', 'bar', 'baz', 'qux', 'fez', 'faz'];
      var choices = new Choices(fixture);
      var res = choices.render(0, {paginate: true, limit: 4});
      if (isWindows()) {
        assert.equal(res, '\n ( ) bar\n ( ) baz\n ( ) qux\n ( ) fez\n\u001b[2m(Move up and down to reveal more choices)\u001b[22m');
      } else {
        assert.equal(res, '\n ◯ bar\n ◯ baz\n ◯ qux\n ◯ fez\n\u001b[2m(Move up and down to reveal more choices)\u001b[22m');
      }
    });
  });

  describe('.actions', function() {
    it('should allow .actions to be set', function() {
      var choices = new Choices();
      assert.doesNotThrow(function() {
        choices.actions = new Actions(choices);
      });
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
      var actions = new Actions(choices);
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
});
