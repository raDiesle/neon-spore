import { type LampreyState, lampreyTowAt, lampreyTowPoints, type SimConfig } from "@neon-spore/sim";
import { fieldX } from "./field-flip.js";
import { handleRadius } from "./handle-draw.js";
import { type Circle, type Layout, tileCY } from "./layout.js";
import { PULL_TRACK_W, type PullTrack } from "./pull-track.js";

/**
 * **THE LAMPREY's tow on this screen** (`sim/lamprey-tow.ts`): the curve the
 * head is pulled back along, as pixels from the tile it came down on, mirrored
 * with the field. The simulation's own points, so the channel a thumb follows
 * is the one the head is carried along, and the knob is answered where it
 * waits — wherever it was let go, or a third of the way after the lunge.
 */

/** A point of the simulation's curve, thousandths of a tile from the tile, on this screen. */
function onScreen(
  l: Layout,
  s: LampreyState,
  p: { x: number; y: number },
): { x: number; y: number } {
  const x = ((l.flip ? -p.x : p.x) * l.tile) / 1000;
  return { x: fieldX(l, s.col) + x, y: tileCY(l, s.row) + (p.y * l.tile) / 1000 };
}

/** The point `milli` along the curve, on this screen. */
export function lampreyTowPoint(
  l: Layout,
  cfg: SimConfig,
  s: LampreyState,
  milli: number,
): { x: number; y: number } {
  return onScreen(l, s, lampreyTowAt(cfg, s, milli));
}

/** The head's knob in a tow, as a circle where it waits now. */
export function lampreyTowKnob(l: Layout, cfg: SimConfig, s: LampreyState): Circle {
  return { ...lampreyTowPoint(l, cfg, s, s.towMilli), r: handleRadius(l, cfg) };
}

/** The channel the knob runs along: the whole curve, from the tile to where the head lets go. */
export function lampreyTowTrack(l: Layout, cfg: SimConfig, s: LampreyState): PullTrack {
  const pts = lampreyTowPoints(cfg, s).map((p) => onScreen(l, s, p));
  return { pts, w: handleRadius(l, cfg) * PULL_TRACK_W };
}
