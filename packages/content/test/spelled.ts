/**
 * A count as the docs spell it: *eighty-four*, *one hundred and six*. Enough
 * for the figures `scenes-prose.test.ts` reads out of `docs/spec/briefings.md`,
 * which stay under a thousand.
 */

const ONES = [
  "zero",
  "one",
  "two",
  "three",
  "four",
  "five",
  "six",
  "seven",
  "eight",
  "nine",
  "ten",
  "eleven",
  "twelve",
  "thirteen",
  "fourteen",
  "fifteen",
  "sixteen",
  "seventeen",
  "eighteen",
  "nineteen",
];
const TENS = ["", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"];

export function spelled(n: number): string {
  if (!Number.isInteger(n) || n < 0 || n > 999) throw new Error(`spelled: ${n} is out of range`);
  if (n < 20) return ONES[n] ?? "";
  if (n < 100) {
    const ten = TENS[Math.floor(n / 10)] ?? "";
    return n % 10 === 0 ? ten : `${ten}-${ONES[n % 10]}`;
  }
  const hundreds = `${ONES[Math.floor(n / 100)]} hundred`;
  return n % 100 === 0 ? hundreds : `${hundreds} and ${spelled(n % 100)}`;
}
