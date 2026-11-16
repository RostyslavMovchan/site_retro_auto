const { test } = require('node:test');
const assert = require('node:assert/strict');
const { quoteRental, mountCalculator } = require('../assets/js/widget.js');
const base = { car: 'Ford Mustang 1967', rawHours: '3', driver: true, decor: false };

for (const [name, overrides, expected] of [
  ['default', {}, 10200],
  ['lower boundary', { rawHours: '2' }, 6800],
  ['upper boundary', { rawHours: '12' }, 40800],
  ['all extras', { rawHours: '4', decor: true }, 14800],
  ['no extras', { driver: false }, 8700],
  ['different car', { car: 'Volkswagen Beetle 1972' }, 6000],
]) {
  test(name, () => assert.equal(quoteRental({ ...base, ...overrides }).total, expected));
}
for (const value of ['', ' ', '0', '-5', '1', '13', '99999999999999999999', '2.5', 'abc', 'Infinity', 'NaN', '2e0']) {
  test('rejects ' + JSON.stringify(value), () => {
    const quote = quoteRental({ ...base, rawHours: value });
    assert.equal(quote.total, null);
    assert.ok(quote.errors.hours);
  });
}
test('native bad input', () => assert.ok(quoteRental({ ...base, badInput: true }).errors.hours));
test('unknown car', () => assert.ok(quoteRental({ ...base, car: '999' }).errors.car));
test('absent elements are safe', () => {
  assert.doesNotThrow(() => mountCalculator(null));
  assert.doesNotThrow(() => mountCalculator({ querySelector: () => null }));
});
