import { blobRadiusMul, catmullRomToBezierPath, type Point } from "@neon-spore/content";
import type { Subject } from "../contour.js";

/**
 * A body whose whole rim is broken by the same feature repeated: knobs, spines
 * or hairs.
 *
 * Drawn to convert what other games put on a falling enemy. Almost every one
 * of them lands on the same picture — a plain body wearing a fringe — and the
 * fringe is doing the work our lobes do: it is how you tell one kind from
 * another at the size a phone actually draws them. `bloom` in `radial.ts` is
 * the nearest thing we had and is a different claim: a few long arms, each
 * running its own clock, so the silhouette *is* a set of readings. This is the
 * opposite — many short features, all alike, saying one word about the whole
 * body rather than several about its parts.
 *
 * One function rather than three, because the difference between a knob, a
 * spine and a hair is three numbers and it is worth being able to see that.
 *
 * **`width` and `blunt` are separate on purpose, and the first draft got this
 * wrong.** It had one parameter doing both, so asking for a blunt feature also
 * widened it, and a body meant to wear clubs on necks came out as a cog: wide
 * teeth with no gap between them. They are independent claims. `width` is how
 * much of the gap between two features the feature occupies — small is a thing
 * standing off the body, large is a scallop cut into it. `blunt` is what
 * happens at the tip — 0 comes to a point, 1 flattens into a cap. A club is
 * narrow and blunt, a spine is narrow and sharp, and a lobe is wide and blunt,
 * which is what the game already draws and is why nothing here asks for it.
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
  /** 0 comes to a point, 1 flattens into a cap. */
  blunt: number;
  /**
   * Squareness of the body underneath: 2 is an ellipse, higher is a capsule
   * with straight sides. The bodies worth converting are rarely round — half
   * of them are rounded rectangles — and a fringe round an ellipse is a
   * different creature from a fringe round a capsule.
   */
  boxy?: number;
  /** Lobing of the body, before anything is added to the rim. */
  lobes?: number;
  depth?: number;
  seed?: number;
  /**
   * A cluster of longer features, centred at `at` radians and `spread` wide.
   *
   * The reference this was drawn from has a plain body and a handful of bright
   * swellings gathered on top, and those swellings are what make it read as
   * having a *front*. Colour and light cannot carry that here — the outline is
   * all a body has at 26 px — so the crown is the same claim made in the only
   * place a phone can hear it: a few of the features are simply longer, and
   * they are all on one side.
   */
  crown?: { reach: number; at: number; spread: number };
}

/** Enough samples that a needle is a needle rather than a dent. */
const N = 224;

/** The closer of two angles, as an unsigned distance round the circle. */
function apart(a: number, b: number): number {
  const d = Math.abs(((a - b) % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
  return d > Math.PI ? Math.PI * 2 - d : d;
}

export function studded(name: string, note: string, o: StuddedOpts): Subject {
  const step = (Math.PI * 2) / o.studs;
  const power = 2 + 18 * (1 - o.width);
  // Blunting is a root taken of the profile, not a gain with a clamp on it.
  // The clamp was the first attempt and it flattened every tip into a straight
  // edge, so a body wearing clubs came out wearing cogs: a hard ceiling in a
  // curve that is then smoothed through Catmull-Rom is a corner, and a corner
  // is the one thing a grown body must not have. A root saturates instead —
  // the tip rounds over and nothing in the outline is ever flat.
  const round = 1 / (1 + 3 * o.blunt);
  const seed = o.seed ?? 5.1;
  const boxy = o.boxy ?? 2;

  return {
    name,
    note,
    open: false,
    pointsAt(t) {
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
    },
    path: catmullRomToBezierPath,
  };
}
