import {
  LAMPREY_JUMP,
  LAMPREY_TEETH,
  type LampreyAsk,
  type LampreyMorsel,
  type LampreyState,
  type LampreyStep,
} from "./lamprey-types.js";
import type { World } from "./world.js";

/**
 * THE LAMPREY: an eel that leaps from tile to tile across the field and bites
 * into each one, and a pair who pull it off before the bite goes through
 * (`docs/spec/bosses-choreographed.md` §41, reworked by the owner on 5
 * October 2026: *the boss should jump across the full screen area in random
 * positions … change controls for every jump*).
 *
 * **The rule is one sentence**: one of you holds the tail, and the other works
 * the head off the tile before the fuse runs out.
 *
 * **Every leap is one tile longer than the one before** — the step's `jump`,
 * authored rising — and lands on a tile the seeded `Rng` picks that far away,
 * never one already bitten. Where it goes next is drawn the beat it lands, so
 * the picture can lay the tail the other way (`nextCol`, `nextRow`).
 *
 * **Every stay asks for something else** (`LampreyAsk`):
 * - `teeth` — the holder's thumb on the tail, the other taps the one lit
 *   tooth `taps` times to crack it, `teeth` teeth; the light jumps two places round the ring after
 *   each, and a tap with the tail loose or on a dark tooth snaps the last
 *   one back in (`lamprey-hand.ts`).
 * - `pull` — the holder's thumb on the tail, the other pulls the head up off
 *   the tile, `lampreyHeadPullMilli`. A head pulled up with the tail loose
 *   slips, and is said.
 * - `apart` — no one holds: the holder pulls the tail away from the head
 *   along the body, `lampreyTailPullMilli`, while the other pulls the head
 *   up, and the two have to be all the way out in the same instant.
 * - `gullet` — the eel rears on its tile, the gullet lit in a colour, and the
 *   cannon shoots up its column (`lamprey-shot.ts`).
 *
 * **Every stay is THE SLOW**, opened as it lands for the step's `beats` and
 * shut the tick it is answered (the owner, the same message: *every staying
 * on a tile should have a slow with time indicator*). A stay whose window
 * runs out bites through, and the hull takes it.
 *
 * **Before the first stay and between levels it is a worm on the field**
 * (the owner, 6 October 2026, `lamprey-roam.ts`): it crawls in and eats the
 * meal that falls for it (`lamprey-meal.ts`), crawls on to its first tile, and before a
 * step that says `crawl` it crawls the field from side to side instead of
 * leaping — eating what falls and dropping dung for the shield.
 *
 * **Its health is the teeth.** A `pull` or an `apart` leaves the lit tooth in
 * the tile it let go of; a `teeth` stay knocks out as many as it asks. The
 * gullet shrinks a step per hit.
 */

export {
  LAMPREY_ASKS,
  LAMPREY_FOODS,
  LAMPREY_JUMP,
  LAMPREY_PHASES,
  LAMPREY_TAIL_END,
  LAMPREY_TEETH,
  LAMPREY_TRAIL,
  type LampreyAsk,
  type LampreyEntry,
  type LampreyFood,
  type LampreyMorsel,
  type LampreyPhase,
  type LampreyState,
  type LampreyStep,
} from "./lamprey-types.js";

export function lampreyBoss(world: World): LampreyState | null {
  const boss = world.boss;
  return boss !== null && boss.kind === "lamprey" ? boss : null;
}

/** The stay on or the next to land, or null with none. */
export function lampreyStep(s: LampreyState): LampreyStep | null {
  return s.steps[s.cursor] ?? null;
}

/** What the stay on asks, or null between stays. */
export function lampreyAsks(s: LampreyState): LampreyAsk | null {
  if (s.phase === "rearing") return "gullet";
  return s.phase === "bite" ? (lampreyStep(s)?.ask ?? null) : null;
}

/** Whether the eel is bitten into a tile and asking for a pair of hands. */
export function lampreyBiting(s: LampreyState): boolean {
  return s.phase === "bite";
}

/** The seat on the tail in the bite that is on, or null. */
export function lampreyHolder(s: LampreyState): 1 | 2 | null {
  return lampreyBiting(s) ? (lampreyStep(s)?.holder ?? null) : null;
}

