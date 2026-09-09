import { kindForColor, livingPoints, livingSilhouette } from "@neon-spore/content";
import type { Color, SimEvent } from "@neon-spore/sim";
import { BREAK_LOOK } from "./break-look.js";
import { contourClock, livingRadius, livingScale } from "./creature-place.js";
import { colorTrio } from "./creature-tint.js";
import type { Debris } from "./debris.js";
import { type Layout, tileCX, tileCY } from "./layout.js";

/**
 * Turning a `destroy` into a body coming apart.
 *
 * Its own file rather than four more lines in `effects-ingest.ts`'s switch,
 * which was already within twenty lines of the limit — and because what is
 * awkward here is worth writing down where somebody will read it.
 *
 * **The event does not say what died.** `destroy` carries a column, a row and a
 * colour and nothing else, so the contour is asked of `kindForColor` — the
 * bestiary's own map from ammunition colour to body, and the same call
 * `pose-kit.ts`'s `living` makes when it spawns one. For an ordinary kill that
 * is exactly right: a red body is a slick and a cyan one is a bulb. For a
 * magnet, a throb or a recoil going down it is the *wrong* silhouette — those
 * kinds emit the same plain `destroy` — so their pieces are cut from a slick's
 * outline instead of their own.
 *
 * That is a real defect and it is deliberately not papered over here. Fixing it
 * means the event carrying its kind, which is a change to `packages/sim` and to
 * everything that switches on the union; `docs/queue.md` carries it as its own
 * item. Until then this is honest at the size the pieces are drawn at — a body
 * is a tile and a half across and its fragments are a fifth of that — and the
 * candidate that offers this look says so in its own file.
 */

/** Where the pieces come to rest: the ship's own skin line. A body is killed
 * over the hull, so what is left of it falls onto the hull, which is the
 * owner's answer to whether a break may leave anything behind. */
export function breakBody(
  debris: Debris,
  l: Layout,
  time: number,
  e: { col: number; row: number; color: Color },
): void {
  const shape = livingSilhouette(kindForColor(e.color));
  // No creature left to ask, so no `livingBodyMul`: a body that was small (an
  // echo) or large (a rind) breaks at the plain footprint. Both are rarer than
  // the ordinary kill and both are still the right *shape*.
  const r = livingRadius(l.tile, 1);
  const trio = colorTrio(e.color);
  // The same seed shape `scars.ts` uses for the same reason: a break must look
  // identical on both phones, and a column and a row are the only two numbers
  // both of them agree about.
  const seed = Math.imul(e.col + 1, 73856093) ^ Math.imul(e.row + 1, 19349663);
  debris.break({
    outline: livingPoints(shape, contourClock(seed, time)),
    scale: livingScale(shape, r),
    x: tileCX(l, e.col),
    y: tileCY(l, e.row),
    tile: l.tile,
    floor: l.hullY,
    hex: trio.hex,
    dark: trio.dark,
    seed,
  });
}

/**
 * The kill burst, turned down by however much the look asks for.
 *
 * Here rather than in `effects-spark.ts`'s own table, and not only because that
 * file is at its line limit: the table is a list of what each event costs in
 * particles, and this is a fact about *one look* competing with them. A
 * candidate that gives a body real pieces has to be able to take the squares
 * back in the same breath, or the pair is judging two effects playing at once
 * and cannot say which one it liked.
 *
 * Every other event is handed straight back, so nothing but a kill can be
 * quietened by a break look.
 */
export function breakSparks(e: SimEvent, n: number): number {
  return e.type === "destroy" ? Math.round(n * BREAK_LOOK.sparkScale) : n;
}
