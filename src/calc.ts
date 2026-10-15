export type TipResult = {
  tip: number;
  total: number;
  perPerson: number;
  tipPerPerson: number;
};

export function calculate(
  bill: number,
  tipPercent: number,
  people: number,
): TipResult {
  const safePeople = Math.max(1, Math.floor(people) || 1);
  const safeBill = Number.isFinite(bill) && bill > 0 ? bill : 0;
  const safeTip = Number.isFinite(tipPercent) && tipPercent > 0 ? tipPercent : 0;
  const tip = (safeBill * safeTip) / 100;
  const total = safeBill + tip;
  return {
    tip,
    total,
    perPerson: total / safePeople,
    tipPerPerson: tip / safePeople,
  };
}

/** Applies a keypad key to the bill string; keeps max 2 decimals and 9 integer digits. */
export function pressKey(current: string, key: string): string {
  if (key === 'back') {
    return current.slice(0, -1);
  }
  if (key === '.') {
    if (current.includes('.')) {
      return current;
    }
    return current === '' ? '0.' : current + '.';
  }
  const [int, dec] = current.split('.');
  if (dec !== undefined) {
    return dec.length >= 2 ? current : current + key;
  }
  if (int === '0') {
    return key === '0' ? current : key;
  }
  return int.length >= 9 ? current : current + key;
}

/** Sanitises free-form percent input: digits and one dot, max 3 integer / 2 decimal digits. */
export function sanitizePercent(text: string): string {
  const cleaned = text.replace(',', '.').replace(/[^0-9.]/g, '');
  const [int, ...rest] = cleaned.split('.');
  const head = int.slice(0, 3);
  if (rest.length === 0) {
    return head;
  }
  return `${head}.${rest.join('').slice(0, 2)}`;
}
