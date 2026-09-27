import type { PartAngles } from "./idle-drift-parts.js";
import { STILL } from "./idle-drift-parts.js";
import type { Point } from "./outline-drift.js";
import { partMatrix, partOn, partPoint } from "./outline-parts.js";
import type { RepriseFrame } from "./reprise-body.js";
import type { ReprisePhase } from "./reprise-fx.js";

/**
 * THE REPRISE's parts — the outline tier's (`outline-parts.ts`) on the sac:
 * **its two cords swing** and **its eye looks about**.
 *
 * - **The cords** turn about where they grow out of the sac, so the end at the
 *   top of the screen walks along it half a tile at the widest (`PART.tip`,
 *   *Big enough to be seen*, `docs/looks.md`). The pair is one drift drawn as
 *   exact mirrors, so neither says which side: they open and close together,
 *   the way a hung thing breathes.
 * - **The eye** — the lens, and the ring of eggs round it that is its count —
 *   hangs from the top of the sac and swings there, so it glances left and
 *   right inside the body, half a tile at the widest. Only its place moves:
 *   the glass's highlights are a lamp's, and they stay up and to the left.
 *
 * **The eye is still while the echo plays.** Everything a playback is has to
 * stand where the pair already look: the beam falls from the middle of the
 * field, and the navigator's PRESS FIRE is written on the lens at rest
 * (`repriseTearCenter`, a reading of `World` that cannot know a glance). So it
 * comes back to the middle over the quarter second the beam comes up in, and
 * goes out again over a second once the echo has shut. Every mark drawn on it
 * — the dot, the triangle, the rewind, the eggs — is drawn at the place
 * `repriseEye` gives, the one function the drawer calls.
 */

/** Seconds the eye takes to come back to the middle as an echo opens: the beam's. */
const HOME = 0.25;

/** Seconds it takes to start looking about again once the echo has shut. */
const WANDER = 1;

/**
 * How much of its glance the eye has: 0 while an echo plays, eased at both
 * edges. `from` is the phase before the last flip, `flip` the seconds since.
 */
export function eyeFreedom(
  phase: ReprisePhase,
  from: ReprisePhase | undefined,
  flip: number,
): number {
  if (phase === "play") return Math.max(0, 1 - flip / HOME);
  if (from === "play") return Math.min(1, flip / WANDER);
  return 1;
}

/** The right cord's root on the sac, its bend and its end at the top of the screen, at rest. */
export function cordPoints(f: RepriseFrame, side: -1 | 1, t: number): readonly Point[] {
  const root = { x: f.x + side * f.rx * 0.42, y: f.cy - f.ry * 0.8 };
  const sway = Math.sin(t * 0.7 + side) * f.u * 0.08;
  return [
    root,
    { x: root.x + side * f.u * 0.5 + sway, y: root.y - f.u },
    { x: root.x + side * f.u * 0.9, y: 0 },
  ];
}

/**
 * The right cord's angles about its root at `t` (the left draws them
 * mirrored), or `STILL`. `tile` turns the cord's length into tiles for
 * `partOn`; `hush` is the sac's.
 */
export function cordSwing(f: RepriseFrame, tile: number, t: number, hush: number): PartAngles {
  const [root, , end] = cordPoints(f, 1, 0) as [Point, Point, Point];
  const length = Math.hypot(end.x - root.x, end.y - root.y) / tile;
  return partOn("reprise", 0, "arm", () => STILL, length, hush)(t);
}

/**
 * A cord's points turned by its swing: `side` -1 mirrors the right's angles.
 * The end is carried on past the top of the screen, so a swing that lifts it
 * never leaves a gap under the edge.
 */
export function swungCord(
  f: RepriseFrame,
  side: -1 | 1,
  t: number,
  swing: PartAngles,
): readonly Point[] {
  const pts = cordPoints(f, side, t);
  const root = pts[0] as Point;
  const end = pts[2] as Point;
  const a = { turn: swing.turn * side, tilt: swing.tilt, rotate: swing.rotate * side };
  const m = partMatrix(a, { joint: root, axis: Math.atan2(end.y - root.y, end.x - root.x) });
  const moved = pts.map((p) => partPoint(m, p));
  const tip = moved[2] as Point;
  const bend = moved[1] as Point;
  const past = { x: tip.x + (tip.x - bend.x), y: tip.y + (tip.y - bend.y) };
  return [...moved, past];
}

/**
 * **Where the eye is**: the lens's middle, hung from the top of the sac and
 * swung there. `freedom` is `eyeFreedom`'s; at 0 it is the rest place,
 * `(f.x, f.cy)`, exactly.
 */
export function repriseEye(
  f: RepriseFrame,
  tile: number,
  t: number,
  hush: number,
  freedom: number,
): Point {
  const rest = { x: f.x, y: f.cy };
  const joint = { x: f.x, y: f.cy - f.ry * 0.8 };
  const length = (rest.y - joint.y) / tile;
  const a = partOn("reprise", 1, "head", () => STILL, length, hush * freedom)(t);
  if (a.turn === 0 && a.tilt === 0 && a.rotate === 0) return rest;
  return partPoint(partMatrix(a, { joint, axis: Math.PI / 2 }), rest);
}
