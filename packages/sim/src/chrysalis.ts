import { BASTION_PLATES_A_SIDE, type BastionTrack } from "./bastion-track.js";
import { midCol } from "./config.js";
import type { Color } from "./types.js";
import type { World } from "./world.js";

/**
 * THE CHRYSALIS: a living cocoon hanging over the field, an alien grub inside
 * four skins, peeled from the outside in. The owner's ask of 14 October 2026:
 * *a new boss wave similar in concept to THE BASTION … something living,
 * alien-like instead … a similar number of levels, so it does not end too
 * quick.* THE BASTION's idea — a body taken apart a layer at a time, each
 * layer a different action, smaller each time — on a body that is alive.
 *
 * **The rule is one sentence**: peel each skin off the cocoon before it grows
 * back.
 *
 * **Four skins**, outside in, each a different job for each seat:
 * - `slime`: a coat of slime, the left half the pilot's and the right half
 *   the navigator's. Each seat rubs its own half clear — back and forth,
 *   `rubs` turns — and both rub at once.
 * - `quills`: spines, four on the left for the pilot and four on the right
 *   for the navigator, each pulled out along its track until it rips free —
 *   THE BASTION's plate, the one pull along a track (`bastion-track.ts`).
 * - `sacs`: spore sacs, one swelling at a time over a column. The navigator
 *   slides the shield under it, the pilot raises it, and the spores thrown
 *   back burst the sac.
 * - `heart`: the heart under the last skin, beating behind a pore in a
 *   colour. **Only the pilot's screen shows it**: the pilot slides the cannon
 *   under it and says the colour; the navigator fires that colour.
 *
 * **What a skin has done is kept, piece by piece**, THE BASTION's rule: a
 * quill let go short snaps back and only that quill starts over, a half
 * rubbed part-way keeps its turns when the thumb lifts, and spores nobody
 * blocked leave the sac to swell again. **A skin whose time runs out grows
 * back** whole and is tried again; the skins already off stay off. Nothing
 * in this fight strikes the hull.
 *
 * **Each skin may come twice running**, one course under another, the moon's
 * rule (the owner on THE BASTION, 14 October 2026: *more layers of steps …
 * longer plays*); the cocoon is only smaller once it is through both.
 *
 * **Its health is the skins**, and no bar: every piece off is one gone from
 * the outline, and every skin gone leaves the cocoon smaller.
 */

/** Where the scene is: arriving, a skin lit, a skin just shed, a skin growing back, the grub dead. */
export const CHRYSALIS_PHASES = ["enter", "skin", "shed", "regrow", "spent"] as const;
export type ChrysalisPhase = (typeof CHRYSALIS_PHASES)[number];

/** The skins, outside in. */
export const CHRYSALIS_SKINS = ["slime", "quills", "sacs", "heart"] as const;
export type ChrysalisSkin = (typeof CHRYSALIS_SKINS)[number];

/** Columns either side of the middle each skin covers, for what a bolt meets. */
export const CHRYSALIS_SPAN: Record<ChrysalisSkin, number> = {
  slime: 3,
  quills: 3,
  sacs: 2,
  heart: 2,
};

/** One skin of the script, authored on the wave. */
export interface ChrysalisStep {
  skin: ChrysalisSkin;
  /** Beats the skin may take before it grows back. */
  beats: number;
  /** A `slime` coat's turns of the rub each half needs. */
  rubs?: number;
  /** A `quills` skin's tracks, one for each quill of a side, top to bottom; straight where none is named. */
  tracks?: BastionTrack[];
  /** A `sacs` skin's sacs or a `heart`'s beats, in the order they come: columns from the middle. */
  offsets?: number[];
  /** A `heart`'s colour at each beat, beside `offsets`. */
  colors?: Color[];
}

/** What a wave authors: the whole script, in order. */
export interface ChrysalisEntry {
  kind: "chrysalis";
  steps: readonly ChrysalisStep[];
}

export interface ChrysalisState {
  kind: "chrysalis";
  /** Copied at install and never written again. */
  steps: ChrysalisStep[];
  phase: ChrysalisPhase;
  /** `world.beat` the phase began. */
  phaseBeat: number;
  /** The skin lit, or the next to light. */
  cursor: number;
  /** The lit skin's pieces taken off, one bit each, in the skin's own order. */
  goneMask: number;
  /** Pieces taken off in every skin so far. */
  pieces: number;
  /** Whether each seat's thumb is on its half: the pilot's, then the navigator's. */
  down: [boolean, boolean];
  /** How far each seat's quill is pulled out, thousandths of a tile along its track. */
  pullMilli: [number, number];
  /** Whether each seat's thumb is done until it lifts: its quill ripped or slipped under it. */
  tore: [boolean, boolean];
  /** The rub's count each seat last sent, or -1 with no thumb rubbing. */
  rubAt: [number, number];
  /** Turns of the rub each half of the slime has taken, kept when a thumb lifts. */
  rubbed: [number, number];
  /** `world.beat` the swelling sac sprays, or -1 with none swelling. */
  sprayBeat: number;
  /** `world.tick` the swelling sac began to swell: a shield raised before it blocks nothing. */
  swellTick: number;
  /** `world.beat` the next sac begins to swell, or -1 with one swelling or none to come. */
  nextSwellBeat: number;
}

