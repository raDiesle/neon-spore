import {
  JELLY,
  type Bump,
  catmullRomToBezierPath,
  crystalRadiusMul,
  HULL,
  hullRadiusMul,
  METEOR,
  openSmoothPath,
  type Point,
  MANTA,
} from "@neon-spore/content";

/**
 * Every silhouette in the game, as a function of time.
 *
 * The shape sheet, the motion sheet and the metrics report all read this list,
 * so a shape is described once. Each subject samples its contour through the
 * *same* radius functions the canvas calls — `hullRadiusMul` for anything that
 * lives, `crystalRadiusMul` for the rock — which is the no-drift property the
 * sheet was built for, extended to the tools that measure rather than draw.
 */
export interface Subject {
  name: string;
  note: string;
  /** An open contour must not be filled — SVG would close it across the ends. */
  open: boolean;
  pointsAt(t: number): Point[];
  path(pts: Point[]): string;
}

/** Illustrative hull proportions. The game derives these from the tile size. */
const HULL_RX = 300;
const HULL_RY = 48;
const HULL_ARC = 0.42;
const HULL_STEPS = 120;

function cannonBumps(armed: boolean): Bump[] {
  const bumps: Bump[] = [{ angle: -Math.PI / 2, strength: 0.5, plateau: 0.014, shoulder: 0.026 }];
  if (armed) {
    bumps.push({ angle: -Math.PI / 2 + 0.16, strength: 0.34, plateau: 0.024, shoulder: 0.03 });
  }
  return bumps;
}

function blob(name: string, s: typeof MANTA): Subject {
  return {
    name,
    note: `${s.lobes} lobes · depth ${s.depth} · wobble ${s.wobble}`,
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

const meteor: Subject = {
  name: "METEOR",
  note: `${METEOR.sides} facets · dead rock`,
  open: false,
  pointsAt(t) {
    const pts: Point[] = [];
    for (let i = 0; i < METEOR.sides; i++) {
      const a = (i / METEOR.sides) * Math.PI * 2;
      const m = crystalRadiusMul(a, METEOR.sides, METEOR.depth, METEOR.wobble, t, METEOR.seed);
      pts.push({ x: Math.cos(a) * 46 * m, y: Math.sin(a) * 46 * m });
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

/**
 * The hull as the game draws it: one contour with a cannon lobe, and a shield
 * lobe that only exists while armed. Two subjects, so the difference between
 * passive and armed can be judged side by side — docs/spec/systems.md 5.8 says
 * that difference has to be unmissable, and it has to live in the *silhouette*.
 */
function hull(armed: boolean): Subject {
  const bumps = cannonBumps(armed);
  return {
    name: armed ? "HULL · ARMED" : "HULL · PASSIVE",
    note: armed ? "cannon lobe + shield lobe" : "cannon lobe only",
    open: true,
    pointsAt(t) {
      const pts: Point[] = [];
      for (let i = 0; i <= HULL_STEPS; i++) {
        const a = -Math.PI / 2 - HULL_ARC + 2 * HULL_ARC * (i / HULL_STEPS);
        const m = hullRadiusMul(a, HULL.lobes, HULL.depth, HULL.wobble, t, HULL.seed, bumps);
        pts.push({ x: Math.cos(a) * HULL_RX * m, y: HULL_RY + Math.sin(a) * HULL_RY * m });
      }
      return pts;
    },
    path: openSmoothPath,
  };
}

export const SUBJECTS: Subject[] = [
  blob("MANTA", MANTA),
  blob("JELLY", JELLY),
  meteor,
  hull(false),
  hull(true),
];
