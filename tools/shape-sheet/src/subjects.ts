import {
  BULB,
  type Bump,
  type CreatureSilhouette,
  type CrystalSilhouette,
  catmullRomToBezierPath,
  crystalRadiusMul,
  HULL,
  hullPointAtX,
  hullRadiusMul,
  MAW,
  METEOR,
  openSmoothPath,
  POD,
  type Point,
  QUEEN_SHELL,
  SLICK,
  TORCH,
} from "@neon-spore/content";
import type { Subject } from "./contour.js";

/**
 * Every silhouette in the game, as a function of time.
 *
 * The shape sheet, the motion sheet and the metrics report all read this list,
 * so a shape is described once. Each subject samples its contour through the
 * *same* radius functions the canvas calls — `hullRadiusMul` for anything that
 * lives, `crystalRadiusMul` for the rock — which is the no-drift property the
 * sheet was built for, extended to the tools that measure rather than draw.
 *
 * `Subject` itself lives in `contour.ts`, beside the one function that knows
 * how its optional pieces — a hole, several loops — go together into an
 * outline.
 */

/** Illustrative hull proportions. The game derives these from the tile size. */
const HULL_RX = 300;
const HULL_RY = 48;
const HULL_ARC = 0.42;
const HULL_STEPS = 120;

/**
 * Cannon lobe plus the shield body.
 *
 * The shield is never absent: at rest it is a passive swelling player 2 can
 * aim, and holding it open swells it the rest of the way. And it is a chain of
 * four bumps rather than one, so `spread` — the lag between head and tail while
 * it travels, in radians — is what the third hull cell shows.
 */
const SHIELD_WEIGHT = [0.46, 0.28, 0.17, 0.09];
const SHIELD_PASSIVE = 0.42;

function hullBumps(armed: boolean, spread = 0, intake = 0): Bump[] {
  // The cannon lobe, and the same lobe inverted: `intake` 1 is the maw, which
  // is a dent of its own depth rather than a swelling — see `MAW`.
  const cannonScale = 1 + (MAW.scale - 1) * intake;
  const cannonHalf = 1 + (MAW.halfMul - 1) * intake;
  const bumps: Bump[] = [
    {
      angle: -Math.PI / 2,
      strength: 0.5 * cannonScale,
      plateau: 0.014 * cannonHalf,
      shoulder: 0.026 * cannonHalf,
    },
  ];
  const scale = SHIELD_PASSIVE + (1 - SHIELD_PASSIVE) * (armed ? 1 : 0);
  for (let i = 0; i < SHIELD_WEIGHT.length; i++) {
    bumps.push({
      angle: -Math.PI / 2 + 0.16 + i * spread,
      strength: 0.34 * scale * SHIELD_WEIGHT[i]!,
      plateau: 0.024,
      shoulder: 0.03,
    });
  }
  return bumps;
}

/**
 * A lobed body. The note defaults to the figures, which is what a shape being
 * measured wants; a draft passes its own, because "3 lobes · depth 0.24" says
 * nothing about why the shape was drawn that way.
 */
export function blob(name: string, s: CreatureSilhouette, note?: string): Subject {
  return {
    name,
    note: note ?? `${s.lobes} lobes · depth ${s.depth} · wobble ${s.wobble}`,
    open: false,
    pointsAt(t) {
      const pts: Point[] = [];
      const N = 40;
      for (let i = 0; i < N; i++) {
        const a = (i / N) * Math.PI * 2;
        const m = hullRadiusMul(a, s.lobes, s.depth, s.wobble, t, s.seed);
        pts.push({ x: Math.cos(a) * s.rx * m, y: Math.sin(a) * s.ry * m });
      }
      return pts;
    },
    path: catmullRomToBezierPath,
  };
}

