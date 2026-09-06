import { AUTHORED_COLS, queueFromWave, WAVES } from "@neon-spore/content";

/**
 * WHAT A WAVE SENDS, in one short string a stale baseline row can be caught by.
 *
 * Its own file, small as it is, because it is the one thing in `tools/perf`
 * that reads the game's content rather than a measurement: `measure.ts` drives
 * a browser, `compare.ts` is arithmetic over numbers, `waves.ts` turns a name
 * into an index. Putting it in either of the last two would have made a cycle.
 */

/**
 * A baseline row already carries the wave's name, which catches a wave renamed
 * or one inserted ahead of it. It cannot catch the thing that happens far more
 * often: a wave whose *arrivals* changed. THE FENCE gained two figures on
 * 6 September 2026 and its row kept the timings that went with the old two,
 * under a name that still matched, so the next run compared today's game
 * against a wave that no longer existed.
 *
 * So a row carries this as well: how many bodies the wave sends, and an FNV-1a
 * of the spawn queue those entries translate into. `queueFromWave` rather than
 * `wave.entries` on purpose — it is the translation the game itself runs, so a
 * change to *that* invalidates a row too, and working out here what an entry
 * becomes would be the second copy of a rule `CLAUDE.md` forbids. It is not a
 * cryptographic claim; only "are these the same arrivals".
 *
 * The columns are the authored seven (`AUTHORED_COLS`) rather than a device's,
 * so the digest says nothing about the screen the run happened to be taken on.
 */
export function arrivalsOf(index: number): string {
  const wave = WAVES[index];
  if (!wave) return "0:0";
  const queue = queueFromWave(wave, AUTHORED_COLS);
  const text = JSON.stringify(queue);
  let h = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return `${queue.length}:${(h >>> 0).toString(16)}`;
}
