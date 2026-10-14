import { rampOf, STEPS, type Step } from "./compose-steps.js";

/**
 * **The pressures a block's steps land on, chosen together.**
 *
 * Chosen one step at a time, a block painted itself into a corner: SALVAGE's
 * R3 had no switch in it and sat at 3.6, and every R4 — the first with the
 * torch beside the pod — drew 5.5 or more, past the two a step may rise
 * (decision 6). So the whole ramp is chosen at once, over the pressures each
 * step's draws can reach: the path that keeps every step inside its ramp and
 * closest to an even rise. A shortest path over a few dozen values a step;
 * nothing to tune.
 */

/** How much a rising step aims to add over the one before it, and a dip to
 * take away. Inside `RISE` and `DIP`, and nearer their small ends. */
const RISE_AIM = 1;
const DIP_AIM = 1.5;

/** Where a step stands in the table, by id: a grown step is a copy. */
const at = (step: Step): number => STEPS.findIndex((s) => s.id === step.id);

function ideal(step: Step, before: number, back: number): number {
  return step.ramp === "dip" ? before - DIP_AIM : before + RISE_AIM * back;
}

/**
 * One pressure per step, out of the values each can reach (`reach[i]` for
 * `steps[i]`), or the index of the first step no path reaches. `start` is
 * where the first step aims; `after` is the block's next written wave, which
 * the last may not pass.
 */
export function chooseRamp(
  steps: readonly Step[],
  reach: readonly (readonly number[])[],
  start: number,
  after?: number,
): number[] | number {
  type Cell = { cost: number; from: number };
  const table: Map<number, Cell>[] = [];
  for (const [i, step] of steps.entries()) {
    const here = new Map<number, Cell>();
    const last = i === steps.length - 1 ? after : undefined;
    for (const v of reach[i] ?? []) {
      if (i === 0) {
        const [lo, hi] = rampOf(step, undefined, last);
        if (v >= lo && v <= hi) here.set(v, { cost: Math.abs(v - start), from: Number.NaN });
        continue;
      }
      const prev = steps[i - 1];
      const back = prev ? at(step) - at(prev) : 1;
      for (const [u, cell] of table[i - 1] ?? []) {
        const [lo, hi] = rampOf(step, u, last, back);
        if (v < lo || v > hi) continue;
        const cost = cell.cost + Math.abs(v - ideal(step, u, back));
        if (cost < (here.get(v)?.cost ?? Number.POSITIVE_INFINITY)) here.set(v, { cost, from: u });
      }
    }
    if (here.size === 0) return i;
    table.push(here);
  }
  const end = [...(table[table.length - 1] ?? [])].sort((a, b) => a[1].cost - b[1].cost)[0];
  if (!end) return 0;
  const out = [end[0]];
  for (let i = table.length - 1; i > 0; i--) {
    out.unshift(table[i]?.get(out[0] ?? 0)?.from ?? 0);
  }
  return out;
}
