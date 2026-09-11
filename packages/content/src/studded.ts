import type { Point } from "./shapes.js";
import { blobRadiusMul } from "./shapes.js";

/**
 * A body whose whole rim is broken by the same feature repeated: knobs, spines
 * or hairs — the contour alone.
 *
 * Moved here from `tools/shape-sheet/src/forms/studded.ts` when the game
 * itself needed it: the rind wears this rim (`render/rind-burr.ts`, adopted
 * from VERSUS on 11 September 2026), and a package cannot import a tool. The
 * shape sheet's `studded` is now a subject wrapped round this, so the card
 * and the creature are one arithmetic — the same move `metaball.ts` made for
 * the trace, and `body-path.ts` for the clubbed rim. The reasoning behind
 * each number — why `width` and `blunt` are separate, why blunting is a root
 * and not a clamp, why no setting gives a neck — stays in the sheet's file,
 * which is where a reader choosing a form goes.
 */
export interface StuddedOpts {
  rx: number;
  ry: number;
  /** How many features stand round the rim. */
  studs: number;
  /** How far one reaches past the body, as a fraction of the radius. */
  reach: number;
  /** 0 a needle standing off the body, 1 a scallop filling the whole gap. */
  width: number;
  /** 0 comes to a point, 1 rounds the tip over. Never a neck — see `clubbed`. */
  blunt: number;
  /** Squareness of the body underneath: 2 is an ellipse, higher a capsule. */
  boxy?: number;
  /** Lobing of the body, before anything is added to the rim. */
  lobes?: number;
  depth?: number;
  seed?: number;
  /** A cluster of longer features, centred at `at` radians and `spread` wide. */
  crown?: { reach: number; at: number; spread: number };
}

/** Enough samples that a needle is a needle rather than a dent. */
const N = 224;

/** The closer of two angles, as an unsigned distance round the circle. */
function apart(a: number, b: number): number {
  const d = Math.abs(((a - b) % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
  return d > Math.PI ? Math.PI * 2 - d : d;
}

/** The rim at a moment `t`, in seconds, centred on the origin. */
export function studdedContour(o: StuddedOpts): (t: number) => Point[] {
  const step = (Math.PI * 2) / o.studs;
  const power = 2 + 18 * (1 - o.width);
  // Blunting is a root taken of the profile, not a gain with a clamp on it:
  // a clamp flattens every tip into a straight edge and a body wearing clubs
  // comes out wearing cogs. A root saturates instead, and nothing in the
  // outline is ever flat.
  const round = 1 / (1 + 3 * o.blunt);
  const seed = o.seed ?? 5.1;
  const boxy = o.boxy ?? 2;
  return (t) => {
    const pts: Point[] = [];
    for (let i = 0; i < N; i++) {
      const a = (i / N) * Math.PI * 2;
      const k = Math.round(a / step) % o.studs;
      const axis = k * step;
      const off = (a - axis) / (step / 2);
      const stud = (Math.max(0, Math.cos((off * Math.PI) / 2)) ** power) ** round;
      // Each feature breathes on its own slightly longer period, so the rim
      // is never a ring that pulses together — that reads as a heartbeat,
      // which says alive and says nothing about what the body is.
      const own = 5 + (k % 5) * 0.6;
      const breath = 0.82 + 0.18 * Math.sin((t / own) * Math.PI * 2 + k * 1.3);
      let reach = o.reach;
      if (o.crown && apart(axis, o.crown.at) <= o.crown.spread) reach = o.crown.reach;
      const c = Math.cos(a);
      const s = Math.sin(a);
      // Superellipse in polar form, exactly as `slab` writes it: at boxy 2
      // this is 1 and the body is the ellipse `rx` by `ry`.
      const box = (Math.abs(c) ** boxy + Math.abs(s) ** boxy) ** (-1 / boxy);
      const m =
        blobRadiusMul(a, o.lobes ?? 3, o.depth ?? 0.05, 0.025, t, seed) *
        box *
        (1 + reach * breath * stud);
      pts.push({ x: c * o.rx * m, y: s * o.ry * m });
    }
    return pts;
  };
}