export function chrysalisBoss(world: World): ChrysalisState | null {
  const boss = world.boss;
  return boss !== null && boss.kind === "chrysalis" ? boss : null;
}

/** The skin lit, or null between skins. */
export function chrysalisLitStep(s: ChrysalisState): ChrysalisStep | null {
  return s.phase === "skin" ? (s.steps[s.cursor] ?? null) : null;
}

/** The skin outermost still on the cocoon: the lit one, or the next to light. */
export function chrysalisSkinOn(s: ChrysalisState): ChrysalisSkin | null {
  return s.steps[s.cursor]?.skin ?? null;
}

/** How many pieces a skin is made of: two halves of slime, eight quills, a sac or a beat per offset. */
export function chrysalisPieceCount(step: ChrysalisStep): number {
  if (step.skin === "slime") return 2;
  if (step.skin === "quills") return BASTION_PLATES_A_SIDE * 2;
  return step.offsets?.length ?? 0;
}

/** Whether piece `i` of the lit skin is off. */
export function chrysalisGone(s: ChrysalisState, i: number): boolean {
  return (s.goneMask & (1 << i)) !== 0;
}

/** The lit skin's pieces still on. */
export function chrysalisLeft(s: ChrysalisState): number {
  const step = s.steps[s.cursor];
  if (step === undefined) return 0;
  let left = 0;
  for (let i = 0; i < chrysalisPieceCount(step); i++) if (!chrysalisGone(s, i)) left += 1;
  return left;
}

/** The quill `seat` works on now, its index in the skin, or -1 with its side done. */
export function chrysalisQuillOf(s: ChrysalisState, seat: 0 | 1): number {
  for (let k = 0; k < BASTION_PLATES_A_SIDE; k++) {
    const i = seat * BASTION_PLATES_A_SIDE + k;
    if (!chrysalisGone(s, i)) return i;
  }
  return -1;
}

/** The track quill `i` of the skin at the cursor is pulled along: its side's slot, straight if the step names none. */
export function chrysalisTrackOf(s: ChrysalisState, i: number): BastionTrack {
  return s.steps[s.cursor]?.tracks?.[i % BASTION_PLATES_A_SIDE] ?? "straight";
}

/** The turns of the rub a half of the lit slime needs. */
export function chrysalisRubsOf(s: ChrysalisState): number {
  return Math.max(1, s.steps[s.cursor]?.rubs ?? 1);
}

/** The next piece in a `sacs` or `heart` skin's order: the first still on, or -1. */
export function chrysalisNext(s: ChrysalisState): number {
  const step = chrysalisLitStep(s);
  if (step === null) return -1;
  for (let i = 0; i < chrysalisPieceCount(step); i++) if (!chrysalisGone(s, i)) return i;
  return -1;
}

/** The column piece `i` of the lit skin stands over: a sac's or the heart's. */
export function chrysalisPieceCol(world: World, s: ChrysalisState, i: number): number {
  return midCol(world.cfg) + (s.steps[s.cursor]?.offsets?.[i] ?? 0);
}

/** Whether a sac is swelling over its column right now. */
export function chrysalisSwelling(s: ChrysalisState): boolean {
  return chrysalisLitStep(s)?.skin === "sacs" && s.sprayBeat >= 0;
}

/** Pieces in the whole script: the cocoon's health. */
export function chrysalisPiecesAll(s: ChrysalisState): number {
  return s.steps.reduce((sum, step) => sum + chrysalisPieceCount(step), 0);
}

/** The grub is dead: the fight is over. */
export function chrysalisDone(s: ChrysalisState): boolean {
  return s.phase === "spent";
}

/** A fresh cocoon: every skin on, no thumb on it, nothing swelling. */
export function freshChrysalis(beat: number, steps: readonly ChrysalisStep[]): ChrysalisState {
  return {
    kind: "chrysalis",
    steps: steps.map((step) => ({
      ...step,
      ...(step.tracks === undefined ? {} : { tracks: [...step.tracks] }),
      ...(step.offsets === undefined ? {} : { offsets: [...step.offsets] }),
      ...(step.colors === undefined ? {} : { colors: [...step.colors] }),
    })),
    phase: "enter",
    phaseBeat: beat,
    cursor: 0,
    goneMask: 0,
    pieces: 0,
    down: [false, false],
    pullMilli: [0, 0],
    tore: [false, false],
    rubAt: [-1, -1],
    rubbed: [0, 0],
    sprayBeat: -1,
    swellTick: 0,
    nextSwellBeat: -1,
  };
}
