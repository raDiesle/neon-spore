/**
 * **The steps of a block**, as data — `docs/spec/wave-curriculum.md` §3, §4
 * and §6 in the one form the composer reads. The page is the argument; this is
 * the table, and a change to one is a change to the other.
 *
 * A block is the wave that introduces a thing and the regular waves after it
 * that use it. Each step changes **one lever** over the one before it —
 * where, when, with what, or how — so the steps stay small.
 */

/** Which kinds a step mixes. X is the block's new thing, Y the block before
 * it, Z one from three or more blocks back, B the oldest basics. */
export type StepMix = "x" | "xy" | "xb" | "xz" | "xyLever" | "xyz";

export interface Step {
  id: "R1" | "R2" | "R3" | "R4" | "R5" | "R6" | "R7" | "R8";
  /** The step's job, one word; the composed wave's id ends in it. */
  name: string;
  /** Columns arrivals may land on, on the eleven-column field. */
  cols: readonly [number, number];
  /** Beats from the end of one arrival to the start of the next. */
  gaps: readonly [number, number];
  /** Beats from the first arrival to the last (§3, decision 1). */
  span: readonly [number, number];
  /** How many arrivals, pods counted. */
  arrivals: readonly [number, number];
  mix: StepMix;
  /** Whether the next arrival lands far from the last: R3 is *Reach*. */
  jump?: true;
  /** Of every three arrivals, how many land with a twin across the field —
   * R7's lever, and later blocks' (`compose-grow.ts`). */
  twins?: number;
  /** How its pressure stands to the wave before it in the block (§5):
   * the gentlest draw, a small rise, or the dip. */
  ramp: "gentlest" | "rise" | "dip";
}

export const STEPS: readonly Step[] = [
  {
    id: "R1",
    name: "Again",
    cols: [4, 6],
    gaps: [6, 8],
    span: [24, 32],
    arrivals: [4, 6],
    mix: "x",
    ramp: "gentlest",
  },
  {
    id: "R2",
    name: "Spread",
    cols: [2, 8],
    gaps: [5, 7],
    span: [24, 32],
    arrivals: [4, 6],
    mix: "x",
    ramp: "rise",
  },
  {
    id: "R3",
    name: "Reach",
    cols: [0, 10],
    gaps: [5, 6],
    span: [24, 32],
    arrivals: [4, 6],
    mix: "x",
    jump: true,
    ramp: "rise",
  },
  {
    id: "R4",
    name: "Pair",
    cols: [0, 10],
    gaps: [4, 6],
    span: [32, 40],
    arrivals: [6, 8],
    mix: "xy",
    ramp: "rise",
  },
  {
    id: "R5",
    name: "Breathe",
    cols: [2, 8],
    gaps: [6, 8],
    span: [32, 40],
    arrivals: [5, 8],
    mix: "xb",
    ramp: "dip",
  },
  {
    id: "R6",
    name: "Recall",
    cols: [0, 10],
    gaps: [5, 6],
    span: [32, 40],
    arrivals: [6, 8],
    mix: "xz",
    ramp: "rise",
  },
  {
    id: "R7",
    name: "Bend",
    cols: [0, 10],
    gaps: [5, 6],
    span: [40, 48],
    arrivals: [8, 12],
    mix: "xyLever",
    twins: 1,
    ramp: "rise",
  },
  {
    id: "R8",
    name: "Peak",
    cols: [0, 10],
    gaps: [4, 4],
    span: [40, 48],
    // R7's twin as well as the tightest gaps: without it R8 tops out at
    // about 10, under the 9.5 R7's twin starts at, and the peak cannot rise.
    arrivals: [10, 17],
    mix: "xyz",
    twins: 1,
    ramp: "rise",
  },
];

/** The steps a block after the arc is composed in: five of the eight (the
 * owner, 17 October 2026: *8 waves are too much when something new is
 * introduced … too boring to variation, change it to 5*). Spread is gone
 * because Reach goes as wide, Breathe because the rest now comes inside a
 * wave, and Bend because Peak already carries a twin. The table keeps all
 * eight: their names are how a composed wave from before is still known
 * (`isComposed`). */
export const BLOCK_STEPS: readonly Step["id"][] = ["R1", "R3", "R4", "R6", "R8"];

/** The tutorial arc's short block (decision 8): three steps. */
export const TUTORIAL_STEPS: readonly Step["id"][] = ["R1", "R3", "R4"];

/** The waves up to and including FINALE are the tutorial arc. */
export const TUTORIAL_LAST_ID = "finale";

export function stepById(id: Step["id"]): Step {
  const step = STEPS.find((s) => s.id === id);
  if (!step) throw new Error(`no step ${id}`);
  return step;
}

/** How much a step may rise over the wave before it (decision 6), and how
 * far R5 drops below R4. */
export const RISE: readonly [number, number] = [0.3, 2];
export const DIP: readonly [number, number] = [0.5, 3];

/** The hardest a regular wave may be — FINALE today. */
export const PRESSURE_CEILING = 21;

/** The pressures a step may land on, given the wave before it in the block
 * (`undefined` for the first one composed), how many steps back that one
 * stands — two from R1 to R3 in the tutorial's short block, which skips R2 —
 * and the wave after it, if the block already has one. */
export function rampOf(
  step: Step,
  before: number | undefined,
  after: number | undefined,
  back = 1,
): readonly [number, number] {
  const top = Math.min(PRESSURE_CEILING, after ?? PRESSURE_CEILING);
  if (before === undefined || step.ramp === "gentlest") return [0, top];
  if (step.ramp === "dip") return [before - DIP[1], Math.min(top, before - DIP[0])];
  return [before + RISE[0], Math.min(top, before + RISE[1] * back)];
}

/** How far a block's gentlest wave aims above the gentlest of the block
 * before it — the owner, 14 October 2026: each tooth starts a little higher
 * than the last. A tenth a block puts block 110, about the thousandth wave,
 * eleven above the first, still under `PRESSURE_CEILING` once R8 has risen. */
export const START_RISE = 0.1;

/** Where the gentlest step aims among its draws: low, but not the flattest
 * one there is — a wave of nothing but even eight-beat gaps. */
export const GENTLEST_QUANTILE = 0.25;

/** Decision 2: two arrivals that need different jobs are one spoken exchange
 * apart — four beats in the first twenty blocks, three after. */
export function gapRule(block: number): number {
  return block < 20 ? 4 : 3;
}

/** How many fast slides a step's wave may hold (`wave-pace.ts`): none in a
 * block's first step or anywhere in the tutorial, one elsewhere — the owner,
 * 17 October 2026: *better rare, like a special difficulty situation*. */
export function fastSlidesAllowed(step: Step, tutorial: boolean): number {
  return tutorial || step.id === "R1" ? 0 : 1;
}

/** From R4 on, at least half of the arrivals are slicks and bulbs (§4). */
export function needsBasics(step: Step): boolean {
  return step.id >= "R4";
}

/**
 * Which steps a block still needs composed: the tutorial's three or the
 * block's five, less the ones the block's existing regular waves already stand for.
 * Those count from the **end** — an old regular wave is the harder kind, so
 * the composed ones are the easy first steps that lead up to it.
 */
export function stepsToCompose(tutorial: boolean, existing: number, leads = false): Step[] {
  const ids = tutorial ? TUTORIAL_STEPS : BLOCK_STEPS;
  // Unless they lead: then the written ones are the first steps (`Block.leads`).
  const left = leads ? ids.slice(existing) : ids.slice(0, Math.max(0, ids.length - existing));
  return left.map(stepById);
}
