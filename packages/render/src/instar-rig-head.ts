import {
  type Anchor,
  facet,
  hang,
  type Pin,
  pin,
  poseOf,
  type Ring,
  type Vec3,
} from "@neon-spore/content";
import { frontEyeAt, frontLipsAt } from "./instar-head.js";
import type { Figure } from "./instar-shape.js";
import type { Part } from "./solid-rig.js";
import type { Skin } from "./solid-tube-draw.js";

/**
 * **THE INSTAR's one head, modelled once** (`docs/spec/living-bosses.md` §2):
 * the face-on head built on the rig from its own parts, so the side view is
 * the same head turned rather than a second animal. A VERSUS candidate; the
 * two shipped drawings (`instar-head.ts`, `instar-side-head.ts`) stay.
 *
 * Authored side-on in head radii, snout to `-x`, the origin at the middle of
 * the mouth as the face-on head has it, and scaled to pixels at the end.
 * Face-on, orthographic, the screen is `(z, y)`, so a part's depth never
 * moves where it lands there — which is what lets the head meet the shipped
 * face-on marks exactly while having any depth it likes:
 *
 * - **The upper head only translates**, to `frontLipsAt(...).up`. A skull
 *   that pitched would change the eye-to-lip distance face-on, which the
 *   shipped head holds whatever the jaw. Its frame's origin is the upper lip.
 * - **The eyes are pinned** on the skull at the latitude and longitude that
 *   put them on `frontEyeAt` face-on, solved rather than copied.
 * - **The jaw is two mandibles on one hinge**, pitched open, the hinge's
 *   height solved so the jaw's top, face-on at the middle, is on
 *   `frontLipsAt(...).down`. Wide open the gape is more than the jaw's length
 *   can swing, so the hinge translates too, and a dark cheek between the
 *   skull and the jaw hides the gap at the side.
 */

/** The skull, in the upper head's frame: centre and radius, head radii. */
export const SKULL = { x: 0.45, y: -0.36, r: 0.68 } as const;
/** The muzzle: its back and front along `x`, and the radius at each. */
const MUZZLE = { back: 0.3, front: -0.75, rBack: 0.33, rFront: 0.25 } as const;
/** The jaw's hinge along `x`, and the mandibles in its frame: hinge end to chin. */
const HINGE_X = 0.75;
const JAW = { back: 0.1, front: -1.3, zBack: 0.5, zFront: 0.12, rBack: 0.24, rFront: 0.18 };
/**
 * How far the jaw pitches open at the widest, radians: about the profile's
 * own gape (`instar-side-head.ts`). Face-on the pitch barely shows — the
 * hinge's height puts the lip — so it is side-on that sets it.
 */
const JAW_OPEN = 0.45;
const RINGS = 6;

export const HIDE: Skin = { base: "#2A1B4A", lift: "#C05CFF", sheen: "#F3DEFF" };
const BONE: Skin = { base: "#3C3F49", lift: "#C7CBD6", sheen: "#FFFFFF" };
/** The inside of the mouth: dark flesh, warmed by the fire. */
const MAW: Skin = { base: "#1E0A1C", lift: "#6A1E34", sheen: "#FF7A2F" };

/** What the model is posed by: the two jaws. */
export type HeadPose = Pick<Figure, "jawUp" | "jawDown">;

/** The rings of a tube from `a` to `b` through `c`, radius `ra` to `rb`, in pixels. */
function curve(a: Vec3, c: Vec3, b: Vec3, ra: number, rb: number, r: number, n = RINGS): Ring[] {
  const rings: Ring[] = [];
  for (let i = 0; i < n; i++) {
    const u = i / (n - 1);
    const q = (k: "x" | "y" | "z") => (1 - u) ** 2 * a[k] + 2 * u * (1 - u) * c[k] + u ** 2 * b[k];
    rings.push({ c: { x: q("x") * r, y: q("y") * r, z: q("z") * r }, r: (ra + (rb - ra) * u) * r });
  }
  return rings;
}

const line = (a: Vec3, b: Vec3, ra: number, rb: number, r: number, n = RINGS) =>
  curve(a, { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2, z: (a.z + b.z) / 2 }, b, ra, rb, r, n);

