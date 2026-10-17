import { SKIES } from "../src/skies.js";

/**
 * One measured frame, written as the object literal a budget table holds.
 *
 * Four files in this directory keep an op-count budget — the busy field
 * (`frame-budget.test.ts`), a whole worm (`crawler-budget.test.ts`), the
 * dearest frame of every wave (`wave-budget.test.ts`) and THE FLEET
 * (`fleet-budget.test.ts`) — and every one of them has to be re-measured
 * whenever a look the owner adopts moves what a frame costs. Only the fleet's
 * could be: it carries a `MEASURE` switch. The other three told a reader to
 * "run this file and read the rows off the output" when there was nothing to
 * read — they assert, and they stop at the first row that moved.
 *
 * Doing it by hand meant editing each file to replace its `expect` with a
 * `console.log`, running it, restoring the file from a copy, and mapping the
 * printed rows back onto source lines by position. That is work which is
 * correct once and wrong the second time, and it moved eighty-two numbers in
 * `wave-budget.test.ts` alone after one look change.
 *
 * **The saving is not the switch, it is this function.** The printed shape and
 * the source shape are the same shape, so a row goes back into its table by
 * being pasted rather than by being read off and retyped — which is what made
 * the fleet file's own remeasurement a thirty-second job and the other three an
 * hour.
 *
 * `shape` is the row being replaced, and it decides both which ops are printed
 * and the order they come in. An op outside it is deliberately not printed: a
 * budget is a ceiling on the calls it names, and adding a call to that list is
 * a decision somebody makes on purpose rather than a line that turns up in the
 * output one day.
 *
 * `bun run budgets:measure` does the pasting (`tools/budgets/`): it throws
 * the switch for one run and writes each printed row into the next literal
 * with its key set, raising what rose and never lowering anything.
 *
 * A row is printed on one line whatever its width. Paste it over the row it
 * replaces and let `bun run format` wrap it — the wide tables in
 * `wave-budget.test.ts` are written a field to a line because biome put them
 * there, not because anybody typed them that way.
 */
export function budgetRow(
  tally: ReadonlyMap<string, number>,
  shape: Readonly<Record<string, number>>,
): string {
  const fields = Object.keys(shape).map((key) => `${asWritten(key)}: ${tally.get(key) ?? 0}`);
  return `{ ${fields.join(", ")} },`;
}

/**
 * A key spelled the way a budget table spells it. `new Path2D` is not an
 * identifier and every table quotes it; quoting the rest as well would print
 * something that pastes back looking nothing like its neighbours, which is the
 * one thing this file exists to avoid.
 */
function asWritten(key: string): string {
  return /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(key) ? key : JSON.stringify(key);
}

/**
 * **The sky every budget run is drawn under** (`FramesOptions.sky`). A row
 * measures its subject plus whichever sky the wave fell under, and the sky
 * followed the wave's number, so THE MORSEL's block put in early moved THE
 * GYRE's row by a fill, two clips and a save that were the sky's, not the
 * wheel's (`docs/queue.md`, 16 October 2026). One fixed sky, and renumbering
 * waves moves no row. CELLS, the cheapest of the twelve skies then over a busy field on
 * 16 October 2026 — 774 ops to GIANT's 823 and AURORA's 877 — so a row is
 * as nearly its subject as a frame with a sky can be.
 */
export const BUDGET_SKY = SKIES.findIndex((s) => s.name === "CELLS");
