import { midCol } from "./config.js";
import type { Color } from "./types.js";
import type { World } from "./world.js";

/**
 * THE BASTION: a metal moon built in shells, hanging over the field, taken
 * apart from the outside in. The owner's brief of 8 October 2026, the one
 * idea kept from THE HALTER: *players have to remove layers of the ball one
 * after another … the more inside they reach, the smaller the ball gets.
 * Removing layers requires different actions.*
 *
 * **The rule is one sentence**: take the shells off one by one, and each
 * shell is opened a different way.
 *
 * **Four shells**, outside in, each a different job for each seat:
 * - `plates`: armour plates, four on the left for the pilot and four on the
 *   right for the navigator, each pulled straight out away from the core
 *   until it tears off. Both seats pull at once.
 * - `ring`: a ring of guns round the moon. The pilot turns the moon by its
 *   rim; the gun turned to the front, over the middle column, is shot in its
 *   colour by the navigator.
 * - `lattice`: a cage of nodes, one charging at a time over a column. The
 *   navigator slides the shield under it, the pilot raises it, and the
 *   lightning thrown back bursts the node.
 * - `port`: the inner hull, and one small port in it to the core. Only the
 *   navigator's screen shows the port; the pilot slides the cannon under it
 *   on the navigator's word, and the navigator fires.
 *
 * **What a shell has done is kept, piece by piece** — the owner's answer of
 * 8 October 2026, taken from THE GRINDSTONE: a plate let go before it tears
 * snaps back and only that plate starts over, and lightning nobody blocked
 * leaves its node to charge again. **A shell whose time runs out grows back**
 * whole and is tried again; the shells already taken stay taken. Nothing in
 * this fight strikes the hull.
 *
 * **Its health is the shells**, and no bar: every piece off is one gone from
 * the outline, and every shell gone leaves the moon smaller.
 */

/** Where the scene is: arriving, a shell lit, a shell just shed, a shell growing back, the core blown. */
export const BASTION_PHASES = ["enter", "layer", "shed", "regrow", "spent"] as const;
export type BastionPhase = (typeof BASTION_PHASES)[number];

/** The shells, outside in. */
export const BASTION_LAYERS = ["plates", "ring", "lattice", "port"] as const;
export type BastionLayer = (typeof BASTION_LAYERS)[number];

/** Plates on each side of the moon: a figure of the silhouette, `OCULUS_LEAVES`' reason. */
export const BASTION_PLATES_A_SIDE = 4;

/**
 * Which way each of a side's plates tears off, top to bottom, in thousandths
 * of a tile along x and y (y down): the left side's, and the right's mirrored.
 * Spread from 35 to 145 degrees off straight up, written out so no device
 * rounds a sine its own way.
 */
export const BASTION_PLATE_WAYS: readonly (readonly [number, number])[] = [
  [-574, -819],
  [-951, -309],
  [-951, 309],
  [-574, 819],
];

/** Columns either side of the middle each shell covers, for what a bolt meets. */
export const BASTION_SPAN: Record<BastionLayer, number> = {
  plates: 3,
  ring: 3,
  lattice: 2,
  port: 2,
};

/** One shell of the script, authored on the wave. */
export interface BastionStep {
  layer: BastionLayer;
  /** Beats the shell may take before it grows back. */
  beats: number;
  /** A `ring`'s guns, round the moon in order, each in the colour that kills it. */
  colors?: Color[];
  /** A `lattice`'s nodes or a `port`'s openings, in the order they come: columns from the middle. */
  offsets?: number[];
}

/** What a wave authors: the whole script, in order. */
export interface BastionEntry {
  kind: "bastion";
  steps: readonly BastionStep[];
}

export interface BastionState {
  kind: "bastion";
  /** Copied at install and never written again. */
  steps: BastionStep[];
  phase: BastionPhase;
  /** `world.beat` the phase began. */
  phaseBeat: number;
  /** The shell lit, or the next to light. */
  cursor: number;
  /** The lit shell's pieces taken off, one bit each, in the shell's own order. */
  goneMask: number;
  /** Pieces taken off in every shell so far. */
  pieces: number;
  /** Whether each seat's thumb is on its plate: the pilot's, then the navigator's. */
  down: [boolean, boolean];
  /** How far each seat's plate is pulled out, thousandths of a tile along its way. */
  pullMilli: [number, number];
  /** Whether each seat's plate tore under the thumb still down: nothing more until it lifts. */
  tore: [boolean, boolean];
  /** How far round the moon is turned, thousandths of a degree, nought to a whole turn. */
  yawMilli: number;
  /** Whether the pilot's thumb is on the rim. */
  spinning: boolean;
  /** Where on the rim the thumb was last read, thousandths of a tile from where it took hold. */
  spinAtMilli: number;
  /** `world.beat` the charging node throws its lightning, or -1 with none charging. */
  dischargeBeat: number;
  /** `world.tick` the charging node began to charge: a shield raised before it blocks nothing. */
  chargeTick: number;
  /** `world.beat` the next node begins to charge, or -1 with one charging or none to come. */
  nextChargeBeat: number;
}