export function crystal(name: string, s: CrystalSilhouette, radius: number, note: string): Subject {
  return {
    name,
    note,
    open: false,
    pointsAt(t) {
      const pts: Point[] = [];
      for (let i = 0; i < s.sides; i++) {
        const a = (i / s.sides) * Math.PI * 2;
        const m = crystalRadiusMul(a, s.sides, s.depth, s.wobble, t, s.seed);
        pts.push({ x: Math.cos(a) * radius * m, y: Math.sin(a) * radius * m });
      }
      return pts;
    },
    path(pts) {
      const head = `M ${pts[0]!.x.toFixed(2)} ${pts[0]!.y.toFixed(2)} `;
      return `${
        head +
        pts
          .slice(1)
          .map((p) => `L ${p.x.toFixed(2)} ${p.y.toFixed(2)} `)
          .join("")
      }Z`;
    },
  };
}

const meteor = crystal("METEOR", METEOR, 46, `${METEOR.sides} facets · dead rock`);
const torch = crystal("TORCH", TORCH, 70, `${TORCH.sides} facets · three tiles wide, burning`);

/**
 * The hull as the game draws it: one contour with a cannon lobe and a shield
 * body. Three subjects, so the difference between passive and armed can be
 * judged side by side — docs/spec/systems.md 5.8 says that difference has to be
 * unmissable, and it has to live in the *silhouette* — and so that the shield
 * in motion, strung out behind its head, can be judged as a shape rather than
 * only as a movement.
 */
function hull(armed: boolean, spread = 0, intake = 0): Subject {
  const bumps = hullBumps(armed, spread, intake);
  const name =
    intake > 0
      ? "HULL · MAW"
      : spread > 0
        ? "HULL · MOVING"
        : armed
          ? "HULL · ARMED"
          : "HULL · PASSIVE";
  return {
    name,
    note:
      intake > 0
        ? "the cannon lobe turned inside out"
        : spread > 0
          ? "the body strung out behind its head"
          : armed
            ? "shield held open"
            : "shield passive, still aimable",
    open: true,
    pointsAt(t) {
      const pts: Point[] = [];
      for (let i = 0; i <= HULL_STEPS; i++) {
        // Through `hullPointAtX`, not a second copy of the formula: the hull is
        // a height field over x and the lobes lift vertically, so the sheet has
        // to sample it the same way or it judges a shape the game never draws.
        const x = (-HULL_ARC + (2 * HULL_ARC * i) / HULL_STEPS) * HULL_RX;
        pts.push(
          hullPointAtX(
            x,
            0,
            HULL_RY,
            HULL_RX,
            HULL_RY,
            HULL.lobes,
            HULL.depth,
            HULL.wobble,
            t,
            HULL.seed,
            bumps,
          ),
        );
      }
      return pts;
    },
    path: openSmoothPath,
  };
}

/**
 * A window of the passive hull's own contour, for judging a treatment that
 * lies *along* the hull rather than deforming it — the rim thickening the
 * style guide drew and the game did not take. Sampled through the same
 * `hullPointAtX` the full hull uses, over a narrower span of x.
 */
export function hullArc(name: string, note: string, halfArc: number): Subject {
  // No bumps: this is the membrane itself, away from the cannon and the
  // shield. With the cannon lobe in the window the card showed a spike, which
  // is the one thing a treatment lying *along* the hull is not.
  const bumps: Bump[] = [];
  return {
    name,
    note,
    open: true,
    pointsAt(t) {
      const pts: Point[] = [];
      for (let i = 0; i <= HULL_STEPS; i++) {
        const x = (-halfArc + (2 * halfArc * i) / HULL_STEPS) * HULL_RX;
        pts.push(
          hullPointAtX(
            x,
            0,
            HULL_RY,
            HULL_RX,
            HULL_RY,
            HULL.lobes,
            HULL.depth,
            HULL.wobble,
            t,
            HULL.seed,
            bumps,
          ),
        );
      }
      return pts;
    },
    path: openSmoothPath,
  };
}

export const SUBJECTS: Subject[] = [
  blob("SLICK", SLICK),
  blob("BULB", BULB),
  blob("POD", POD),
  meteor,
  torch,
  crystal("BULB QUEEN", QUEEN_SHELL, 100, `${QUEEN_SHELL.sides} facets · armoured shell`),
  hull(false),
  hull(true),
  hull(true, 0.05),
  hull(false, 0, 1),
];
