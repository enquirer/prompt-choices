var Choices = require('..');
var choices = new Choices(['foo', 'bar', 'baz', 'qux', 'fez'], {
  pointer: '   >>>'
});

choices.get('foo').disabled = true;
console.log(choices.get('foo'))
console.log(choices.get('bar'))
console.log(choices.render(1))
