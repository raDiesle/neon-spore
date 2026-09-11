import type { CreatureSilhouette } from "./silhouettes.js";

/**
 * **THE COUNT: the COUNTDOWN draft's disc**, taken off the shape sheet whole.
 *
 * `tools/shape-sheet/src/drafts/creatures.ts` offers COUNTDOWN — "a rim of
 * marks, one fewer each pass" — as a near-perfect disc with notches marching
 * round it (`forms/radial.ts`, `glyphed`). The disc is the body and it is
 * here; the notches are **not**, on purpose. They are the count, and the
 * count is the one thing on this body that only the pilot may see — so they
 * are cut by `render/countdown.ts` on player 1's screen, off the world's own
 * beat, and the navigator is drawn this contour bare. A silhouette that
 * carried them would carry them on both phones.
 *
 * The four numbers are the draft's disc with its seven teeth kept as the
 * faintest scallop: seven lobes, a fifteenth of the radius deep, under a
 * wobble half a bulb's. Seven because the roster's lobe axis
 * (`tools/shape-sheet/src/nameability.ts`) has to find *some* count on every
 * body and a plain circle gives it none — its second harmonic and its
 * seventh are both noise, and a body that measures three on one frame and
 * five on the next has no name at all. Nothing else living has seven (slick
 * two, choir three, beatbox four, wisp five, bulb and throb six), so at 26 px
 * it is still the roundest thing on the field — "the one you count" — and the
 * scallop is only what keeps that word steady under the gate.
 */
export const COUNTDOWN: CreatureSilhouette = {
  lobes: 7,
  depth: 0.065,
  wobble: 0.02,
  rx: 42,
  ry: 42,
  seed: 4.3,
};