/** The seat working the head in the bite that is on — the one not on the tail — or null. */
export function lampreyWorker(s: LampreyState): 1 | 2 | null {
  const holder = lampreyHolder(s);
  return holder === null ? null : holder === 1 ? 2 : 1;
}

/** Whether a tooth is still on the ring: neither out for good nor cracked in this stay. */
export function lampreyToothIn(s: LampreyState, tooth: number): boolean {
  return (s.teethOut & (1 << tooth)) === 0 && !s.pulled.includes(tooth);
}

/** Teeth still on the ring. */
export function lampreyTeethIn(s: LampreyState): number {
  let n = 0;
  for (let t = 0; t < LAMPREY_TEETH; t++) if (lampreyToothIn(s, t)) n += 1;
  return n;
}

/**
 * The tooth to light after `from`: the first still in, `LAMPREY_JUMP` places
 * on and then round the ring — so the one beside it comes last of all — or -1
 * with the ring bare.
 */
export function lampreyNextTooth(s: LampreyState, from: number): number {
  for (let k = LAMPREY_JUMP; k < LAMPREY_JUMP + LAMPREY_TEETH; k++) {
    const t = (((from + k) % LAMPREY_TEETH) + LAMPREY_TEETH) % LAMPREY_TEETH;
    if (lampreyToothIn(s, t)) return t;
  }
  return -1;
}

/** Whether the holder's thumb is on the tail this instant. */
export function lampreyTailHeld(s: LampreyState): boolean {
  const holder = lampreyHolder(s);
  return holder !== null && s.tailDown[holder - 1] === true;
}

/** How far the worker has the head pulled up, thousandths, or 0 with no bite on. */
export function lampreyHeadPull(s: LampreyState): number {
  const worker = lampreyWorker(s);
  return worker === null ? 0 : (s.headMilli[worker - 1] ?? 0);
}

/** How far the holder has the tail pulled away, thousandths, or 0 with no bite on. */
export function lampreyTailPull(s: LampreyState): number {
  const holder = lampreyHolder(s);
  return holder === null ? 0 : (s.tailMilli[holder - 1] ?? 0);
}

/** Whether it is a worm on the field: crawling in, eating its meal, or crawling to a tile. */
export function lampreyCrawling(s: LampreyState): boolean {
  return s.phase === "entering" || s.phase === "feeding" || s.phase === "roam";
}

/** Taps a lit tooth wants in the stay on: the step's `taps`, one when it says none. */
export function lampreyTapsWanted(s: LampreyState): number {
  return Math.max(1, lampreyStep(s)?.taps ?? 1);
}

/** Whether the gullet is lit to be shot. */
export function lampreyFiring(s: LampreyState): boolean {
  return s.phase === "rearing";
}

/** Limp and falling away: the fight is over. */
export function lampreyDone(s: LampreyState): boolean {
  return s.phase === "spent";
}

/**
 * A fresh lamprey: its head `at`, outside the field, crawling in toward its
 * meal, the first stay's tile drawn as `first`; every tooth in, no thumb down.
 */
export function freshLamprey(
  beat: number,
  at: { col: number; row: number },
  first: { col: number; row: number },
  steps: readonly LampreyStep[],
  meal: readonly LampreyMorsel[] = [],
): LampreyState {
  return {
    kind: "lamprey",
    steps: steps.map((step) => ({ ...step })),
    meal: meal.map((m) => ({ ...m })),
    phase: "entering",
    phaseBeat: beat,
    cursor: 0,
    col: at.col,
    row: at.row,
    fromCol: at.col,
    fromRow: at.row,
    nextCol: first.col,
    nextRow: first.row,
    tailX: 0,
    tailY: 1000,
    trailCol: [],
    trailRow: [],
    headBeat: beat,
    leg: 0,
    roamSide: 1,
    served: 0,
    prey: -1,
    dung: [],
    teethOut: 0,
    litTooth: 0,
    toothTaps: 0,
    pulled: [],
    hits: 0,
    bitten: [],
    tailDown: [false, false],
    tailMilli: [0, 0],
    headMilli: [0, 0],
    tapDown: [false, false],
    slipped: [false, false],
  };
}
