import { type Creature, queenMarkCol } from "@neon-spore/sim";
import { type Layout, tileCX, tileCY } from "./layout.js";

/**
 * Where the parts of the queen sit on her, and where the screen puts them.
 *
 * Split out of `queen.ts` when that file reached the 250-line ceiling, along
 * the seam it already had: everything here is a *measurement* — the figure in
 * tiles, and the two marks resolved to pixels — and nothing here draws.
 *
 * The split earned itself immediately. A caption pointing at the marks
 * (`caption-anchor.ts`) has to land exactly where `drawQueen` puts them, and
 * the only way to be sure of that is for both to ask the same function rather
 * than each spell out `queen.col + side` and `weakCy` by hand. CLAUDE.md's
 * rule about a rule being called rather than re-derived is the same rule.
 */

/**
 * Her whole figure, in tiles from the centre of the tile she stands on. A
 * wide, low hull, and that is the shape the rest of this follows from:
 *
 * - the two marks hang out of the middle of her underside, one tile either
 *   side of her own column, with a one-tile gap between them where the hull
 *   simply carries on. The hull closes over the top and both sides of each
 *   so only its lower half is ever exposed;
 * - the two torches ride the tips of the hull, `QUEEN_FLANK_TILES` out. Her
 *   lowest edge sits well above a torch's own lower edge at that offset, so
 *   there is nothing of her under either egg and a released one falls
 *   straight down out of its socket.
 *
 * Both of those readings are measurements, not intentions, and
 * `test/queen-figure.test.ts` takes them — off `crystalRadiusMul`, the same
 * facet reach the shapes are actually drawn with — every time these numbers
 * are touched.
 */
export const QUEEN_FIGURE = {
  bodyCy: -0.5,
  bodyRx: 2.2,
  bodyRy: 0.72,
  weakCy: 0.42,
  weakR: 0.4,
  /** Above the body, clear of both marks either side of it below. */
  petalCy: -1.0,
} as const;

/** One mark's centre and radius, before her shudder is added to it. */
export interface MarkCircle {
  x: number;
  y: number;
  r: number;
}

/**
 * Where one of her two marks is drawn. The column comes from
 * `queenMarkCol` — the simulation's own answer to which column a shot has to
 * land in — so the picture and the rule cannot disagree about it.
 */
export function queenMarkCenter(l: Layout, queen: Creature, side: -1 | 1): MarkCircle {
  return {
    x: tileCX(l, queenMarkCol(queen.col, side)),
    y: tileCY(l, queen.row) + QUEEN_FIGURE.weakCy * l.tile,
    r: QUEEN_FIGURE.weakR * l.tile,
  };
}

/**
 * One box around **both** marks, which is what a page saying *one mark is
 * real* is about: it is a sentence about a pair, and a ring drawn round
 * either one of them says the opposite of it. Wide and low, because the two
 * stand two tiles apart with the hull carrying on between them.
 */
export function queenMarksBox(
  l: Layout,
  queen: Creature,
): { x: number; y: number; rx: number; ry: number } {
  const left = queenMarkCenter(l, queen, -1);
  const right = queenMarkCenter(l, queen, 1);
  return {
    x: (left.x + right.x) / 2,
    y: left.y,
    rx: (right.x - left.x) / 2 + left.r,
    ry: left.r,
  };
}
