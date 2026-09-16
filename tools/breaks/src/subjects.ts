import { type CreatureSilhouette, livingPoints, livingSilhouette } from "@neon-spore/content";
import {
  type Fall,
  type Fracture,
  livingScale,
  PALETTE,
  type Shard,
  shatter,
  splinters,
} from "@neon-spore/render";

/**
 * The breaks this bench draws, and the one place a new one is added.
 *
 * A **subject** is a body plus a tuning of the fracture: what is being cut, into
 * how many pieces, from where, and how hard it is thrown. The sheet draws each
 * one across time, so a session tuning a break changes a number here, runs
 * `bun run breaks`, and looks at the whole arc rather than at the one instant a
 * screenshot happened to catch.
 *
 * `SUBJECTS` is the only place that knows which breaks exist, the way `GLOWS`,
 * `SKINS` and `HITS` are on the director's SHAPES page. A new one is one entry.
 *
 * **Nothing here is a look the game draws.** Every subject is a tuning offered
 * to `tools/versus`, or a tuning being tried on the way to one; the field's own
 * answer is `BREAK_LOOK` (`docs/looks.md`). That record shipped at `wedges: 0`
 * — nothing at all — until `creature:break` was taken on 9 September 2026, and
 * `SLICK · SPALLED` below is the tuning it was taken as.
 */

/** One row of the sheet: a body, a cut, and a fall. */
export interface Subject {
  /** The heading. Short: the sheet is read on a phone. */
  readonly name: string;
  /** What the row is arguing, in one line under the heading. */
  readonly note: string;
  /** The body's own contour, in contour units about the origin. */
  readonly outline: readonly { readonly x: number; readonly y: number }[];
  readonly cut: Fracture;
  readonly fall: Fall;
  /** How many slivers come off the faces the cut opened, and none by default —
   * `splinter.ts`, which is what the field does today. */
  readonly splinters?: number;
  /** The body's own colour and its deep value — `colorTrio`'s two. */
  readonly hex: string;
  readonly dark: string;
}

/**
 * The contour of a kind at rest, scaled so that **one unit is one body**.
 *
 * The scaling is `livingScale`, the field's own rule, asked for a radius of 1
 * instead of a fraction of a tile. Without it every subject would be in its own
 * silhouette's units — a slick is 68 across and a wisp 46 — and every number
 * below would be a different distance on every row. With it, `speed: 1` means
 * *one body-width a second* on every row of the sheet and in every reader's
 * head, which is the only reason these tunings can be compared at all.
 *
 * Every body is held at `t = 0`, so two rows are never a beat apart in their
 * own breathing.
 */
function body(kind: Parameters<typeof livingSilhouette>[0]): {
  shape: CreatureSilhouette;
  outline: ReturnType<typeof livingPoints>;
} {
  const shape = livingSilhouette(kind);
  const k = livingScale(shape, 1);
  return { shape, outline: livingPoints(shape, 0).map((p) => ({ x: p.x * k, y: p.y * k })) };
}

/** One body-width, which the scaling above makes exactly one unit. Every speed
 * and every pull on this sheet is a multiple of it. */
const SPAN = 1;

/**
 * The fall every row on this sheet shares, except the one arguing about the
 * fall itself.
 *
 * The pull is what took the most looking. At a body-width and a half a second
 * squared the pieces were still in the air when they faded, which drew a break
 * as a puff going outwards and never as debris — and the owner's answer on 9
 * September 2026 was that debris falls, lands and fades **on the ground**. Six
 * puts every piece down inside half a second, which leaves the last third of
 * the sheet showing what a column looks like after something died in it.
 */
const FALL: Fall = { gravity: SPAN * 6, life: 1.2, fade: 0.35, floor: SPAN * 1, skid: 0.3 };

// The bodies' own two, read off the palette rather than typed: a sheet with a
// private copy of a colour keeps looking right after the field stops.
const RED = { hex: PALETTE.red, dark: PALETTE.redDark };
const CYAN = { hex: PALETTE.cyan, dark: PALETTE.cyanDark };

