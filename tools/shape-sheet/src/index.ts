/**
 * What the sheets draw, as a library.
 *
 * `subjects.ts` is already the one place a silhouette is described — that is
 * the property the sheet was built for. Exporting it lets a second tool draw
 * the same contours instead of transcribing them, which is the only way the
 * director's inventory can claim to show what the game actually has.
 *
 * `svg.ts` is deliberately not re-exported: it writes files, and a browser
 * bundle that pulled in `node:fs` for the sake of one geometry helper would be
 * paying for the wrong thing.
 */

export {
  CATALOGUE,
  type CatalogueEntry,
  type ShapeSlot,
  type ShapeStatus,
} from "./catalogue.js";
export {
  type Bounds,
  boundsOver,
  type Metrics,
  measure,
  ringClearance,
  travel,
  WOBBLE_PERIOD,
} from "./metrics.js";
export { MOTIONS } from "./motions.js";
export { type RingLobes, type RingSilhouette, ring } from "./ring.js";
export { SUBJECTS, type Subject } from "./subjects.js";
