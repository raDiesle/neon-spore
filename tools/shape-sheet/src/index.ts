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
 *
 * `grown`, `PARTS` and `CATEGORIES` are exported for the same reason
 * `CATALOGUE` is: the director's live composer (`shapes-build.ts`) builds
 * bodies the same way `grown-bodies.ts` and `jelly-bodies.ts` do, and a
 * second copy of the attachment machinery over there would drift from this
 * one the first time either changed.
 */

export {
  CATALOGUE,
  type CatalogueEntry,
  type ShapeSlot,
  type ShapeStatus,
} from "./catalogue.js";
export { contourAt, type Subject } from "./contour.js";
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
export {
  type Attachment,
  CATEGORIES,
  type GrownOpts,
  grown,
  PARTS,
  type PartCategory,
  type PartDef,
} from "./parts/index.js";
export { type RingSilhouette, ring } from "./ring.js";
export type {
  Scene,
  SceneBody,
  SceneCrop,
  SceneMark,
  SceneSpawn,
  SceneTint,
} from "./scene.js";
export { SCENES } from "./scenes/index.js";
export { SUBJECTS } from "./subjects.js";
