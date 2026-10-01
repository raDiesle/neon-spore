import { type HeadSpec, organicHead } from "./instar-rig-head-organic.js";

/**
 * **Three living heads for THE INSTAR side-on**, offered in VERSUS against the
 * rig's ball-and-tubes (`tools/versus/candidates/instar-head/`). Each is one
 * skull and one jaw (`instar-rig-head-organic.ts`), knots in head radii in
 * the upper lip's frame, snout to `-x`, down `+y`. Every upper head is half a
 * radius thick at `x = 0`, centred `0.36` up, so the eye pinned there for the
 * face-on head sits on its skin.
 */

/** A long head: a small brow clear of the horn roots, a nose bridge that falls to a narrow snout,
 * a jaw that ends under it and opens a little, and swept horns. */
export const DRAKE: HeadSpec = {
  upper: [
    [1.0, -0.42, 0, 0.36],
    [0.55, -0.5, 0, 0.5],
    [0, -0.38, 0, 0.5],
    [-0.5, -0.24, 0, 0.3],
    [-0.9, -0.17, 0, 0.19],
    [-1.18, -0.12, 0, 0.12],
  ],
  jaw: [
    [0.42, 0.18, 0, 0.18],
    [0.05, 0.24, 0, 0.24],
    [-0.45, 0.18, 0, 0.17],
    [-0.85, 0.12, 0, 0.12],
    [-1.12, 0.08, 0, 0.08],
  ],
  hinge: { x: 0.7, open: 0.2 },
  lobes: [
    {
      on: "upper",
      skin: "bone",
      mirror: true,
      knots: [
        [0.45, -0.82, 0.3, 0.12],
        [1.0, -1.05, 0.45, 0.08],
        [1.65, -1.18, 0.55, 0.015],
      ],
    },
    {
      on: "upper",
      skin: "bone",
      mirror: true,
      knots: [
        [0.85, -0.6, 0.35, 0.08],
        [1.3, -0.72, 0.5, 0.05],
        [1.75, -0.66, 0.55, 0.012],
      ],
    },
    {
      on: "upper",
      skin: "hide",
      mirror: true,
      knots: [
        [0.02, -0.66, 0.28, 0.06],
        [-0.2, -0.62, 0.3, 0.07],
        [-0.4, -0.5, 0.22, 0.04],
      ],
    },
  ],
  teeth: [
    { on: "upper", at: [-0.78, -0.02, 0.13], len: 0.2, w: 0.05 },
    { on: "upper", at: [-0.45, -0.02, 0.2], len: 0.12, w: 0.04 },
    { on: "jaw", at: [-0.95, 0, 0.09], len: 0.1, w: 0.035 },
  ],
  nostril: { x: -1.22, y: -0.17, z: 0.07 },
  cheek: [
    [0.1, 0.15, 1.0, -0.1],
    [0.3, 0, -0.7, 0],
  ],
};

/** A short, deep head: a domed skull, a blunt muzzle, a heavy jaw with tusks, ram's horns curled back. */
export const HOUND: HeadSpec = {
  upper: [
    [0.95, -0.45, 0, 0.4],
    [0.5, -0.58, 0, 0.58],
    [0, -0.4, 0, 0.52],
    [-0.4, -0.26, 0, 0.33],
    [-0.72, -0.21, 0, 0.23],
    [-0.88, -0.19, 0, 0.18],
  ],
  jaw: [
    [0.4, 0.24, 0, 0.24],
    [0.05, 0.36, 0, 0.36],
    [-0.45, 0.3, 0, 0.3],
    [-0.95, 0.23, 0, 0.23],
    [-1.32, 0.19, 0, 0.19],
    [-1.48, 0.16, 0, 0.16],
  ],
  hinge: { x: 0.65, open: 0.42 },
  lobes: [
    {
      on: "upper",
      skin: "bone",
      mirror: true,
      knots: [
        [0.4, -0.78, 0.4, 0.15],
        [0.95, -1.0, 0.6, 0.13],
        [1.3, -0.6, 0.7, 0.1],
        [1.05, -0.22, 0.72, 0.06],
        [0.75, -0.36, 0.7, 0.02],
      ],
    },
    {
      on: "upper",
      skin: "hide",
      mirror: true,
      knots: [
        [0.25, -0.82, 0.28, 0.14],
        [-0.1, -0.78, 0.3, 0.13],
        [-0.3, -0.6, 0.24, 0.08],
      ],
    },
  ],
  teeth: [
    { on: "upper", at: [-0.6, -0.02, 0.18], len: 0.12, w: 0.045 },
    { on: "jaw", at: [-1.15, 0, 0.2], len: 0.3, w: 0.075 },
  ],
  nostril: { x: -0.98, y: -0.24, z: 0.1 },
  cheek: [
    [0.1, 0.2, 1.0, -0.1],
    [0.3, 0, -0.6, 0],
  ],
};

/** A flat wedge: a low skull, wide jowls behind the eyes, a pointed snout, long fangs and a crest of spikes. */
export const VIPER: HeadSpec = {
  upper: [
    [0.95, -0.32, 0, 0.32],
    [0.5, -0.4, 0, 0.45],
    [0, -0.34, 0, 0.5],
    [-0.45, -0.2, 0, 0.3],
    [-0.8, -0.1, 0, 0.14],
    [-0.98, -0.06, 0, 0.05],
  ],
  jaw: [
    [0.4, 0.16, 0, 0.16],
    [0.05, 0.24, 0, 0.24],
    [-0.5, 0.19, 0, 0.19],
    [-1.05, 0.13, 0, 0.13],
    [-1.45, 0.09, 0, 0.09],
    [-1.62, 0.07, 0, 0.07],
  ],
  hinge: { x: 0.7, open: 0.5 },
  lobes: [
    {
      on: "upper",
      skin: "hide",
      mirror: true,
      knots: [
        [0.75, -0.3, 0.22, 0.26],
        [0.35, -0.26, 0.3, 0.24],
        [-0.05, -0.2, 0.22, 0.16],
      ],
    },
    {
      on: "upper",
      skin: "bone",
      knots: [
        [0.55, -0.82, 0, 0.09],
        [0.95, -1.15, 0, 0.012],
      ],
    },
    {
      on: "upper",
      skin: "bone",
      knots: [
        [0.9, -0.66, 0, 0.08],
        [1.3, -0.9, 0, 0.012],
      ],
    },
    {
      on: "upper",
      skin: "bone",
      mirror: true,
      knots: [
        [1.0, -0.15, 0.5, 0.08],
        [1.45, -0.05, 0.85, 0.012],
      ],
    },
  ],
  teeth: [{ on: "upper", at: [-0.62, -0.02, 0.12], len: 0.3, w: 0.045 }],
  nostril: { x: -0.98, y: -0.1, z: 0.05 },
  cheek: [
    [0.1, 0.15, 1.0, -0.1],
    [0.3, 0, -0.7, 0],
  ],
};

export const DRAKE_HEAD = organicHead(DRAKE);
export const HOUND_HEAD = organicHead(HOUND);
export const VIPER_HEAD = organicHead(VIPER);
