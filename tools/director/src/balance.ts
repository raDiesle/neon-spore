import { type BalanceSheet, share, type World } from "@neon-spore/sim";

/**
 * The balance sheet, as numbers.
 *
 * `▤ LEDGER` used to fold a live copy of this sheet into the transport row,
 * moving as the wave was played, next to `▣ SHEET` — the button that ends the
 * run and shows the real after-run screen the phone draws. The owner looked
 * at both and asked for one: LEDGER read the same numbers SHEET already
 * shows, one live and one after the run, and a second button to hide a thing
 * that says what the button beside it already says was one control too many.
 * `bindBalance` no longer mounts a panel; `sheetLines` and `sheetMemories`
 * stay because the arithmetic on the way to a label is still worth testing
 * on its own, in `test/balance.test.ts`.
 */

export interface BalancePanel {
  /** No-op: kept so `main.ts` can still hold and call one. */
  render(): void;
}

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

/**
 * `main.ts` (not owned here) still holds one of these and calls `render()`
 * every frame — that costs nothing, since there is no longer a panel to
 * repaint. `World` stays imported only for this signature.
 */
export function bindBalance(_world: () => World): BalancePanel {
  return { render() {} };
}
