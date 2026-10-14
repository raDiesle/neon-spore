import { midCol } from "./config.js";
import type { Color } from "./types.js";
import type { World } from "./world.js";

/**
 * THE HYDRA: a slime with many heads on long necks, hung over the field, and
 * every head coming for the ship. The owner's ask of 14 October 2026: *another
 * boss like THE CHRYSALIS and THE INSTAR … interesting to play and varied in
 * its on-screen mechanics, with good graphics.* A choreographed scene, the
 * third kind in `.claude/skills/new-boss`.
 *
 * **The rule is one sentence**: stop each head before it reaches the ship.
 *
 * **Four kinds of head, each its own gesture**, so no two levels ask the same
 * thing of a thumb:
 * - `bite`: a head swinging down at the hull on each side, jaws open. Each
 *   seat **cuts** the neck on its own half with a swipe across it — the
 *   pilot's on the left, the navigator's on the right — the way its arrow
 *   points.
 * - `coil`: a neck wound round the hull on each side, squeezing. Each seat
 *   **turns** its own coil off, laps round the way it unwinds — THE MAZE's
 *   lever on a living rope (`rim-turn.ts`).
 * - `eye`: a head of eyes over each half, one eye opening at a time and
 *   blinking shut again. Each seat **taps** its own eye while it is open.
 *   A tap gets no SLOW (the owner, 6 October 2026, on THE GOVERNOR).
 * - `maw`: the last heads, in the middle, one opening its maw at a time with
 *   fire in it. **Crossed**: only the navigator sees which maw is open, and
 *   only the pilot sees the fire's colour — the render's split — so the pilot
 *   moves the cannon where the navigator says and the navigator fires the
 *   colour the pilot says.
 *
 * **What the pair has done is kept**, piece by piece: a cut swiped short
 * leaves only that neck where it was, a coil keeps its laps when the thumb
 * lifts, and an eye that blinks shut opens again. **A level whose time runs
 * out is the threat carried out** — the heads still on strike the hull
 * (`bossStrikesHull`), the owner's rule of 25 September 2026 on THE INSTAR:
 * *a missed window is drawn as the threat carried out*.
 *
 * **Each level comes twice running**, a course and a harder course, THE
 * CHRYSALIS's length; between two the body rears back and grows the next
 * heads (`rear`).
 *
 * **Its health is its heads**, and no bar: every head stopped withers to a
 * stump on the outline, and every level gone leaves fewer necks.
 */

/** Where the scene is: arriving, heads coming, rearing back between levels, struck, beaten. */
export const HYDRA_PHASES = ["enter", "heads", "rear", "struck", "spent"] as const;
export type HydraPhase = (typeof HYDRA_PHASES)[number];

/** The kinds of head, in the order the shipped wave meets them. */
export const HYDRA_HEADS = ["bite", "coil", "eye", "maw"] as const;
export type HydraHead = (typeof HYDRA_HEADS)[number];

/** Columns either side of the middle the body covers, for what a bolt meets. */
export const HYDRA_SPAN = 2;

/** One level of the script, authored on the wave. */
export interface HydraStep {
  head: HydraHead;
  /** Beats the level may take before the heads strike. */
  beats: number;
  /** A `bite` or `eye` level's heads or eyes on each side. */
  count?: number;
  /** A `bite` level's swipe way for each of the pilot's necks, top to bottom: -1 left, 1 right; the navigator's is the mirror. Outward where none is named. */
  ways?: (1 | -1)[];
  /** A `coil` level's laps each coil needs. */
  laps?: number;
  /** A `maw` level's maws, in the order they open: columns from the middle. */
  offsets?: number[];
  /** A `maw` level's fire colour at each maw, beside `offsets`. */
  colors?: Color[];
}

/** What a wave authors: the whole script, in order. */
export interface HydraEntry {
  kind: "hydra";
  steps: readonly HydraStep[];
}

export interface HydraState {
  kind: "hydra";
  /** Copied at install and never written again. */
  steps: HydraStep[];
  phase: HydraPhase;
  /** `world.beat` the phase began. */
  phaseBeat: number;
  /** The level lit, or the next to light. */
  cursor: number;
  /** The lit level's heads stopped, one bit each, in the level's own order. */
  goneMask: number;
  /** Heads stopped in every level so far. */
  pieces: number;
  /** Whether each seat's thumb is down on its own head: the pilot's, then the navigator's. */
  down: [boolean, boolean];
  /** How far each seat's cut has gone across its neck, thousandths of a tile along its way. */
  cutMilli: [number, number];
  /** Whether each seat's thumb is done until it lifts: its neck cut under it. */
  spent: [boolean, boolean];
  /** Whether each seat's thumb is on its coil's lever. */
  turning: [boolean, boolean];
  /** Where each seat's thumb last was round its coil, thousandths of a tile of rim. */
  turnAtMilli: [number, number];
  /** How far each coil has been unwound, thousandths of a tile of rim, kept when a thumb lifts. */
  unwoundMilli: [number, number];
  /** Whether each side's eye is open now. */
  lidOpen: [boolean, boolean];
  /** `world.beat` each side's eye next opens or blinks shut. */
  blinkBeat: [number, number];
}

export function hydraBoss(world: World): HydraState | null {
  const boss = world.boss;
  return boss !== null && boss.kind === "hydra" ? boss : null;
}

