import { WAVE_COLS, waveCols } from "./queue.js";
import type { Wave, WaveEntry } from "./wave-types.js";

/**
 * **A wave's pressure**: one number that says whether a wave is harder than
 * the one before it, read off its entries alone.
 *
 * The curriculum's score (`docs/spec/wave-curriculum.md` §5), built the way a
 * rhythm game rates a chart: what each arrival costs given the one before it,
 * and the most of that cost inside any eight beats — two spoken exchanges —
 * rather than an average that a quiet stretch would hide. The composer aims
 * each wave of a block at a pressure, and the director prints it on every row
 * of the wave list.
 *
 * A boss wave has none (`undefined`): a boss is the encounter, and what it
 * asks is not in its entries.
 *
 * The weights are guesses, tuned against a pair playing rather than against
 * AUTO, which never talks. A body not in the table is the default until it is
 * tuned.
 */

/** What one arrival of a kind costs before travel and switching, by kind. A
 * slick or a bulb (no `kind`) costs 1. */
export const PRESSURE_WEIGHT: Readonly<Record<string, number>> = {
  meteor: 1,
  meteorMedium: 1.3,
  meteorFast: 1.6,
  meteorFaster: 1.8,
  meteorFastest: 2,
  torch: 1.5,
};

/** The weight of a body the table does not name. */
export const PRESSURE_DEFAULT_WEIGHT = 1.5;

/** The window the cost is summed over, in beats — two spoken exchanges. */
export const PRESSURE_WINDOW_BEATS = 8;

/** What every fault placed on the wave adds. */
export const PRESSURE_PER_FAULT = 2;

/** Which job an arrival asks for: a colour on the cannon, the shield for a
 * rock, or its own kind for everything else. Two arrivals in a row asking for
 * different jobs is a switch, and a switch is a sentence said out loud — and
 * the gap rule the composer holds (`docs/spec/wave-curriculum.md` §3). */
export function arrivalJob(e: Pick<WaveEntry, "kind" | "color">): string {
  if (e.kind === undefined) return `cannon:${e.color}`;
  if (e.kind.startsWith("meteor")) return "shield";
  return e.kind;
}

function weight(e: WaveEntry): number {
  return e.kind === undefined ? 1 : (PRESSURE_WEIGHT[e.kind] ?? PRESSURE_DEFAULT_WEIGHT);
}

/**
 * The pressure of a list of entries authored on `cols` columns, to one
 * decimal. `travel` is measured on the eleven-tile field whatever the wave
 * was authored on, so a seven-column wave is not scored as calmer than it is.
 */
export function entriesPressure(
  entries: readonly WaveEntry[],
  cols: number = WAVE_COLS,
  faults = 0,
): number {
  const sorted = [...entries].sort((a, b) => a.beat - b.beat || a.col - b.col);
  const scale = (WAVE_COLS - 1) / Math.max(1, cols - 1);
  const centre = (cols - 1) / 2;
  const costs: { beat: number; cost: number }[] = [];
  for (const [i, e] of sorted.entries()) {
    const prev = sorted[i - 1];
    const travel = (Math.abs(e.col - (prev?.col ?? centre)) * scale) / 5;
    const change = prev && arrivalJob(prev) !== arrivalJob(e) ? 1 : 0;
    const together = prev && prev.beat === e.beat ? 0.5 : 0;
    costs.push({ beat: e.beat, cost: weight(e) * (1 + travel + change + together) });
  }
  let peak = 0;
  for (const from of costs) {
    let sum = 0;
    for (const c of costs) {
      if (c.beat >= from.beat && c.beat < from.beat + PRESSURE_WINDOW_BEATS) sum += c.cost;
    }
    peak = Math.max(peak, sum);
  }
  return Math.round((peak + PRESSURE_PER_FAULT * faults) * 10) / 10;
}

/** A wave's pressure, or `undefined` for a boss wave. */
export function wavePressure(wave: Wave): number | undefined {
  if (wave.boss) return undefined;
  return entriesPressure(wave.entries, waveCols(wave), wave.faults?.length ?? 0);
}
