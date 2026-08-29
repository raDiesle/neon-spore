import {
  type Creature,
  DEFAULT_CONFIG,
  isGrippable,
  isMeteorKind,
  type SimConfig,
  spanCenterCol,
} from "@neon-spore/sim";
import { depthScale, drawnRow } from "./depth.js";
import { type Layout, tileCX, tileCY } from "./layout.js";
import { rockRadius } from "./torch.js";

/**
 * Where a creature is on screen, between beats. The one place the glide is
 * written down: the grip's ring is drawn around the same shape the player is
 * looking at, and the app hit-tests a finger against it, so all three have to
 * agree about where the thing actually is.
 */
export function creatureCenter(
  l: Layout,
  c: Creature,
  beatPhase: number,
): { x: number; y: number } {
  // One tile per beat, linear (`drawnRow`). No easing: the movement must read
  // as an even glide so that "it lands on the four" is a statement both
  // players can act on. Exactly linear, and it stays that way — the depth cues
  // in `depth.ts` change how big a body draws, never where it is.
  const row = drawnRow(c, beatPhase);
  // `c.col` is a wide kind's leftmost column (see `spanCenterCol` in
  // sim/types.ts) — every kind is drawn at its visual centre.
  return { x: tileCX(l, spanCenterCol(c.kind, c.col)), y: tileCY(l, row) };
}

/**
 * How big it draws. A rock has its own sizes; everything living is one tile —
 * both then times the row's perspective scale, because a ring drawn around a
 * body that grew is a ring that has to grow with it.
 *
 * `beatPhase` and `cfg` are optional so that a caller with neither still gets
 * the shape the game actually draws rather than the flat one: phase 0 puts the
 * body on the row it left, 0.9% of a radius from where it is mid-glide, and
 * `DEFAULT_CONFIG` is what every device runs. `grip.ts` is the one such
 * caller; a quarter of a pixel is under what its own `RING_MUL` spends, and it
 * is worth passing properly the next time that file is open.
 */
export function creatureRadius(
  l: Layout,
  c: Creature,
  beatPhase = 0,
  cfg: SimConfig = DEFAULT_CONFIG,
): number {
  const flat = isMeteorKind(c.kind) ? rockRadius(l, c.kind) : l.tile * 0.4;
  return flat * depthScale(cfg, l, drawnRow(c, beatPhase));
}

/**
 * The creature under a finger, or null. Generous — a thumb covers more than a
 * silhouette and a falling target is not a button — and never a boss body or
 * THE WARDEN's rope, neither of which can be gripped (`isGrippable` in
 * sim/kinds.ts). The nearest wins when two overlap.
 *
 * The rope used to be answered here, along its whole length, because a hand was
 * the only thing that touched it. It is now *dragged* by a handle rather than
 * held, and a handle is a circle rather than a line: `tetherHandleCircle` in
 * `tether.ts` owns that hit test, beside the code that draws it.
 */
export function creatureAt(
  l: Layout,
  creatures: readonly Creature[],
  x: number,
  y: number,
  beatPhase: number,
): Creature | null {
  let best: Creature | null = null;
  let bestDist = Number.POSITIVE_INFINITY;
  for (const c of creatures) {
    if (!isGrippable(c.kind)) continue;
    const { x: cx, y: cy } = creatureCenter(l, c, beatPhase);
    const reach = creatureRadius(l, c, beatPhase) * 1.6;
    const d = Math.hypot(x - cx, y - cy);
    if (d > reach || d >= bestDist) continue;
    best = c;
    bestDist = d;
  }
  return best;
}
