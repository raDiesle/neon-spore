import { blobPoints } from "@neon-spore/content";
import {
  hullRow,
  midCol,
  type SimConfig,
  type SinewState,
  sinewBandMilli,
  sinewMassRow,
  sinewSum,
  sinewWalked,
} from "@neon-spore/sim";
import { type Layout, tileCX, tileCY } from "./layout.js";
import { sinewCrownDrop, sinewMassBob, sinewMassRing } from "./sinew-arrive.js";
import { CROWN_HEADROOM } from "./sinew-crown.js";
import { sinewSway } from "./sinew-sway.js";
import { splinePath } from "./spline.js";
import { TOP_CHROME_PX } from "./top-chrome.js";

/**
 * **Where THE SINEW is**, in field pixels: the root the tendon hangs from,
 * the mass on the end of it, and the outline of that mass.
 *
 * Its own file so the picture and the hit test read one geometry: the
 * handles rest beside the mass (`sinew-handles.ts`), the fibres run from the
 * root to it (`sinew-fibres.ts`), the band sits on the way down
 * (`sinew-band.ts`), and a mass placed in two files would be a handle drawn
 * beside one and answered beside another.
 *
 * Nothing here reads the wall clock except the blob's own wobble: the rest
 * a thumb is tested against has to be the rest that is drawn, so the mass's
 * place is the beat, the phase and the state, and nothing else.
 */

export interface Point {
  x: number;
  y: number;
}

/** The mass's half-width as a share of the columns it spans, and its half-height in tiles. */
const MASS_RX = 0.92;
const MASS_RY = 0.7;
/** How far the mass sags below its row at full strain, in tiles: the pull is seen arriving. */
const SAG = 0.35;
/** How far above the field's top row the root is, in tiles: where the fibres
 * leave the crown, the body they hang from (`sinew-crown.ts`). */
const ROOT_ABOVE = 1.2;
/** How much of the mass's half-height it sits into the hull once landed. */
const LANDED_SINK = 0.8;

/** The root: dead centre, just off the top edge. The tendon is the one thing
 * on the field that hangs from somewhere the field is not. Never so high that
 * the crown flying over it would reach the chrome's line: on a screen whose
 * field starts near the top, the root comes down instead (`sinew-crown.ts`). */
export function sinewAnchor(l: Layout, cfg: SimConfig): Point {
  const y = Math.max(l.gridTop - l.tile * ROOT_ABOVE, TOP_CHROME_PX + l.tile * CROWN_HEADROOM);
  return { x: tileCX(l, midCol(cfg)), y };
}

/** The root now: the anchor, with the crown still sliding in at the start. */
export function sinewRoot(
  l: Layout,
  cfg: SimConfig,
  s: SinewState,
  beat: number,
  beatPhase: number,
): Point {
  const a = sinewAnchor(l, cfg);
  return { x: a.x, y: a.y + sinewCrownDrop(s, cfg, beat, beatPhase) * l.tile };
}

export function sinewMassRx(l: Layout, cfg: SimConfig): number {
  return (Math.max(1, Math.min(cfg.sinewMassCols, cfg.cols)) / 2) * l.tile * MASS_RX;
}

export function sinewMassRy(l: Layout): number {
  return l.tile * MASS_RY;
}

/** The sum as a share of the band, 0 slack to 1 at two hands' reach. */
export function sinewSum01(s: SinewState, cfg: SimConfig): number {
  return Math.min(1, sinewSum(s) / Math.max(1, sinewBandMilli(cfg)));
}

/** Whether the mass has landed, and whether it landed on the ship. */
export function sinewLanded(s: SinewState): boolean {
  return s.outBeat >= 0;
}
export function sinewCrushed(s: SinewState, cfg: SimConfig): boolean {
  return sinewLanded(s) && sinewWalked(s, cfg) < cfg.sinewClearCols;
}

/**
 * The row the mass is on now, with the fall eased between beats: the
 * simulation drops it a whole row a beat (`sinewMassRow`), and a mass that
 * jumped a row at a time would be a mass nobody could steer by eye.
 */
export function sinewMassRowNow(
  s: SinewState,
  cfg: SimConfig,
  beat: number,
  beatPhase: number,
): number {
  const now = sinewMassRow(s, cfg, beat);
  if (s.fallBeat < 0 || sinewLanded(s)) return now;
  const next = sinewMassRow(s, cfg, beat + 1);
  return now + (next - now) * Math.max(0, Math.min(1, beatPhase));
}

/**
 * Where the mass hangs, with no sag and no bounce: its row, eased through
 * the fall, and the ringing it arrives on. What the strain band is hung
 * against (`sinew-band.ts`), so the gauge holds still while the mass bobs
 * under it.
 */
export function sinewMassHung(
  l: Layout,
  cfg: SimConfig,
  s: SinewState,
  beat: number,
  beatPhase: number,
  swingTiles = 0,
): Point {
  const ry = sinewMassRy(l);
  const x = tileCX(l, s.massCol) + swingTiles * l.tile;
  if (sinewLanded(s)) return { x, y: l.hullY - ry * LANDED_SINK };
  const row = sinewMassRowNow(s, cfg, beat, beatPhase);
  const ring = sinewMassRing(s, cfg, beat, beatPhase) * l.tile;
  return { x, y: Math.min(tileCY(l, row) + ring, tileCY(l, hullRow(cfg))) };
}

/**
 * The mass's centre. `swingTiles` is the whip a snap-back leaves in it,
 * kept by `sinew-fx.ts` because nothing in the world remembers it. The sag,
 * the beat's bounce and the idle swing (`sinew-sway.ts`) are on it here, and the handles rest off it — so
 * the ring a thumb is answered at bounces with the ring that is drawn.
 */
export function sinewMassCentre(
  l: Layout,
  cfg: SimConfig,
  s: SinewState,
  beat: number,
  beatPhase: number,
  swingTiles = 0,
): Point {
  const hung = sinewMassHung(l, cfg, s, beat, beatPhase, swingTiles);
  if (sinewLanded(s)) return hung;
  const sag = sinewSum01(s, cfg) * SAG * l.tile;
  const bob = sinewMassBob(s, cfg, beat, beatPhase) * l.tile;
  // And the swing on its tendon, which the collar above it does not take (`sinew-sway.ts`).
  const sway = sinewSway(cfg, s, beat, beatPhase);
  // Never below where it lands: the last row of the fall is the hull's.
  return {
    x: hung.x + sway.x * l.tile,
    y: Math.min(hung.y + sag + bob + sway.y * l.tile, tileCY(l, hullRow(cfg))),
  };
}

/** The mass itself: a five-lobed blob the width of its columns, wobbling on
 * the wall clock like every body on the field. */
export function sinewMassPath(l: Layout, cfg: SimConfig, c: Point, time: number): Path2D {
  return splinePath(
    blobPoints(c.x, c.y, sinewMassRx(l, cfg), sinewMassRy(l), 5, 0.18, 0.05, time * 0.4, 26),
    true,
  );
}