/**
 * A point on the skull `lon` round from the snout and `lat` down, `lift` radii
 * proud of it: the pinned feature face-on (`facet` at no turn), whose across
 * is the model's `z`, and whose depth toward the snout is `k·cos α`.
 */
export function onSkull(lon: number, lat: number, lift = 0): Vec3 {
  const p = pin(lon, lat, SKULL.r * (1 + lift));
  const face = facet(p, 0);
  return { x: SKULL.x - p.k * face.sx, y: SKULL.y + face.y, z: face.x };
}

/** Where an eye is pinned on the skull, solved from where the face-on head draws it. */
export function eyePin(s: -1 | 1): { lon: number; lat: number; pin: Pin } {
  const origin = { x: 0, y: 0 };
  const up = frontLipsAt({ jawUp: 0, jawDown: 0 }, origin, 1).up;
  const eye = frontEyeAt({ jawUp: 0 }, origin, 1, s);
  const lat = Math.asin((eye.y - up.y - SKULL.y) / SKULL.r);
  const lon = Math.asin(eye.x / (SKULL.r * Math.cos(lat)));
  return { lon, lat, pin: pin(lon, lat, SKULL.r) };
}

/** The mandibles, in the jaw's frame, in pixels. */
function mandible(s: -1 | 1, r: number): Ring[] {
  const a = { x: JAW.back, y: 0, z: s * JAW.zBack };
  const b = { x: JAW.front, y: 0, z: s * JAW.zFront };
  return line(a, b, JAW.rBack, JAW.rFront, r, 8);
}

/**
 * The jaw's hinge for this pose: pitched open by both jaws, as the profile
 * opens, and as high as
 * puts the mandibles' top, face-on at the middle, on the lower lip. The top
 * there is the highest point of the discs the rings project to (`tubePath`
 * outlines a tube by them), sampled along the jaw.
 *
 * `drop` is how much of that the hinge takes: 1 face-on, where the lip is
 * what a thumb is on, and 0 side-on, where a hinge that slid down would read
 * as the jaw coming off — there it stays where the shut jaw has it on the
 * skull and only pitches. `drawRigHead` passes the sine of the yaw.
 */
export function jawAnchor(f: HeadPose, r: number, drop = 1): Anchor {
  const pitch = (-JAW_OPEN * (f.jawUp + f.jawDown)) / 2;
  const y = hingeY(f, r, pitch);
  // Where the shut jaw's hinge is on the skull, carried with it as the upper lip rises.
  const shut = { jawUp: 0, jawDown: 0 };
  const rest = hingeY(shut, r, 0) + upperAnchor(f, r).at.y - upperAnchor(shut, r).at.y;
  return { at: { x: HINGE_X * r, y: rest + drop * (y - rest), z: 0 }, pitch };
}

/** The hinge's height that puts the jaw's top on the lower lip at `pitch`. */
function hingeY(f: HeadPose, r: number, pitch: number): number {
  const level = poseOf({ at: { x: HINGE_X * r, y: 0, z: 0 }, pitch });
  const rings = mandible(1, r).map((g) => ({ c: hang(level, g.c), r: g.r }));
  let top = Number.POSITIVE_INFINITY;
  for (let i = 0; i < rings.length - 1; i++)
    for (let k = 0; k <= 8; k++) {
      const u = k / 8;
      const a = rings[i] as Ring;
      const b = rings[i + 1] as Ring;
      const z = a.c.z + (b.c.z - a.c.z) * u;
      const rr = a.r + (b.r - a.r) * u;
      if (Math.abs(z) < rr)
        top = Math.min(top, a.c.y + (b.c.y - a.c.y) * u - Math.sqrt(rr * rr - z * z));
    }
  return frontLipsAt(f, { x: 0, y: 0 }, r).down.y - top;
}

/** The upper head's frame: the upper lip, translated and never turned. */
export function upperAnchor(f: HeadPose, r: number): Anchor {
  return { at: { x: 0, y: frontLipsAt(f, { x: 0, y: 0 }, r).up.y, z: 0 } };
}

const px = (p: Vec3, r: number): Vec3 => ({ x: p.x * r, y: p.y * r, z: p.z * r });

