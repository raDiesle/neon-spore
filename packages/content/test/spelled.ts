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

/**
 * `docs/spec/briefings.md`'s one count of the guided waves, *one hundred and seven of the
 * two hundred and seventy-eight waves today*: read by `scenes-prose.test.ts`
 * and written by `bun run briefings:renumber`, so the two cannot spell it two
 * ways. The total drops a leading *one* — *the hundred and six waves*.
 */
export function guidedOfAll(guided: number, all: number): string {
  return `${spelled(guided)} of the ${spelled(all).replace(/^one /, "")} waves today`;
}
