import { rampOf, STEPS, type Step } from "./compose-steps.js";
import { talkAim, talkCost } from "./compose-talk.js";

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

/**
 * What a first step below where it aims costs on top of its distance: more
 * than any whole ramp's, so it is taken only when nothing at or above the aim
 * fits. Pressures come in tenths with gaps between them, and a block aiming
 * at 8.8 with 8.7 and 8.9 in reach tied and took 8.7 — so the next block's
 * floor was 8.7 again, and every review block from the thirteenth started
 * there (`docs/queue.md`, 15 October 2026).
 */
const BELOW_AIM = 1000;
/** Half a tenth: a floor and a rise added in floating point land a hair off. */
const TENTH_HALF = 0.05;

/** Where a step stands in the table, by id: a grown step is a copy. */
const at = (step: Step): number => STEPS.findIndex((s) => s.id === step.id);

function ideal(step: Step, before: number, back: number): number {
  return step.ramp === "dip" ? before - DIP_AIM : before + RISE_AIM * back;
}

/** A draw's two scores: what the hands do and what the voices do. */
export interface Point {
  pressure: number;
  talk: number;
}

/** Where the talk of a block's first step aims: the block before's gentlest
 * talk, or the talk of the written wave it follows when the written ones
 * lead. Neither, and talk is not chosen at all. */
export interface TalkStart {
  start?: number;
  before?: number;
}

/**
 * One pressure per step, out of the values each can reach (`reach[i]` for
 * `steps[i]`), or the index of the first step no path reaches. `start` is
 * where the first step aims, and it lands at or above it wherever it can; `after` is the block's next written wave, which
 * the last may not pass; `before` is a written wave the first step follows
 * and rises from, when the written ones lead.
 */
export function chooseRamp(
  steps: readonly Step[],
  reach: readonly (readonly number[])[],
  start: number,
  after?: number,
  before?: number,
): number[] | number {
  const points = reach.map((r) => r.map((pressure) => ({ pressure, talk: 0 })));
  const chosen = choosePoints(steps, points, start, after, before);
  return typeof chosen === "number" ? chosen : chosen.map((p) => p.pressure);
}

const keyOf = (p: Point) => `${p.pressure}|${p.talk}`;

/**
 * One point per step — a pressure and a talk — chosen as `chooseRamp`
 * chooses pressures, with the talk's distance from its aim (`compose-talk.ts`)
 * added to each step's cost. Pressure's bounds are the same; talk has none.
 */
export function choosePoints(
  steps: readonly Step[],
  reach: readonly (readonly Point[])[],
  start: number,
  after?: number,
  before?: number,
  talk: TalkStart = {},
): Point[] | number {
  type Cell = { cost: number; from?: Point; at: Point };
  const table: Map<string, Cell>[] = [];
  const talked = talk.start !== undefined || talk.before !== undefined;
  for (const [i, step] of steps.entries()) {
    const here = new Map<string, Cell>();
    const last = i === steps.length - 1 ? after : undefined;
    for (const v of reach[i] ?? []) {
      if (i === 0) {
        const [lo, hi] = rampOf(step, before, last);
        const aim = before === undefined ? start : ideal(step, before, 1);
        const below = before === undefined && v.pressure + TENTH_HALF < aim ? BELOW_AIM : 0;
        const said =
          talk.before !== undefined
            ? talkCost(step, v.talk, talkAim(step, talk.before))
            : talk.start !== undefined
              ? talkCost(step, v.talk, talk.start)
              : 0;
        if (v.pressure >= lo && v.pressure <= hi)
          here.set(keyOf(v), { cost: Math.abs(v.pressure - aim) + below + said, at: v });
        continue;
      }
      const prev = steps[i - 1];
      const back = prev ? at(step) - at(prev) : 1;
      for (const cell of (table[i - 1] ?? new Map<string, Cell>()).values()) {
        const u = cell.at;
        const [lo, hi] = rampOf(step, u.pressure, last, back);
        if (v.pressure < lo || v.pressure > hi) continue;
        const said = talked ? talkCost(step, v.talk, talkAim(step, u.talk, back)) : 0;
        const cost = cell.cost + Math.abs(v.pressure - ideal(step, u.pressure, back)) + said;
        if (cost < (here.get(keyOf(v))?.cost ?? Number.POSITIVE_INFINITY))
          here.set(keyOf(v), { cost, from: u, at: v });
      }
    }
    if (here.size === 0) return i;
    table.push(here);
  }
  const end = [...(table[table.length - 1]?.values() ?? [])].sort((a, b) => a.cost - b.cost)[0];
  if (!end) return 0;
  const out = [end.at];
  for (let i = table.length - 1; i > 0; i--) {
    const from = table[i]?.get(keyOf(out[0] as Point))?.from;
    if (from) out.unshift(from);
  }
  return out;
}
