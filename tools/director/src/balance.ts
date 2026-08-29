import { type BalanceSheet, share } from "@neon-spore/sim";

/**
 * The balance sheet, as numbers.
 *
 * This file drew a live panel once. `▤ LEDGER` folded a copy of this sheet
 * into the transport row, moving as the wave was played, next to `▣ SHEET` —
 * the button that ends the run and shows the real after-run screen the phone
 * draws. The owner looked at both, an hour after LEDGER landed, and asked for
 * one: LEDGER read the same numbers SHEET already shows, one live and one
 * after the run, and a second button to hide a thing that says what the
 * button beside it already says was one control too many.
 *
 * So the panel is gone, and so is everything that only existed to mount it —
 * `bindBalance`, `BalancePanel`, the `#ledgerToggle` on-state wiring, and the
 * DOM-building helpers that turned a `BalanceSheet` into rows. What is left
 * is the pure half: `sheetLines` and `sheetMemories` turn a `BalanceSheet`
 * into the labels and numbers a screen would show, without needing a screen
 * to do it on. That is still a real job — `test/balance.test.ts` (not owned
 * here) drives both directly, pinning the one case that is easy to get
 * wrong: a wave that has just started has asked nothing of the pair yet, and
 * a row that showed 0/0 as 0% would read as a failure nobody committed.
 * Nothing in this file talks to `document` any more.
 */

interface Line {
  label: string;
  /** How many of how many. */
  count: string;
  /** 0..100, or null when the run has not asked this of the pair yet. */
  pct: number | null;
}

/**
 * The rows of the sheet, in the order the drawn screen puts them. Kept apart
 * from the DOM so the arithmetic on the way to the label can be tested — see
 * `test/balance.test.ts`.
 */
export function sheetLines(sheet: BalanceSheet): Line[] {
  return [
    { label: "WARDS", count: count(sheet.wards.good, sheet.wards.of), pct: share(sheet.wards) },
    { label: "TIMING", count: count(sheet.timing.good, sheet.timing.of), pct: share(sheet.timing) },
    { label: "COLOUR", count: count(sheet.color.good, sheet.color.of), pct: share(sheet.color) },
    { label: "PODS", count: count(sheet.pods.good, sheet.pods.of), pct: share(sheet.pods) },
  ];
}

/** The memories: things that happened, never rounded into a share. */
export function sheetMemories(sheet: BalanceSheet): [string, string][] {
  return [
    ["longest clean run", `${sheet.bestStreak}`],
    ["pods shot loose", `${sheet.podsFreed}`],
    ["waves cleared", `${sheet.wavesCleared}`],
    ["score", `${sheet.score}`],
  ];
}

function count(good: number, of: number): string {
  return of === 0 ? "—" : `${good}/${of}`;
}