/** A horn off the skull's top side, base to tip through its bend, swept back and up. */
const HORNS = [
  {
    base: { x: 0.2, y: -0.6, z: 0.6 },
    bend: { x: 0.8, y: -0.85, z: 1.05 },
    tip: { x: 1.6, y: -1.42, z: 1.22 },
    w: 0.12,
  },
  {
    base: { x: 0.4, y: -0.36, z: 0.7 },
    bend: { x: 0.8, y: -0.45, z: 1.2 },
    tip: { x: 1.3, y: -0.78, z: 1.36 },
    w: 0.075,
  },
] as const;

/** A brow: a sheet pinned on the skull over an eye, standing proud of it. */
function brow(s: -1 | 1): Vec3[] {
  const { lon, lat } = eyePin(s);
  return (
    [
      [-0.42, -0.2],
      [-0.05, -0.36],
      [0.4, -0.3],
      [0.36, -0.18],
      [0, -0.24],
    ] as const
  ).map(([dl, dt]) => onSkull(lon + s * dl, lat + dt, 0.06));
}

/**
 * The head's parts for this pose, in pixels about the middle of the mouth,
 * the jaw's hinge dropped by `drop` (`jawAnchor`), without its marks (`instar-rig-head-draw.ts` adds the eyes, the nostrils
 * and the fire).
 */
export function headParts(f: HeadPose, r: number, drop = 1): Part[] {
  const upper = upperAnchor(f, r);
  const jaw = jawAnchor(f, r, drop);
  const upLen = (0.1 + 0.08 * f.jawUp) * 1.9;
  const downLen = (0.08 + 0.07 * f.jawDown) * 1.9;
  const muzzle = line(
    { x: MUZZLE.back, y: -MUZZLE.rBack, z: 0 },
    { x: MUZZLE.front, y: -MUZZLE.rFront, z: 0 },
    MUZZLE.rBack,
    MUZZLE.rFront,
    r,
    5,
  );
  // The cheek: from under the skull's back to the top of the jaw, in the middle plane.
  const upperPose = poseOf(upper);
  const jawPose = poseOf(jaw);
  const cheek = [
    hang(upperPose, px({ x: 0.1, y: 0.2, z: 0 }, r)),
    hang(upperPose, px({ x: 1.1, y: -0.2, z: 0 }, r)),
    hang(jawPose, px({ x: 0.25, y: 0, z: 0 }, r)),
    hang(jawPose, px({ x: -0.7, y: -0.05, z: 0 }, r)),
  ];
  const parts: Part[] = [{ kind: "sheet", points: cheek, skin: MAW }];
  for (const s of [-1, 1] as const)
    for (const h of HORNS) {
      const z = (p: Vec3) => ({ ...p, z: s * p.z });
      const rings = curve(z(h.base), z(h.bend), z(h.tip), h.w, h.w * 0.15, r);
      parts.push({ kind: "tube", rings, skin: BONE, anchor: upper });
    }
  parts.push({
    kind: "ball",
    c: px({ x: SKULL.x, y: SKULL.y, z: 0 }, r),
    r: SKULL.r * r,
    skin: HIDE,
    anchor: upper,
  });
  for (const s of [-1, 1] as const)
    parts.push({ kind: "sheet", points: brow(s).map((p) => px(p, r)), skin: HIDE, anchor: upper });
  parts.push({ kind: "tube", rings: muzzle, skin: HIDE, anchor: upper });
  for (const s of [-1, 1] as const) {
    const at = { x: -0.6, y: -0.03, z: s * 0.18 };
    const rings = line(at, { ...at, x: -0.62, y: upLen }, 0.05, 0.012, r, 3);
    parts.push({ kind: "tube", rings, skin: BONE, anchor: upper });
  }
  for (const s of [-1, 1] as const)
    parts.push({ kind: "tube", rings: mandible(s, r), skin: HIDE, anchor: jaw });
  for (const s of [-1, 1] as const) {
    const at = { x: -1.08, y: -0.15, z: s * 0.17 };
    const rings = line(at, { ...at, x: -1.1, y: -0.15 - downLen }, 0.045, 0.01, r, 3);
    parts.push({ kind: "tube", rings, skin: BONE, anchor: jaw });
  }
  return parts;
}
