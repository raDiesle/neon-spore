import { hullRow, type SimConfig } from "./config.js";
import { mimicShapeAt, mimicShapeSize } from "./mimic-shapes.js";
import type { Color } from "./types.js";
import type { World } from "./world.js";

/**
 * THE MIMIC: a picture only one seat can see, painted a tile at a time by
 * the other (`docs/spec/bosses-choreographed.md` §42).
 *
 * **The rule is one sentence**: one of you sees the picture and says which
 * tiles, in which colour, and the other paints them.
 *
 * Reworked on 3 October 2026, on the owner's word that a sign drawn freehand
 * on the glass could not be told right from wrong: the field above the ship
 * is a board of tiles, THE FLEET's chart without its letters, and a picture
 * is a few of them in the four colours of the standard panel
 * (`mimic-shapes.ts`).
 *
 * `signs` is the truth the screens split (`PerSeatTruth`): the picture seat
 * *k* must paint is `signs[k - 1]`, in `inks[k - 1]`, with its top left on
 * the tile `origins[k - 1]`, and it is shown on the **other** seat's screen
 * only (`mimicReadBy`) — with every tile painted so far marked right or
 * wrong there, live, and on the painter's screen not at all.
 *
 * **The brush is one for the pair**, THE THROAT's mouth (`throat.ts`): its
 * four buttons set it, and each seat keeps the two it has always had — the
 * shots are the navigator's, the shield and the maw the pilot's. So a
 * painter often needs the reader's thumb as well as the reader's words. A
 * tap paints the tile in the brush; a tap on a tile already in it clears it
 * (`mimic-hand.ts`). **A picture painted exactly peels**, and draws every
 * arm back up a step. A window run out leaves the skin mottled for
 * `mimicMimicBeats`, and then an arm reaches a step down toward the hull.
 * `mimicReaches` reaches in one movement strike the hull, which is the wave.
 *
 * **Its health is its pictures**: six peeled one at a time over two
 * movements, then two split boards each peeled by both seats at once, each
 * baring a core that takes one tap in the colour it is lit.
 */

/**
 * Where the scene is: flattened at the top and slapping into shape, a
 * picture to paint, the skin mottled from a window run out, flinching from a peel, rolling
 * over between movements, the core bare and lit, clenching from a hit, and
 * shapeless and falling, spent.
 */
export const MIMIC_PHASES = [
  "entering",
  "sign",
  "mimicking",
  "peeled",
  "rolling",
  "core",
  "clench",
  "spent",
] as const;
export type MimicPhase = (typeof MIMIC_PHASES)[number];

/**
 * What a step asks: one picture read by one seat and painted by the other; a
 * board split in two, each half read by one seat and painted by the other at
 * once; the bare core tapped in its colour; or a roll between movements,
 * which asks nothing.
 */
export const MIMIC_ASKS = ["sign", "split", "core", "roll"] as const;
export type MimicAsk = (typeof MIMIC_ASKS)[number];

/** One step of the script, authored on the wave. */
export interface MimicStep {
  ask: MimicAsk;
  /** The seat that sees a `sign` step's picture; the other paints it. A split's seats read each other's. */
  reader: 1 | 2;
  /** Whether the picture changes to another `mimicChangeBeats` into its window, the paint left as it was. */
  changes: boolean;
  /** The colour the brush must be in for a `core` step's tap, or `"either"`. */
  color: Color | "either";
  /** Beats the step's window stays open: a picture's to be painted, the core's to be tapped, a roll's to roll. */
  beats: number;
}

/** What a wave authors: the whole script, in order. */
export interface MimicEntry {
  kind: "mimic";
  steps: readonly MimicStep[];
}

export interface MimicState {
  kind: "mimic";
  /** Copied at install and never written again. */
  steps: MimicStep[];
  phase: MimicPhase;
  /** `world.beat` the phase began. */
  phaseBeat: number;
  /** The step lit, or the next to light. */
  cursor: number;
  /** The picture each seat must paint, an index into `MIMIC_SHAPES`, or -1 with nothing to paint. */
  signs: [number, number];
  /** Each picture's colours, packed (`mimicInk`). */
  inks: [number, number];
  /** The tile each picture's top left stands on, `col + row * cols`. */
  origins: [number, number];
  /**
   * **The board**: every tile of it (`mimicRows`), `col + row * cols`, 0 bare or
   * 1 to 4 the colour it is painted (`THROAT_MODES` index plus one). One for
   * both seats, cleared when a picture surfaces.
   */
  paint: number[];
  /** The colour the pair's one brush is set to, 1 to 4. Red to begin with. */
  brush: number;
  /** Which seats have peeled their picture in the step that is on. */
  peeled: [boolean, boolean];
  /** Whether the step's picture has already changed. */
  changed: boolean;
  /** Arms reached down in this movement. */
  reaches: number;
  /** Pictures peeled off in all. */
  peels: number;
  /** Taps the core has taken. */
  hits: number;
}

