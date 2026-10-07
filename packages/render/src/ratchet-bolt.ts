import { type RatchetState, ratchetBoltMilli, type SimConfig, ticksPerBeat } from "@neon-spore/sim";
import { fieldX } from "./field-flip.js";
import { type Layout, tileCY } from "./layout.js";
import type { Point } from "./ratchet-shape.js";

/**
 * **THE RATCHET's loose bolt**, thrown from under the lock and falling down
 * its column to the hull: its size, and where it is — laid off the
 * simulation's reckoning of the fall (`sim/ratchet-shot.ts`, `spark-fall.ts`),
 * so a shot meets it where it is drawn. Cut off `ratchet-shape.ts` when that
 * one reached 225 lines.
 */

/** The loose bolt's half-width and half-length, in tiles: drawn that size and met at its lower end. */
export const RATCHET_BOLT = { halfW: 0.12, halfH: 0.3 } as const;

/**
 * Where the loose bolt is, fallen `along` (0..1) of the way from under the
 * lock down its column to the hull: drawn there (`ratchet-draw.ts`), aimed at
 * there (`boss-cue-read-zb.ts`) and met there by a shot — laid off the
 * simulation's own reckoning of it (`ratchetBoltMilli`).
 */
export function ratchetBoltAt(
  l: Layout,
  cfg: SimConfig,
  s: RatchetState,
  beat: number,
  beatPhase: number,
): Point & { along: number } {
  const along = Math.min(
    1,
    Math.max(0, (beat - s.boltBeat + beatPhase) / Math.max(1, cfg.ratchetBoltBeats)),
  );
  const fuse = (beat - s.boltBeat + beatPhase) * ticksPerBeat(cfg);
  return { ...ratchetBoltPoint(l, s.boltCol, ratchetBoltMilli(cfg, fuse)), along };
}

/** The loose bolt `milli` thousandths of a row down column `col`: where it is drawn, and where it is shot out. */
export function ratchetBoltPoint(l: Layout, col: number, milli: number): Point {
  return { x: fieldX(l, col), y: tileCY(l, milli / 1000) };
}
