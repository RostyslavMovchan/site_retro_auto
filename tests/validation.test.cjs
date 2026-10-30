const assert = require('node:assert/strict');
const v = require('../assets/js/validation.js');
const cases = [
  ['validateName', '', false], ['validateName', 'А', false],
  ['validateName', 'Ірина', true], ['validateName', 'Anne-Marie', true],
  ['validateName', "Мар’яна", true], ['validateName', '  Ірина  ', true],
  ['validateName', '123', false], ['validateName', '😀😀', false],
  ['validateName', '<script>', false], ['validateName', 'а'.repeat(101), false],
  ['validateEmail', 'user@example.com', true], ['validateEmail', 'user+car@mail.example.ua', true],
  ['validateEmail', 'wrong-email', false], ['validateEmail', 'a@b', false],
  ['validateEmail', '.a@example.com', false], ['validateEmail', 'a..b@example.com', false],
  ['validateEmail', 'a@-example.com', false], ['validateEmail', 'a@exam_ple.com', false],
  ['validatePhone', '+380501234567', true], ['validatePhone', '+380671112233', true],
  ...['0501234567', '+38050123456', '+3805012345678', '+380abc123456',
      '+380 50 123 45 67', '+380(50)1234567', '+380', '+380501234567 ']
    .map(value => ['validatePhone', value, false]),
  ['validateMessage', '          ', false], ['validateMessage', 'Коротко', false],
  ['validateMessage', 'Фотосесія у Львові', true], ['validateMessage', 'a'.repeat(1500), true],
  ['validateMessage', 'a'.repeat(1501), false], ['validateMessage', '<b>Побажання</b>', true],
  ['validateAgreement', false, false], ['validateAgreement', true, true]
];
for (const [method, value, expected] of cases) {
  assert.equal(v[method](value) === '', expected, `${method}: ${JSON.stringify(value)}`);
}
console.log(`Passed ${cases.length} validation cases`);
