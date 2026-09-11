import { orbit } from "./gyre-orbit.js";

/**
 * THE ONE RECORD A CANDIDATE GYRE CORE PATCHES.
 *
 * The seventh of `magnet-look.ts`'s kind, and here rather than at the bottom of
 * `gyre-core.ts` for its reason: the record needs the paint and `gyre.ts` needs
 * the record, so the two would import each other.
 *
 * **It is the core and not the wheel.** The rim, the spokes and the six bodies
 * standing on it are where the pair reads a *column* off, and a slot that could
 * move any of them would be a look with a rule inside it. The organelle in the
 * middle is the one part of this armature nothing stands on and nothing is
 * aimed at — which is exactly why `gyre-core.ts` gives it the wheel's true
 * turning rate while the rim ratchets, and exactly why it is the part a
 * candidate may argue about.
 */

/** The organelle in the middle of a wheel, as everything a surface could want. */
export interface GyreCoreDraw {
  readonly ctx: CanvasRenderingContext2D;
  /** The wheel's centre, in field pixels. */
  readonly x: number;
  readonly y: number;
  /** The organelle's own radius. */
  readonly r: number;
  /** The wheel's two neon colours, already hazed for the row it stands on. */
  readonly tint: string;
  readonly rim: string;
  /** How far the wheel has truly turned, in radians — not the rim's ratchet. */
  readonly flow: number;
  /** The wall clock, for the breath. */
  readonly time: number;
  /** How hard the maw is pulling, 0..1. The rim, the wind and this brighten together. */
  readonly pull: number;
}

export interface GyreLook {
  core(d: GyreCoreDraw): void;
}

/** `gyre-orbit.ts` since 11 September 2026: one band of light girdling the
 * ball at a tilt, its far half seen through the mass and its near half drawn
 * over the nucleus, swapping once a turn. The owner liked every answer to this
 * slot and the granules it replaced, so all four are on the SHAPES page's
 * FILLING axis — `tools/versus/DECIDED.md`. */
export const GYRE_LOOK: GyreLook = { core: orbit };
