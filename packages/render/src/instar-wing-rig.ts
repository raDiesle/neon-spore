import {
  type Anchor,
  hang,
  poseOf,
  type Seen,
  see,
  type Vec3,
  type View,
} from "@neon-spore/content";
import type { Point } from "./instar-place.js";
import { type Look, toward } from "./instar-plate.js";

/**
 * **THE INSTAR's wing as a rig**: the flat wing in head radii, the two
 * carriages the figure's `side` runs between, the beat, and the anchor that
 * hangs it off its shoulder — everything `drawWing` (`instar-wings.ts`) lays
 * before it paints, and what a bolt meets of it (`instar-limb-stop.ts`).
 * Cut out of `instar-wings.ts` on 5 October 2026 so the outline the skin is
 * drawn round and the outline a bolt stops on are one.
 */

/** The wing laid flat, in head radii: `x` out from the shoulder, `y` back along the trailing edge. */
const ELBOW: Point = { x: 0.7, y: -0.75 };
export const WRIST: Point = { x: 1.45, y: -1.05 };
const TIPS: readonly Point[] = [
  { x: 2.1, y: -0.05 },
  { x: 1.55, y: 0.6 },
  { x: 0.8, y: 0.8 },
];
/** Where the membrane's hem meets the body, behind the shoulder. */
const ROOT: Point = { x: 0.15, y: 1.15 };
/** The light through the skin runs from the wrist, third in the outline, to the last fingertip. */
export const HEM_AT = 3 + 4 * 2 + 3;
/** One head radius of the flat wing, in pixels of `r`. */
export const SPAN = 0.82;

/** The two carriages the figure's `side` runs between. */
export const FACE_ON = { lift: 0.12, droop: 1.2, sweep: 0.18, reach: 1.18 };
const SIDE_ON = { lift: 1.25, droop: 0, sweep: 0.15, reach: 1 };
/** How far the beat rolls the wing, at full spread. */
const BEAT = 0.22;

/** The wing hung off its shoulder this frame, in the rig's space about it:
 * the bones, the root, `rig` for any other point of the flat wing, and the
 * membrane's outline — shoulder, elbow, wrist, then the hem. */
export function wingRig(look: Look, hinge: Vec3, side: 1 | -1) {
  const { f, time, r } = look;
  const spread = 0.35 + 0.65 * f.wing;
  const own = Math.sin(time * 1.7);
  // In flight the serpent's wave beats the wings, once a crest (`instar-serpent.ts`).
  const sw = look.serpent;
  const beat = (sw ? own + (sw.flap - own) * sw.fly : own) * BEAT * (0.4 + f.wing);
  const k = f.side;
  const mix = (a: number, b: number) => a + (b - a) * k;
  const anchor: Anchor = {
    at: hinge,
    roll: side * (mix(FACE_ON.lift, SIDE_ON.lift) + beat),
    pitch: mix(FACE_ON.droop, SIDE_ON.droop),
    yaw: side * mix(FACE_ON.sweep, SIDE_ON.sweep),
  };
  const s = r * SPAN * mix(FACE_ON.reach, SIDE_ON.reach);
  // Folded, the wing draws in along the arm and its trailing edge shortens.
  const flat = (q: Point): Vec3 => ({
    x: q.y * (0.6 + 0.4 * spread) * s,
    y: 0,
    z: side * q.x * spread * s,
  });
  const pose = poseOf(anchor);
  const rig = (q: Point) => hang(pose, flat(q));
  const shoulder = rig({ x: 0, y: 0 });
  const elbow = rig(ELBOW);
  const wrist = rig(WRIST);
  const tips = TIPS.map(rig);
  const root = rig(ROOT);
  // The hem: each scallop of skin sags in toward the wrist between two bones.
  const hem: Vec3[] = [];
  let last = WRIST;
  for (const t of [...TIPS, ROOT]) {
    const c = toward(toward(last, t, 0.5), WRIST, last === WRIST ? 0 : 0.3);
    for (const u of [0.25, 0.5, 0.75]) hem.push(rig(bend(last, c, t, u)));
    hem.push(rig(t));
    last = t;
  }
  const outline = [shoulder, elbow, wrist, ...hem];
  return { rig, shoulder, elbow, wrist, tips, root, outline };
}

/** The membrane's outline as `drawWing` lays it, shoulder at `at`, seen in `w`: where a bolt meets the wing. */
export function wingPoints(look: Look, at: Point, w: View, hinge: Vec3, side: 1 | -1): Point[] {
  return wingRig(look, hinge, side).outline.map((q) => {
    const p: Seen = see(q, w);
    return { x: at.x + p.x, y: at.y + p.y };
  });
}

/** A point `u` along the quadratic from `a` through control `c` to `b`. */
function bend(a: Point, c: Point, b: Point, u: number): Point {
  const v = 1 - u;
  return {
    x: v * v * a.x + 2 * v * u * c.x + u * u * b.x,
    y: v * v * a.y + 2 * v * u * c.y + u * u * b.y,
  };
}