export const SUBJECTS: Subject[] = [
  {
    name: "SLICK · QUARTERED",
    note: "six wedges, one ring — the coarsest break there is, and the one that still reads at 26 px",
    ...body("slick"),
    cut: { ox: 0, oy: 0, wedges: 6, innerAt: 1, speed: SPAN * 0.9, spin: 4, seed: 17 },
    fall: FALL,
    ...RED,
  },
  {
    name: "SLICK · SPALLED",
    note: "the same body cut again at half its reach: a shattered core and slabs of skin off the rim",
    ...body("slick"),
    cut: { ox: 0, oy: 0, wedges: 9, innerAt: 0.5, speed: SPAN * 1.1, spin: 6, seed: 41 },
    fall: FALL,
    ...RED,
  },
  {
    name: "BULB · STRUCK FROM BELOW",
    note: "the origin pushed down where the shot came from — the near pieces leave hardest",
    ...body("bulb"),
    cut: {
      ox: 0,
      oy: SPAN * 0.28,
      wedges: 10,
      innerAt: 0.55,
      speed: SPAN * 1.2,
      spin: 7,
      seed: 63,
    },
    fall: FALL,
    ...CYAN,
  },
  {
    name: "THROB · A CLUBBED RIM",
    note: "the contour most likely to defeat a ray cast, cut anyway — every club goes with a piece",
    ...body("throb"),
    cut: { ox: 0, oy: 0, wedges: 12, innerAt: 0.6, speed: SPAN * 1, spin: 5, seed: 88 },
    fall: FALL,
    ...CYAN,
  },
  {
    name: "SLICK · DRIFTING",
    note: "spalled, thrown at two fifths the speed with the pull nearly off: debris that drifts and never lands",
    ...body("slick"),
    cut: { ox: 0, oy: 0, wedges: 9, innerAt: 0.5, speed: SPAN * 0.45, spin: 2.5, seed: 41 },
    // SPALLED's cut thrown at two fifths the speed, and no floor at all: a
    // piece that is drifting is not on its way to the ground, and leaving the
    // ship's line in would put every one of them down in the last frame and
    // say the opposite. There is no drag in `shardAt` on purpose, so slow is
    // the only way a piece drifts rather than flies.
    fall: { gravity: SPAN * 0.4, life: 1.6, fade: 0.6, skid: 0.3 },
    ...RED,
  },
  {
    name: "SLICK · SPLINTERED",
    note: "spalled, with six slivers off the faces it opened: 5.6's splinters, which nothing throws today",
    ...body("slick"),
    cut: { ox: 0, oy: 0, wedges: 9, innerAt: 0.5, speed: SPAN * 1.1, spin: 6, seed: 41 },
    // SPALLED's cut and SPALLED's fall, so the only thing between this row and
    // that one is the slivers. They leave faster than the wedges do, which is
    // the whole picture: the body opens and something comes *off* it, ahead of
    // the pieces, gone before they have landed.
    fall: FALL,
    splinters: 6,
    ...RED,
  },
  {
    name: "SLICK · TOO MANY PIECES",
    note: "sixteen wedges, twice over: what over-cutting looks like, kept on the sheet as the wrong end",
    ...body("slick"),
    cut: { ox: 0, oy: 0, wedges: 16, innerAt: 0.45, speed: SPAN * 1.3, spin: 9, seed: 5 },
    fall: FALL,
    ...RED,
  },
];

/** The pieces of one subject, cut once. The sheet draws these at seven moments,
 * which is the whole reason `shardAt` is a function of `t` and not a step. */
export function piecesOf(s: Subject): Shard[] {
  return [
    ...shatter(s.outline, s.cut),
    ...splinters(s.outline, s.cut, s.splinters ?? 0, s.cut.seed),
  ];
}
