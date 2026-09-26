import { keyLit } from "./surface.js";

/**
 * A BOSS SEEN FROM ANY SIDE.
 *
 * `surface.ts` turns one ball about one axis, and that is enough for a body
 * that is one contour. A boss is not: THE INSTAR is a head, a long body, two
 * wings and a tail, and the owner asked on 26 September 2026 for *the bosses
 * from different angles and perspective, like we need for THE INSTAR, but to
 * look correct and 3D* — front, side, three-quarter and the turn between them,
 * with its parts passing in front of one another as it goes. That needs the
 * one thing `docs/style-guide.md` otherwise forbids a card, a depth axis, and
 * the style guide's "A boss seen from any side" says why a boss may have it.
 *
 * **A rig is authored once, side-on, in model space**: `x` along the body
 * from the head (negative) to the tail, `y` down the screen, `z` toward the
 * viewer — the side view as drawn, so a rig's numbers read off the side
 * sheet. A `View` turns it:
 *
 * - **`yaw`** about the vertical. 0 is the side as authored; `π/2` swings the
 *   head round to face the player; `π/4` is the three-quarter.
 * - **`pitch`** about the screen's horizontal, positive to look down on it.
 * - **`lens`**, the distance to the eye in model units. Orthographic at
 *   `Infinity`; at a few body-lengths it adds the one cue an orthographic
 *   turn lacks — the near end swells and the far one shrinks, so going away
 *   and coming toward stop being mirror images (`docs/dimensional.md`).
 *
 * **The light does not turn**, here as everywhere. `KEY` stays where it is on
 * the screen and every normal is turned *into* the view before `keyLit` reads
 * it, so a surface carries its shading round with it and the lit shoulder
 * stays put. That is the pairing the style guide calls the whole effect.
 *
 * In `content` for `surface.ts`'s reason: arithmetic with no clock, no
 * randomness and no DOM, readable by the director's skins and the renderer,
 * which may not reach each other.
 */

/** A point or a direction in model space, or — once turned — in the view. */
export interface Vec3 {
  readonly x: number;
  readonly y: number;
  readonly z: number;
}

/** A way of looking at a rig, with its trigonometry worked out once. */
export interface View {
  readonly yaw: number;
  readonly pitch: number;
  readonly lens: number;
  readonly cy: number;
  readonly sy: number;
  readonly cp: number;
  readonly sp: number;
}

/** The side, as authored. */
export const SIDE = 0;
/** The head toward the player. */
export const FRONT = Math.PI / 2;
/** Half way between: the view that shows a body is a body. */
export const THREE_QUARTER = Math.PI / 4;

/** A view of a rig. `lens` in model units; `Infinity` is orthographic. */
export function view(yaw: number, pitch = 0, lens = Number.POSITIVE_INFINITY): View {
  return {
    yaw,
    pitch,
    lens,
    cy: Math.cos(yaw),
    sy: Math.sin(yaw),
    cp: Math.cos(pitch),
    sp: Math.sin(pitch),
  };
}

/** A direction turned into the view: yaw, then pitch. No perspective — a normal has none. */
export function turn(v: Vec3, w: View): Vec3 {
  // Positive yaw swings the head (negative x) toward the viewer.
  const x = v.x * w.cy + v.z * w.sy;
  const z1 = -v.x * w.sy + v.z * w.cy;
  return { x, y: v.y * w.cp + z1 * w.sp, z: -v.y * w.sp + z1 * w.cp };
}

/** A point as the view sees it: where on the screen, how near, and how much the lens swells it. */
export interface Seen {
  readonly x: number;
  readonly y: number;
  /** Toward the viewer is positive; what the painter sorts on. */
  readonly z: number;
  /** The lens's scale at this depth, 1 when orthographic. Multiply a radius by it. */
  readonly s: number;
}

/** Where a model-space point lands, about the rig's own origin. */
export function see(p: Vec3, w: View): Seen {
  const t = turn(p, w);
  const s = Number.isFinite(w.lens) ? w.lens / Math.max(w.lens * 0.2, w.lens - t.z) : 1;
  return { x: t.x * s, y: t.y * s, z: t.z, s };
}

/** How much light a model-space normal takes in this view: 0 in shadow, 1 square to the key. */
export function litIn(n: Vec3, w: View): number {
  const t = turn(n, w);
  return keyLit(t.x, t.y, t.z);
}

/** Whether a model-space normal faces the viewer: a feature on a surface is drawn only then. */
export function facing(n: Vec3, w: View): boolean {
  return turn(n, w).z > 0;
}

/**
 * The painter's order: far first. Parts of a rig, or segments of one long
 * part, are sorted by the depth of what they are hung on, which is what lets
 * a near wing cross a far one and a coiled tail pass behind its own root.
 * Stable, so two parts at one depth keep the order they were authored in.
 */
export function farFirst<T>(items: readonly T[], depth: (item: T) => number): T[] {
  return items
    .map((item, i) => ({ item, i, z: depth(item) }))
    .sort((a, b) => a.z - b.z || a.i - b.i)
    .map((e) => e.item);
}

/** `a + b·k`. */
export function addScaled(a: Vec3, b: Vec3, k: number): Vec3 {
  return { x: a.x + b.x * k, y: a.y + b.y * k, z: a.z + b.z * k };
}

/** `a` scaled to unit length, or `fallback` when it has none. */
export function unit(a: Vec3, fallback: Vec3 = { x: 0, y: 0, z: 1 }): Vec3 {
  const len = Math.hypot(a.x, a.y, a.z);
  return len < 1e-9 ? fallback : { x: a.x / len, y: a.y / len, z: a.z / len };
}

export function dot(a: Vec3, b: Vec3): number {
  return a.x * b.x + a.y * b.y + a.z * b.z;
}

export function cross(a: Vec3, b: Vec3): Vec3 {
  return { x: a.y * b.z - a.z * b.y, y: a.z * b.x - a.x * b.z, z: a.x * b.y - a.y * b.x };
}
