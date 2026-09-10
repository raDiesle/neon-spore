/**
 * Which element of the VERSUS page `bun run versus:shot` photographs.
 *
 * The pair of phones by default — `.versus-stage`, which is what a candidate
 * is looked at as. But `--at` is documented as *a rectangle inside the
 * picture*, and the stage is not the picture: it is a box the width of a phone
 * holding a name line and then the window the pose cuts (`versus-crop.ts`).
 * On a whole-phone pose the two are close enough that a rectangle measured
 * against one lands on the other; on a `crop: "tile"` pose the window is a
 * square of `span` tiles — 172 px at five, 104 px at three — under a line of
 * text in a 380 px box, and `--at 110,110` from
 * the stage's corner is *under* the tile. That is what wrote a picture of the
 * page's buttons and prose for `creature:magnet` and cost a lane three
 * rectangles and the crop — `docs/queue.md` had it as a scrolling bug in
 * `shot.ts`, and it never was: nothing scrolled, and the clip was exactly
 * where it was asked to be.
 *
 * So with `--at` the element is the window itself, and the rectangle is in the
 * picture's own pixels, the way `bun run frames --at` is in `#stage`'s. The
 * first window on the page is P1's, and with `--only` it is that side's.
 * `--element` still wins, for a session that knows what it wants.
 */

/** The pair of phones, notes and all: the element a plain shot is of. */
export const STAGE = ".versus-stage";
/** The window a pose cuts in a phone: the picture, and nothing around it. */
export const PICTURE = ".versus-crop";

export function elementFor(flags: { element?: string; at?: string }): string {
  if (flags.element !== undefined) return flags.element;
  return flags.at === undefined ? STAGE : PICTURE;
}
