import type { Color } from "./types.js";
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
 *   tooth, `teeth` times; the light jumps two places round the ring after
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
 * **Its health is the teeth.** A `pull` or an `apart` leaves the lit tooth in
 * the tile it let go of; a `teeth` stay knocks out as many as it asks. The
 * gullet shrinks a step per hit.
 */

/** Teeth on the ring. */
export const LAMPREY_TEETH = 7;
/** How far round the ring the lit tooth jumps after a crack: never the one beside it. */
export const LAMPREY_JUMP = 2;

/**
 * Where the scene is: swimming in, bitten into a tile, leaping to the next,
 * reared on a tile with the gullet lit, recoiling from a hit, and limp,
 * falling away, spent.
 */
export const LAMPREY_PHASES = ["entering", "bite", "leap", "rearing", "recoil", "spent"] as const;
export type LampreyPhase = (typeof LAMPREY_PHASES)[number];

/** What a stay asks: the teeth tapped, the head pulled, the two pulled apart, or the gullet shot. */
export const LAMPREY_ASKS = ["teeth", "pull", "apart", "gullet"] as const;
export type LampreyAsk = (typeof LAMPREY_ASKS)[number];

/** One stay of the script, authored on the wave. */
export interface LampreyStep {
  ask: LampreyAsk;
  /** The seat on the tail; the other works the head. A gullet reads nothing here. */
  holder: 1 | 2;
  /** Teeth a `teeth` stay asks to have knocked out. Nothing else reads it. */
  teeth: number;
  /** How far the leap onto this stay's tile goes, in tiles: authored rising. */
  jump: number;
  /** Beats the stay waits, under THE SLOW, before the bite goes through. */
  beats: number;
  /** The colour a gullet must be shot, or `"either"`. Only a gullet reads it. */
  color: Color | "either";
}

/** What a wave authors: the whole script, in order. */
export interface LampreyEntry {
  kind: "lamprey";
  steps: readonly LampreyStep[];
}

export interface LampreyState {
  kind: "lamprey";
  /** Copied at install and never written again. */
  steps: LampreyStep[];
  phase: LampreyPhase;
  /** `world.beat` the phase began. */
  phaseBeat: number;
  /** The stay on, or the next to land. */
  cursor: number;
  /** The tile the eel is on, or is leaping to. */
  col: number;
  row: number;
  /** The tile it leapt from: where a leap is drawn starting. */
  fromCol: number;
  fromRow: number;
  /** The tile the next stay lands on, drawn as this one landed, or -1 with none to come. */
  nextCol: number;
  nextRow: number;
  /** The teeth knocked out for good, a mask of `LAMPREY_TEETH` bits. */
  teethOut: number;
  /** The tooth lit: the one a tap must find, and the one a pull leaves behind. */
  litTooth: number;
  /** The teeth cracked in this stay, in order; a snap puts the last one back. */
  pulled: number[];
  /** Shots the gullet has taken. */
  hits: number;
  /** Every tile bitten so far, `row * cols + col`, in order: what the picture scars. */
  bitten: number[];
  /** Whether each seat's thumb is down on the tail. */
  tailDown: [boolean, boolean];
  /** How far each seat has pulled the tail away from the head, thousandths of a tile. */
  tailMilli: [number, number];
  /** How far each seat has pulled the head up, thousandths of a tile. */
  headMilli: [number, number];
  /** Whether each seat's thumb is down on the teeth, so a tap is an edge. */
  tapDown: [boolean, boolean];
  /** Whether each seat's slip has been said for the press it is on, so it is said once. */
  slipped: [boolean, boolean];
}

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

/** Whether the gullet is lit to be shot. */
export function lampreyFiring(s: LampreyState): boolean {
  return s.phase === "rearing";
}

/** Limp and falling away: the fight is over. */
export function lampreyDone(s: LampreyState): boolean {
  return s.phase === "spent";
}

/** A fresh lamprey: swimming in to its first tile, every tooth in, no thumb down. */
export function freshLamprey(
  beat: number,
  at: { col: number; row: number },
  from: { col: number; row: number },
  steps: readonly LampreyStep[],
): LampreyState {
  return {
    kind: "lamprey",
    steps: steps.map((step) => ({ ...step })),
    phase: "entering",
    phaseBeat: beat,
    cursor: 0,
    col: at.col,
    row: at.row,
    fromCol: from.col,
    fromRow: from.row,
    nextCol: -1,
    nextRow: -1,
    teethOut: 0,
    litTooth: 0,
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
