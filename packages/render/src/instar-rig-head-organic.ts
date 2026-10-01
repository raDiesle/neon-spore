import { hang, poseOf, type Ring } from "@neon-spore/content";
import {
  BONE,
  type HeadPose,
  HIDE,
  type JawHinge,
  jawAnchor,
  MAW,
  px,
  upperAnchor,
} from "./instar-rig-head.js";
import type { RigHeadShape } from "./instar-rig-head-draw.js";
import type { Part } from "./solid-rig.js";

/**
 * **THE INSTAR's head as one living skull** — the owner, 1 October 2026: the
 * side-on rig head, a ball with a tube for a muzzle and two for a jaw, *looks
 * very geometrical … not natural shape of a living head*. A VERSUS candidate
 * (`tools/versus/candidates/instar-head/`); the face-on head stays the
 * shipped one.
 *
 * The head here is two long tubes, not five primitives: **the upper head**,
 * occiput to cranium to brow to bridge to the tip of the snout, one spline of
 * rings, its belly running along the upper lip; and **the jaw** under it on
 * its own hinge, deep at the jowl and tapering to a chin under the snout,
 * its top flat on the lower lip. Horns, brow ridges and cheeks are lobes
 * mirrored either side. The frames, the eyes, the hinge's solve and the
 * marks are `instar-rig-head.ts`'s, so the head opens and turns as the rig's
 * does and its eyes sit where a thumb is on them.
 */

/** A knot of a spline: along, down and across in head radii, and the ring's radius there. */
export type Knot = readonly [x: number, y: number, z: number, r: number];

/** A part off one of the two frames, mirrored either side when `mirror`. */
export interface Lobe {
  readonly on: "upper" | "jaw";
  readonly skin: "hide" | "bone";
  readonly knots: readonly Knot[];
  readonly mirror?: boolean;
}

/** A tooth: where its root is, across from the middle, in its frame, and how long it is shut. */
export interface Tooth {
  readonly on: "upper" | "jaw";
  readonly at: readonly [x: number, y: number, z: number];
  readonly len: number;
  readonly w: number;
}

export interface HeadSpec {
  /** The upper head's midline, occiput to snout, in the upper lip's frame. */
  readonly upper: readonly Knot[];
  /** The jaw's midline, hinge end to chin, in the hinge's frame: a ring's top at `y = 0` is on the lip. */
  readonly jaw: readonly Knot[];
  /** The hinge along `x`, and how far the jaw pitches open at the widest, radians. */
  readonly hinge: { readonly x: number; readonly open: number };
  readonly lobes: readonly Lobe[];
  readonly teeth: readonly Tooth[];
  /** The nostrils on the snout's tip: along, down and across. */
  readonly nostril: { readonly x: number; readonly y: number; readonly z: number };
  /** The cheek between the frames, in head radii: two points under the skull, two on the jaw. */
  readonly cheek: readonly [
    upper: readonly [number, number, number, number],
    jaw: readonly [number, number, number, number],
  ];
}

/** Rings along a Catmull-Rom spline through `k`, `n` of them, in pixels. */
export function spline(k: readonly Knot[], n: number, r: number, side = 1): Ring[] {
  const last = k.length - 1;
  const rings: Ring[] = [];
  for (let i = 0; i < n; i++) {
    const s = Math.min(last - 1e-6, (i / (n - 1)) * last);
    const j = Math.floor(s);
    const t = s - j;
    const at = (q: number) => k[Math.max(0, Math.min(last, q))] as Knot;
    const [p0, p1, p2, p3] = [at(j - 1), at(j), at(j + 1), at(j + 2)];
    const c = (m: 0 | 1 | 2 | 3) =>
      0.5 *
      (2 * p1[m] +
        (-p0[m] + p2[m]) * t +
        (2 * p0[m] - 5 * p1[m] + 4 * p2[m] - p3[m]) * t * t +
        (-p0[m] + 3 * p1[m] - 3 * p2[m] + p3[m]) * t * t * t);
    rings.push({
      c: { x: c(0) * r, y: c(1) * r, z: side * c(2) * r },
      r: Math.max(0.01, c(3)) * r,
    });
  }
  return rings;
}

/** Rings to a tube: enough that the discs' union reads as one smooth skin. */
const RINGS = 16;

function hingeOf(spec: HeadSpec): JawHinge {
  return { ...spec.hinge, rings: (r) => spline(spec.jaw, RINGS, r) };
}

/** The parts of a head built from `spec`, as `headParts` gives the rig's. */
export function organicParts(spec: HeadSpec, f: HeadPose, r: number, drop: number): Part[] {
  const upper = upperAnchor(f, r);
  const jaw = jawAnchor(f, r, drop, hingeOf(spec));
  const frame = (on: "upper" | "jaw") => (on === "upper" ? upper : jaw);
  const skin = (s: "hide" | "bone") => (s === "hide" ? HIDE : BONE);
  const [[ux0, uy0, ux1, uy1], [jx0, jy0, jx1, jy1]] = spec.cheek;
  const up = poseOf(upper);
  const down = poseOf(jaw);
  const cheek = [
    hang(up, px({ x: ux0, y: uy0, z: 0 }, r)),
    hang(up, px({ x: ux1, y: uy1, z: 0 }, r)),
    hang(down, px({ x: jx0, y: jy0, z: 0 }, r)),
    hang(down, px({ x: jx1, y: jy1, z: 0 }, r)),
  ];
  const parts: Part[] = [{ kind: "sheet", points: cheek, skin: MAW }];
  const lobes = (on: "upper" | "jaw") => {
    for (const l of spec.lobes)
      if (l.on === on)
        for (const s of l.mirror ? ([-1, 1] as const) : ([1] as const))
          parts.push({
            kind: "tube",
            rings: spline(l.knots, 8, r, s),
            skin: skin(l.skin),
            anchor: frame(on),
          });
  };
  const teeth = (on: "upper" | "jaw") => {
    const open = on === "upper" ? 1 + 0.8 * f.jawUp : 1 + 0.9 * f.jawDown;
    const dir = on === "upper" ? 1 : -1;
    for (const t of spec.teeth)
      if (t.on === on)
        for (const s of [-1, 1] as const) {
          const [x, y, z] = t.at;
          const tip: Knot = [x - t.len * 0.15, y + dir * t.len * open, s * z, t.w * 0.2];
          const rings = spline([[x, y, s * z, t.w], tip], 3, r);
          parts.push({ kind: "tube", rings, skin: BONE, anchor: frame(on) });
        }
  };
  // The jaw first, so the upper head's lip is drawn over it where they tie.
  lobes("jaw");
  parts.push({ kind: "tube", rings: spline(spec.jaw, RINGS, r), skin: HIDE, anchor: jaw });
  teeth("jaw");
  teeth("upper");
  parts.push({ kind: "tube", rings: spline(spec.upper, RINGS, r), skin: HIDE, anchor: upper });
  lobes("upper");
  return parts;
}

/** A rig head shape for `drawRigHead` from `spec`. */
export function organicHead(spec: HeadSpec): RigHeadShape {
  return { parts: (f, r, drop) => organicParts(spec, f, r, drop), nostril: spec.nostril };
}
