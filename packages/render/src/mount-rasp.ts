import {
  type CreatureSilhouette,
  type Point,
  studdedContour,
  walkedSilhouette,
} from "@neon-spore/content";
import type { Body } from "./creature-body-in.js";
import { mountBearing } from "./mount-bearing.js";

/**
 * RASP — a kept look for THE GYRE's mounts, drawn only on the GRAPHICS page's
 * LIBRARY.
 *
 * It stood in `creature:mount` on VERSUS, decided 11 September 2026: TAPROOT
 * went into the game (`mount-taproot.ts`) and the owner said "move to
 * 'shapes' page if not there yet: CREATURE:MOUNT · RASP". It sits in this
 * package, beside the record it once patched, because it is written against
 * this package's internals; nothing on the field imports it, and the game's
 * bundle drops it. The rim itself is `studdedContour` in `packages/content`.
 *
 * RASP — the mount is a burr: a small round body under a ring of short
 * spines, with a crown of longer ones on the side facing out.
 *
 * The form is the shape sheet's THE RASP (`tower-defence.ts`, `studded`),
 * given the crown `studded` offers and that draft left off: the spines on
 * the outward side are longer, so a mount has a *front*, and the front is
 * away from the hub. Six burrs bristling outward on a turning wheel read
 * as the wheel's own teeth rather than as six blobs in a ring, and a spine
 * is a claim no smooth body in the bestiary makes — which is what makes a
 * mount a mount at a glance. What it has to survive is 26 px, where a
 * needle is a pixel and a slick's outline is already ragged with wobble.
 */

/** The sheet's tuning, plus the crown, pointing along `+x` before the turn. */
const FORM = studdedContour({
  rx: 44,
  ry: 42,
  studs: 20,
  reach: 0.26,
  width: 0.34,
  blunt: 0.0,
  lobes: 3,
  depth: 0.04,
  seed: 6.7,
  crown: { reach: 0.5, at: 0, spread: 0.55 },
});

/** A walked form is fitted to its furthest reach, crown and all; this is
 * the body back at a body's size. */
const SIZE = 1.3;

/** One contour per rim bearing — twelve on a wheel — read once each. */
const BY_TURN = new Map<string, CreatureSilhouette>();

function turned(pts: Point[], turn: number): Point[] {
  const c = Math.cos(turn);
  const s = Math.sin(turn);
  return pts.map((p) => ({ x: p.x * c - p.y * s, y: p.x * s + p.y * c }));
}

/** The crown faces outward: the form's `+x` turned onto the bearing from
 * the hub. A mount off any wheel points it up. */
export function rasp(b: Body): CreatureSilhouette {
  const turn = mountBearing(b) ?? -Math.PI / 2;
  const key = turn.toFixed(3);
  const have = BY_TURN.get(key);
  if (have) return have;
  const made = walkedSilhouette(
    { lobes: 20, depth: 0.04, wobble: 0.025, seed: 6.7, sizeMul: SIZE },
    (t) => turned(FORM(t), turn),
  );
  BY_TURN.set(key, made);
  return made;
}
