import { calculate, pressKey, sanitizePercent } from '../src/calc';

test('calculates tip, total and split', () => {
  const r = calculate(100, 20, 4);
  expect(r.tip).toBe(20);
  expect(r.total).toBe(120);
  expect(r.perPerson).toBe(30);
});

test('guards invalid input', () => {
  expect(calculate(NaN, -5, 0)).toEqual({
    tip: 0,
    total: 0,
    perPerson: 0,
    tipPerPerson: 0,
  });
});

test('keypad input', () => {
  let v = '';
  for (const k of ['0', '0', '5', '.', '2', '5', '9']) v = pressKey(v, k);
  expect(v).toBe('5.25');
  expect(pressKey('', '.')).toBe('0.');
  expect(pressKey('5', 'back')).toBe('');
});

test('percent sanitising', () => {
  expect(sanitizePercent('12,555')).toBe('12.55');
  expect(sanitizePercent('abc1234')).toBe('123');
});