export function bastionBoss(world: World): BastionState | null {
  const boss = world.boss;
  return boss !== null && boss.kind === "bastion" ? boss : null;
}

/** The shell lit, or null between shells. */
export function bastionLitStep(s: BastionState): BastionStep | null {
  return s.phase === "layer" ? (s.steps[s.cursor] ?? null) : null;
}

/** The shell outermost still on the moon: the lit one, or the next to light. */
export function bastionLayerOn(s: BastionState): BastionLayer | null {
  return s.steps[s.cursor]?.layer ?? null;
}

/** How many pieces a shell is made of. */
export function bastionPieceCount(step: BastionStep): number {
  if (step.layer === "plates") return BASTION_PLATES_A_SIDE * 2;
  if (step.layer === "ring") return step.colors?.length ?? 0;
  return step.offsets?.length ?? 0;
}

/** Whether piece `i` of the lit shell is off. */
export function bastionGone(s: BastionState, i: number): boolean {
  return (s.goneMask & (1 << i)) !== 0;
}

/** The lit shell's pieces still on. */
export function bastionLeft(s: BastionState): number {
  const step = s.steps[s.cursor];
  if (step === undefined) return 0;
  let left = 0;
  for (let i = 0; i < bastionPieceCount(step); i++) if (!bastionGone(s, i)) left += 1;
  return left;
}

/** The plate `seat` works on now, its index in the shell, or -1 with its side done. */
export function bastionPlateOf(s: BastionState, seat: 0 | 1): number {
  for (let k = 0; k < BASTION_PLATES_A_SIDE; k++) {
    const i = seat * BASTION_PLATES_A_SIDE + k;
    if (!bastionGone(s, i)) return i;
  }
  return -1;
}

/** Which way plate `i` tears off, thousandths of a tile along x and y. */
export function bastionPlateWay(i: number): readonly [number, number] {
  const way = BASTION_PLATE_WAYS[i % BASTION_PLATES_A_SIDE] ?? [0, -1000];
  return i < BASTION_PLATES_A_SIDE ? way : [-way[0], way[1]];
}

/** Where gun `i` of `count` sits round the ring with the moon turned, thousandths of a degree from the front. */
export function bastionGunAngle(s: BastionState, i: number, count: number): number {
  const turn = 360_000;
  return (((Math.round((i * turn) / count) + s.yawMilli) % turn) + turn) % turn;
}

/** The gun turned to the front, still on and in reach of a shot, or -1. */
export function bastionFrontGun(world: World, s: BastionState): number {
  const step = bastionLitStep(s);
  if (step?.layer !== "ring") return -1;
  const count = bastionPieceCount(step);
  const tol = world.cfg.bastionFrontMilli;
  for (let i = 0; i < count; i++) {
    const a = bastionGunAngle(s, i, count);
    if (!bastionGone(s, i) && (a <= tol || a >= 360_000 - tol)) return i;
  }
  return -1;
}

/** The next piece in a `lattice` or `port` shell's order: the first still on, or -1. */
export function bastionNext(s: BastionState): number {
  const step = bastionLitStep(s);
  if (step === null) return -1;
  for (let i = 0; i < bastionPieceCount(step); i++) if (!bastionGone(s, i)) return i;
  return -1;
}

/** The column piece `i` of the lit shell stands over: a node's or a port's. */
export function bastionPieceCol(world: World, s: BastionState, i: number): number {
  return midCol(world.cfg) + (s.steps[s.cursor]?.offsets?.[i] ?? 0);
}

/** Whether a node is charging over its column right now. */
export function bastionCharging(s: BastionState): boolean {
  return bastionLitStep(s)?.layer === "lattice" && s.dischargeBeat >= 0;
}

/** Pieces in the whole script: the moon's health. */
export function bastionPiecesAll(s: BastionState): number {
  return s.steps.reduce((sum, step) => sum + bastionPieceCount(step), 0);
}

/** The core blown: the fight is over. */
export function bastionDone(s: BastionState): boolean {
  return s.phase === "spent";
}

/** A fresh moon: every shell on, unturned, no thumb on it, nothing charging. */
export function freshBastion(beat: number, steps: readonly BastionStep[]): BastionState {
  return {
    kind: "bastion",
    steps: steps.map((step) => ({
      ...step,
      ...(step.colors === undefined ? {} : { colors: [...step.colors] }),
      ...(step.offsets === undefined ? {} : { offsets: [...step.offsets] }),
    })),
    phase: "enter",
    phaseBeat: beat,
    cursor: 0,
    goneMask: 0,
    pieces: 0,
    down: [false, false],
    pullMilli: [0, 0],
    tore: [false, false],
    yawMilli: 0,
    spinning: false,
    spinAtMilli: 0,
    dischargeBeat: -1,
    chargeTick: 0,
    nextChargeBeat: -1,
  };
}
