import { type HaspState, haspBoltMilli, type SimConfig, ticksPerBeat } from "@neon-spore/sim";
import { fieldX } from "./field-flip.js";
import type { Point } from "./hasp-shape.js";
import { type Layout, tileCY } from "./layout.js";

/**
 * **THE HASP's loose bolt**, thrown from under the second clasp's hub and
 * falling down its column to the hull: its size, and where it is — laid off
 * the simulation's reckoning of the fall (`sim/hasp-shot.ts`, `spark-fall.ts`),
 * so a shot meets it where it is drawn. Beside `hasp-shape.ts` as THE
 * RATCHET's is beside its own (`ratchet-bolt.ts`).
 */

/** The loose bolt's half-width and half-length, in tiles: drawn that size and met at its lower end. */
export const HASP_BOLT = { halfW: 0.12, halfH: 0.3 } as const;

/**
 * Where the loose bolt is, fallen `along` (0..1) of the way from the second
 * clasp's hub down its column to the hull: drawn there (`hasp-draw.ts`),
 * aimed at there (`boss-cue-read-z.ts`) and met there by a shot — laid off
 * the simulation's own reckoning of it (`haspBoltMilli`).
 */
export function haspBoltAt(
  l: Layout,
  cfg: SimConfig,
  s: HaspState,
  beat: number,
  beatPhase: number,
): Point & { along: number } {
  const along = Math.min(
    1,
    Math.max(0, (beat - s.boltBeat + beatPhase) / Math.max(1, cfg.haspBoltBeats)),
  );
  const fuse = (beat - s.boltBeat + beatPhase) * ticksPerBeat(cfg);
  return { ...haspBoltPoint(l, s.boltCol, haspBoltMilli(cfg, fuse)), along };
}

/** The loose bolt `milli` thousandths of a row down column `col`: where it is drawn, and where it is shot out. */
export function haspBoltPoint(l: Layout, col: number, milli: number): Point {
  return { x: fieldX(l, col), y: tileCY(l, milli / 1000) };
}
