import { walkedSilhouette } from "../../../../../packages/content/src/body-form.js";
import type { Point } from "../../../../../packages/content/src/shapes.js";
import type { CreatureSilhouette } from "../../../../../packages/content/src/silhouettes.js";
import type { Body } from "../../../../../packages/render/src/creature-body-in.js";
import { mountBearing } from "../../../../../packages/render/src/mount-look.js";
import { sac } from "../../../../shape-sheet/src/forms/hanging.js";

/**
 * PENDANT — the mount is a sac hung off the rim, its mass fallen in toward
 * the hub.
 *
 * The form is the shape sheet's `sac` (`hanging.ts`), the one THE WEIGHT and
 * TENDRIL are built on: a blob with its mass pulled to one end, narrow at
 * the other. Here the narrow end is at the rim and the heavy end hangs in
 * toward the middle of the wheel, so every mount is a drop hanging off the
 * ring, and the six together read as fruit on a wheel rather than as six
 * bodies standing on it. It is the quietest of the three: no spine and no
 * root, only a body whose weight says which way the hub is.
 */

/** Hung heavier than TENDRIL and rounder than THE WEIGHT: a drop, not a
 * rope, at the size a mount is drawn. */
const FORM = sac("PENDANT", "a drop hung off the rim", 0.42, 40, 50);

/** A walked form is fitted to its furthest reach; this is the body back at
 * a body's size. */
const SIZE = 1.35;

/** One contour per rim bearing — twelve on a wheel — read once each. */
const BY_TURN = new Map<string, CreatureSilhouette>();

function turned(pts: Point[], turn: number): Point[] {
  const c = Math.cos(turn);
  const s = Math.sin(turn);
  return pts.map((p) => ({ x: p.x * c - p.y * s, y: p.x * s + p.y * c }));
}

/** The heavy end faces the hub: the form's `+y` turned onto the bearing
 * back along the spoke. A mount off any wheel hangs down. */
export function pendant(b: Body): CreatureSilhouette {
  const bearing = mountBearing(b) ?? -Math.PI / 2;
  const turn = bearing + Math.PI / 2;
  const key = turn.toFixed(3);
  const have = BY_TURN.get(key);
  if (have) return have;
  const made = walkedSilhouette(
    { lobes: 2, depth: 0.08, wobble: 0.04, seed: 4.2, sizeMul: SIZE },
    (t) => turned(FORM.pointsAt(t), turn),
  );
  BY_TURN.set(key, made);
  return made;
}
