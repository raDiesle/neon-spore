import type { Vec3 } from "@neon-spore/content";
import { convexHull } from "./convex-hull.js";
import type { Point } from "./instar-place.js";

/**
 * **THE INSTAR's side-on head, modelled in three dimensions and seen three
 * quarters round** — the owner, 7 October 2026: *it should look more 3d and
 * head natural — overall like a dragon — and head should look half way to
 * player perspective and look angry.* The body stays in profile; the head
 * turns on its neck to face the ship, the way a dragon in a painting looks
 * out of the picture.
 *
 * Only the solids are modelled: a skull, a snout, a lower jaw on a hinge. They
 * are sampled as points, turned and seen once, and the outline drawn is the
 * hull round what was seen — so a part is always a closed, rounded plate the
 * hide's paint (`instar-plate.ts`) can lay over, never a wire of tubes.
 *
 * In head radii, snout to `-x`, `y` down, `z` the near side. The turn is a
 * constant, so everything but the jaw is seen once, when the module loads.
 */

/** How far the head is turned from profile toward the player, and how far it hangs its snout at the ship. */
export const QUARTER_YAW = 1.0;
const PITCH = 0.2;
/** How far off the eye is, in head radii: near enough that the near side opens and the far one closes. */
const LENS = 7;

const cy = Math.cos(QUARTER_YAW);
const sy = Math.sin(QUARTER_YAW);
const cp = Math.cos(PITCH);
const sp = Math.sin(PITCH);

/** A model point as seen: across and down in head radii, and how near the eye it is. */
export interface Seen3 extends Point {
  readonly z: number;
}

/** Where a model point lands, hung `PITCH` at the ship and turned `QUARTER_YAW` toward it. */
export function seen(p: Vec3): Seen3 {
  const x1 = p.x * cp + p.y * sp;
  const y1 = -p.x * sp + p.y * cp;
  const x2 = x1 * cy + p.z * sy;
  const z2 = -x1 * sy + p.z * cy;
  const s = LENS / (LENS - z2);
  return { x: x2 * s, y: y1 * s, z: z2 };
}

/** How far a direction in the model faces the eye once turned, -1..1. */
export function facing(n: Vec3): number {
  const x1 = n.x * cp + n.y * sp;
  return -x1 * sy + n.z * cy;
}

/** A ring of a solid: its centre and its half-height and half-width across. */
interface Section {
  readonly x: number;
  readonly y: number;
  readonly h: number;
  readonly w: number;
}

/** Points round a run of sections, each a rounded box (a superellipse), `k` round each. */
function solid(sections: readonly Section[], k = 14): Vec3[] {
  const out: Vec3[] = [];
  for (const c of sections)
    for (let i = 0; i < k; i++) {
      const a = (i / k) * Math.PI * 2;
      const ca = Math.cos(a);
      const sa = Math.sin(a);
      // Squarer than an ellipse: a skull has a flat top and flat cheeks.
      const ex = Math.sign(ca) * Math.abs(ca) ** 0.7;
      const ey = Math.sign(sa) * Math.abs(sa) ** 0.7;
      out.push({ x: c.x, y: c.y + ey * c.h, z: ex * c.w });
    }
  return out;
}

/** The cranium: a dome behind the eyes, broad across the back of the head. */
const CRANIUM: readonly Section[] = [
  { x: 0.8, y: -0.1, h: 0.24, w: 0.3 },
  { x: 0.6, y: -0.18, h: 0.36, w: 0.46 },
  { x: 0.32, y: -0.2, h: 0.38, w: 0.52 },
  { x: 0.05, y: -0.17, h: 0.34, w: 0.48 },
];

/** The snout: from under the brow to the nose, narrowing, its top dropping to the nostrils. */
const SNOUT: readonly Section[] = [
  { x: -0.15, y: -0.06, h: 0.24, w: 0.42 },
  { x: -0.55, y: -0.01, h: 0.18, w: 0.32 },
  { x: -0.95, y: 0.02, h: 0.14, w: 0.25 },
  { x: -1.25, y: 0.03, h: 0.11, w: 0.19 },
];

/** The lower jaw, shut, from the hinge to the chin. */
const JAW: readonly Section[] = [
  { x: 0.36, y: 0.16, h: 0.12, w: 0.42 },
  { x: 0, y: 0.22, h: 0.1, w: 0.36 },
  { x: -0.6, y: 0.24, h: 0.08, w: 0.25 },
  { x: -1.12, y: 0.22, h: 0.065, w: 0.16 },
];

/** Where the jaw turns, and the lip line along its top, near side to far, shut. */
export const HINGE = { x: 0.4, y: 0.1 } as const;

const upperPts = [...solid(CRANIUM), ...solid(SNOUT)].map(seen);

/** The upper head's outline as seen, in head radii about the head's middle. */
export const SKULL_OUTLINE: readonly Point[] = convexHull(upperPts);

/** The snout's top, lit: the bridge from between the brows to the nose. */
export const BRIDGE: readonly Point[] = convexHull(
  SNOUT.flatMap((c) =>
    [-0.75, -0.35, 0, 0.35, 0.75].map((t) =>
      seen({ x: c.x, y: c.y - c.h * (0.92 - 0.25 * t * t), z: t * c.w }),
    ),
  ),
);

