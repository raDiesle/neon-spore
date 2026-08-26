import { type Creature, isMeteorKind, spanCenterCol } from "@neon-spore/sim";
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
  // One tile per beat, linear. No easing: the movement must read as an even
  // glide so that "it lands on the four" is a statement both players can act on.
  const row = c.fromRow + (c.row - c.fromRow) * beatPhase;
  // `c.col` is a wide kind's leftmost column (see `spanCenterCol` in
  // sim/types.ts) — every kind is drawn at its visual centre.
  return { x: tileCX(l, spanCenterCol(c.kind, c.col)), y: tileCY(l, row) };
}

/** How big it draws. A rock has its own sizes; everything living is one tile. */
export function creatureRadius(l: Layout, c: Creature): number {
  return isMeteorKind(c.kind) ? rockRadius(l, c.kind) : l.tile * 0.4;
}

/**
 * The creature under a finger, or null. Generous — a thumb covers more than a
 * silhouette and a falling target is not a button — and never the queen, who
 * cannot be gripped (`setGrip` in sim/grip.ts). The nearest wins when two
 * overlap.
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
    if (c.kind === "queen") continue;
    const { x: cx, y: cy } = creatureCenter(l, c, beatPhase);
    const reach = creatureRadius(l, c) * 1.6;
    const d = Math.hypot(x - cx, y - cy);
    if (d > reach || d >= bestDist) continue;
    best = c;
    bestDist = d;
  }
  return best;
}