export function mimicBoss(world: World): MimicState | null {
  const boss = world.boss;
  return boss !== null && boss.kind === "mimic" ? boss : null;
}

/** The step lit, or null with none. */
export function mimicStep(s: MimicState): MimicStep | null {
  return s.steps[s.cursor] ?? null;
}

/** Whether a picture is up to be painted. */
export function mimicAsking(s: MimicState): boolean {
  return s.phase === "sign";
}

/** Whether `seat` has a picture to paint this instant: its half not yet peeled. */
export function mimicDraws(s: MimicState, seat: 1 | 2): boolean {
  return mimicAsking(s) && (s.signs[seat - 1] ?? -1) !== -1 && !s.peeled[seat - 1];
}

/**
 * **The picture `seat`'s screen shows**, or -1 for none: the one the
 * *other* seat must paint, while it is still up. The whole of the split —
 * the seat that can see is never the hand that can answer.
 */
export function mimicReadBy(s: MimicState, seat: 1 | 2): number {
  const other: 1 | 2 = seat === 1 ? 2 : 1;
  return mimicDraws(s, other) ? (s.signs[other - 1] ?? -1) : -1;
}

/** Whether the skin is mottled from a window run out, before the arm reaches. */
export function mimicMimicking(s: MimicState): boolean {
  return s.phase === "mimicking";
}

/** Whether the core is bare and lit to be tapped. */
export function mimicFiring(s: MimicState): boolean {
  return s.phase === "core";
}

/** Shapeless and falling: the fight is over. */
export function mimicDone(s: MimicState): boolean {
  return s.phase === "spent";
}

/** A fresh mimic: flattened at the top, no picture up, no arm reached. */
export function freshMimic(beat: number, steps: readonly MimicStep[], tiles: number): MimicState {
  return {
    kind: "mimic",
    steps: steps.map((step) => ({ ...step })),
    phase: "entering",
    phaseBeat: beat,
    cursor: 0,
    signs: [-1, -1],
    inks: [0, 0],
    origins: [0, 0],
    paint: new Array<number>(tiles).fill(0),
    brush: 1,
    peeled: [false, false],
    changed: false,
    reaches: 0,
    peels: 0,
    hits: 0,
  };
}

/**
 * How many rows the board has: every row above the hull but the one just
 * over it, which is the window's clock (`render/mimic-board.ts`).
 */
export function mimicRows(cfg: SimConfig): number {
  return Math.max(1, hullRow(cfg) - 1);
}

/** How many tiles the board has: every column of every row of it. */
export function mimicTiles(world: World): number {
  return world.cfg.cols * mimicRows(world.cfg);
}

/**
 * The colour seat `seat`'s picture wants on the tile at `col`, `row`, 1 to 4,
 * or 0 for bare — and 0 everywhere while it has none.
 */
export function mimicWants(
  world: World,
  s: MimicState,
  seat: 1 | 2,
  col: number,
  row: number,
): number {
  const i = seat - 1;
  const shape = s.signs[i] ?? -1;
  if (shape < 0) return 0;
  const origin = s.origins[i] ?? 0;
  const cols = world.cfg.cols;
  return mimicShapeAt(
    shape,
    s.inks[i] ?? 0,
    col - (origin % cols),
    row - Math.floor(origin / cols),
  );
}

/** Whether every tile under seat `seat`'s picture is painted exactly as it wants. */
export function mimicPainted(world: World, s: MimicState, seat: 1 | 2): boolean {
  const i = seat - 1;
  const shape = s.signs[i] ?? -1;
  if (shape < 0) return false;
  const cols = world.cfg.cols;
  const origin = s.origins[i] ?? 0;
  const [c0, r0] = [origin % cols, Math.floor(origin / cols)];
  const { w, h } = mimicShapeSize(shape);
  for (let dr = 0; dr < h; dr++) {
    for (let dc = 0; dc < w; dc++) {
      const at = c0 + dc + (r0 + dr) * cols;
      if ((s.paint[at] ?? 0) !== mimicWants(world, s, seat, c0 + dc, r0 + dr)) return false;
    }
  }
  return true;
}
