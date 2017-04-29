var Choices = require('..');
var choices = new Choices(['foo', 'bar', 'baz']);
choices.options.prefix = '>>>';


console.log(choices.get('foo'))
console.log(choices.get('bar'))

console.log(choices.render(1))
