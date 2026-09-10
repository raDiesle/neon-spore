import { walkedSilhouette } from "../../../../../packages/content/src/body-form.js";
import type { Point } from "../../../../../packages/content/src/shapes.js";
import type { CreatureSilhouette } from "../../../../../packages/content/src/silhouettes.js";
import type { Body } from "../../../../../packages/render/src/creature-body-in.js";
import { mountBearing } from "../../../../../packages/render/src/mount-look.js";
import { rooted } from "../../../../shape-sheet/src/forms/anchored.js";

/**
 * TAPROOT — the mount is a bulb held to the wheel by roots.
 *
 * The form is the shape sheet's own TAPROOT (`free-contours.ts`, `rooted`):
 * a round body with five narrow tendrils cut into its underside, drifting
 * but never letting go. Here the underside is turned to face the hub, so
 * every mount on the rim reaches in toward the middle of the wheel, and the
 * six of them read as one thing gripping the rim rather than six bodies
 * that happen to stand on it. The tendrils are the whole claim — a body
 * with fat lower lobes is a slick — and they are what a slick or a bulb in
 * a lane never has.
 */

/** The sheet's TAPROOT with eight roots rather than five: `rooted` only
 * grows them on the underside, and eight puts three there — one straight
 * at the hub and one either side — where five put one and a half, which
 * read as a tail. */
const FORM = rooted("TAPROOT", "a bulb that will not come loose", 46, 40, 8, 0.6, 0.18, 6);
/** A walked form is fitted to its furthest reach, roots and all, so the body
 * under them would draw at little over half a slick; this is the body back
 * at a body's size, with the roots reaching past it as they should. */
const SIZE = 1.45;

/** One contour per rim bearing — twelve on a wheel — read once each. */
const BY_TURN = new Map<string, CreatureSilhouette>();

function turned(pts: Point[], turn: number): Point[] {
  const c = Math.cos(turn);
  const s = Math.sin(turn);
  return pts.map((p) => ({ x: p.x * c - p.y * s, y: p.x * s + p.y * c }));
}

/** The roots face the hub: the form's underside, `+y`, turned onto the
 * bearing back along the spoke. A mount off any wheel keeps them down. */
export function taproot(b: Body): CreatureSilhouette {
  const bearing = mountBearing(b) ?? -Math.PI / 2;
  const turn = bearing + Math.PI / 2;
  const key = turn.toFixed(3);
  const have = BY_TURN.get(key);
  if (have) return have;
  const made = walkedSilhouette(
    { lobes: 3, depth: 0.08, wobble: 0.04, seed: 11.6, sizeMul: SIZE },
    (t) => turned(FORM.pointsAt(t), turn),
  );
  BY_TURN.set(key, made);
  return made;
}