/** The snout's top at `x` along it, and its half-width there: what a fold across the bridge lies on. */
function snoutTop(x: number): { y: number; w: number } {
  for (let i = 1; i < SNOUT.length; i++) {
    const a = SNOUT[i - 1] as Section;
    const b = SNOUT[i] as Section;
    if (x <= a.x && x >= b.x) {
      const t = (a.x - x) / (a.x - b.x);
      return { y: a.y - a.h + (b.y - b.h - a.y + a.h) * t, w: a.w + (b.w - a.w) * t };
    }
  }
  const end = x > 0 ? (SNOUT[0] as Section) : (SNOUT.at(-1) as Section);
  return { y: end.y - end.h, w: end.w };
}

/** The ridge down the middle of the face, from between the brows to the nose: where the face turns. */
export const MIDLINE: readonly Seen3[] = [-0.2, -0.75, -1.27].map((x) =>
  seen({ x, y: snoutTop(x).y + 0.01, z: 0 }),
);

/** The snarl: folds of hide rucked up across the bridge behind the nose, far end, middle, near end. */
export const FOLDS: readonly (readonly [Seen3, Seen3, Seen3])[] = [-0.62, -0.78, -0.94].map((x) => {
  const { y, w } = snoutTop(x);
  return [
    seen({ x, y: y + 0.03, z: -w * 0.7 }),
    seen({ x: x + 0.05, y: y - 0.02, z: 0 }),
    seen({ x, y: y + 0.03, z: w * 0.7 }),
  ] as const;
});

/** The upper lip, from the far corner of the mouth round the nose to the near one. */
export const UPPER_LIP: readonly Seen3[] = [
  { x: 0.3, y: 0.12, z: -0.42 },
  { x: -0.55, y: 0.16, z: -0.3 },
  { x: -1.05, y: 0.15, z: -0.2 },
  { x: -1.3, y: 0.13, z: 0 },
  { x: -1.05, y: 0.15, z: 0.2 },
  { x: -0.55, y: 0.16, z: 0.3 },
  { x: 0.3, y: 0.12, z: 0.42 },
].map(seen);

/** A point of the lower jaw opened `open` radians on its hinge. */
export function onJaw(p: Vec3, open: number): Vec3 {
  const c = Math.cos(open);
  const s = Math.sin(open);
  const dx = p.x - HINGE.x;
  const dy = p.y - HINGE.y;
  // Opening drops the chin: the jaw turns about its hinge, front end down.
  return { x: HINGE.x + dx * c + dy * s, y: HINGE.y - dx * s + dy * c, z: p.z };
}

/** The lower jaw opened `open`: its outline, its lip from the far corner to the near, and its floor. */
export function jawSeen(open: number): {
  outline: Point[];
  lip: Seen3[];
} {
  const outline = convexHull(solid(JAW, 10).map((p) => seen(onJaw(p, open))));
  const lip = [
    { x: 0.3, y: 0.12, z: -0.4 },
    { x: -0.55, y: 0.16, z: -0.26 },
    { x: -1.0, y: 0.16, z: -0.14 },
    { x: -1.15, y: 0.16, z: 0 },
    { x: -1.0, y: 0.16, z: 0.14 },
    { x: -0.55, y: 0.16, z: 0.26 },
    { x: 0.3, y: 0.12, z: 0.4 },
  ].map((p) => seen(onJaw(p, open)));
  return { outline, lip };
}

/** A feature on the head: where it sits as seen, and how far its own face is turned to the eye. */
export interface Feature {
  readonly at: Seen3;
  readonly face: number;
}

function feature(at: Vec3, normal: Vec3): Feature {
  const len = Math.hypot(normal.x, normal.y, normal.z) || 1;
  return {
    at: seen(at),
    face: facing({ x: normal.x / len, y: normal.y / len, z: normal.z / len }),
  };
}

/** The eyes, far then near: set forward on the head, as a hunter's are. */
export const EYES: readonly [Feature, Feature] = [
  feature({ x: -0.02, y: -0.26, z: -0.4 }, { x: -0.7, y: -0.2, z: -0.7 }),
  feature({ x: -0.02, y: -0.26, z: 0.4 }, { x: -0.7, y: -0.2, z: 0.7 }),
];

/** The nostrils, far then near, on the nose, flared. */
export const NOSTRILS: readonly [Feature, Feature] = [
  feature({ x: -1.3, y: -0.04, z: -0.1 }, { x: -1, y: -0.3, z: -0.4 }),
  feature({ x: -1.3, y: -0.04, z: 0.1 }, { x: -1, y: -0.3, z: 0.4 }),
];

/** A horn off the back of the brow: base, bend and tip, swept back and up. */
export function hornSeen(s: -1 | 1): { base: Seen3; bend: Seen3; tip: Seen3 } {
  return {
    base: seen({ x: 0.36, y: -0.5, z: s * 0.4 }),
    bend: seen({ x: 0.95, y: -0.65, z: s * 0.55 }),
    tip: seen({ x: 1.55, y: -1.15, z: s * 0.65 }),
  };
}

/** The spines of the frill behind the jaw, near side: root and tip. */
export const FRILL: readonly { root: Seen3; bend: Seen3; tip: Seen3 }[] = [
  [0.6, -0.12, 0.45, -0.16],
  [0.64, 0.0, 0.42, -0.02],
].map(([x, y, tx, ty]) => ({
  root: seen({ x: x as number, y: y as number, z: 0.4 }),
  bend: seen({ x: (x as number) + (tx as number) * 0.6, y: y as number, z: 0.5 }),
  tip: seen({ x: (x as number) + (tx as number), y: (y as number) + (ty as number), z: 0.55 }),
}));