/** The level lit, or null between levels. */
export function hydraLitStep(s: HydraState): HydraStep | null {
  return s.phase === "heads" ? (s.steps[s.cursor] ?? null) : null;
}

/** The level being fought or next to come. */
export function hydraHeadOn(s: HydraState): HydraHead | null {
  return s.steps[s.cursor]?.head ?? null;
}

/** A `bite` or `eye` level's heads or eyes on one side. */
export function hydraPerSide(step: HydraStep): number {
  return Math.max(1, step.count ?? 1);
}

/** How many heads a level is made of: a neck or an eye per side per count, a coil a side, a maw per offset. */
export function hydraPieceCount(step: HydraStep): number {
  if (step.head === "coil") return 2;
  if (step.head === "maw") return step.offsets?.length ?? 0;
  return hydraPerSide(step) * 2;
}

/** Whether piece `i` of the lit level is stopped. */
export function hydraGone(s: HydraState, i: number): boolean {
  return (s.goneMask & (1 << i)) !== 0;
}

/** The lit level's heads still coming. */
export function hydraLeft(s: HydraState): number {
  const step = s.steps[s.cursor];
  if (step === undefined) return 0;
  let left = 0;
  for (let i = 0; i < hydraPieceCount(step); i++) if (!hydraGone(s, i)) left += 1;
  return left;
}

/**
 * The head `seat` works on now in a `bite`, `coil` or `eye` level — its index
 * in the level — or -1 with its side done. A side's heads are its own half
 * of the level: the pilot's first, then the navigator's.
 */
export function hydraHeadOf(s: HydraState, seat: 0 | 1): number {
  const step = s.steps[s.cursor];
  if (step === undefined || step.head === "maw") return -1;
  const n = step.head === "coil" ? 1 : hydraPerSide(step);
  for (let k = 0; k < n; k++) {
    const i = seat * n + k;
    if (!hydraGone(s, i)) return i;
  }
  return -1;
}

/** Which of its side's heads piece `i` is, top to bottom. */
export function hydraRank(step: HydraStep, i: number): number {
  return step.head === "coil" ? 0 : i % hydraPerSide(step);
}

/** The way a `bite` neck is cut across: -1 left, 1 right — the pilot's as authored, the navigator's mirrored. */
export function hydraWayOf(step: HydraStep, i: number): 1 | -1 {
  const seat = i < hydraPerSide(step) ? 0 : 1;
  const pilots = step.ways?.[hydraRank(step, i)] ?? -1;
  return seat === 0 ? pilots : pilots === 1 ? -1 : 1;
}

/** The way a seat's coil unwinds: the pilot's anticlockwise (-1), the navigator's clockwise (1). */
export function hydraUnwindWay(seat: 0 | 1): 1 | -1 {
  return seat === 0 ? -1 : 1;
}

/** The laps a coil of the lit level needs. */
export function hydraLapsOf(s: HydraState): number {
  return Math.max(1, s.steps[s.cursor]?.laps ?? 1);
}

/** The next maw in a `maw` level's order: the first still open, or -1. */
export function hydraNext(s: HydraState): number {
  const step = hydraLitStep(s);
  if (step === null || step.head !== "maw") return -1;
  for (let i = 0; i < hydraPieceCount(step); i++) if (!hydraGone(s, i)) return i;
  return -1;
}

/** The column maw `i` of the lit level opens over. */
export function hydraMawCol(world: World, s: HydraState, i: number): number {
  return midCol(world.cfg) + (s.steps[s.cursor]?.offsets?.[i] ?? 0);
}

/** The column a side's heads come down over, for the strike and the sound: three out from the middle. */
export function hydraSideCol(world: World, seat: 0 | 1): number {
  return midCol(world.cfg) + (seat === 0 ? -3 : 3);
}

/** Whether a seat's eye is open to a tap right now. */
export function hydraEyeOpen(s: HydraState, seat: 0 | 1): boolean {
  return hydraLitStep(s)?.head === "eye" && s.lidOpen[seat] && hydraHeadOf(s, seat) >= 0;
}

/** Heads in the whole script: the hydra's health. */
export function hydraPiecesAll(s: HydraState): number {
  return s.steps.reduce((sum, step) => sum + hydraPieceCount(step), 0);
}

/** The hydra is beaten: the fight is over. */
export function hydraDone(s: HydraState): boolean {
  return s.phase === "spent";
}

/** A fresh hydra: every head to come, no thumb on it, every eye shut. */
export function freshHydra(beat: number, steps: readonly HydraStep[]): HydraState {
  return {
    kind: "hydra",
    steps: steps.map((step) => ({
      ...step,
      ...(step.ways === undefined ? {} : { ways: [...step.ways] }),
      ...(step.offsets === undefined ? {} : { offsets: [...step.offsets] }),
      ...(step.colors === undefined ? {} : { colors: [...step.colors] }),
    })),
    phase: "enter",
    phaseBeat: beat,
    cursor: 0,
    goneMask: 0,
    pieces: 0,
    down: [false, false],
    cutMilli: [0, 0],
    spent: [false, false],
    turning: [false, false],
    turnAtMilli: [0, 0],
    unwoundMilli: [0, 0],
    lidOpen: [false, false],
    blinkBeat: [-1, -1],
  };
}
