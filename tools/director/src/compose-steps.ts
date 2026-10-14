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
    ramp: "rise",
  },
  {
    id: "R8",
    name: "Peak",
    cols: [0, 10],
    gaps: [4, 4],
    span: [40, 48],
    arrivals: [9, 12],
    mix: "xyz",
    ramp: "rise",
  },
];

/** The tutorial arc's short block (decision 8): three steps, not eight. */
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

/** Where the gentlest step aims among its draws: low, but not the flattest
 * one there is — a wave of nothing but even eight-beat gaps. */
export const GENTLEST_QUANTILE = 0.25;

/** Decision 2: two arrivals that need different jobs are one spoken exchange
 * apart — four beats in the first twenty blocks, three after. */
export function gapRule(block: number): number {
  return block < 20 ? 4 : 3;
}

/** From R4 on, at least half of the arrivals are slicks and bulbs (§4). */
export function needsBasics(step: Step): boolean {
  return step.id >= "R4";
}

/**
 * Which steps a block still needs composed: the tutorial's three or all
 * eight, less the ones the block's existing regular waves already stand for.
 * Those count from the **end** — an old regular wave is the harder kind, so
 * the composed ones are the easy first steps that lead up to it.
 */
export function stepsToCompose(tutorial: boolean, existing: number): Step[] {
  const ids = tutorial ? TUTORIAL_STEPS : STEPS.map((s) => s.id);
  return ids.slice(0, Math.max(0, ids.length - existing)).map(stepById);
}
