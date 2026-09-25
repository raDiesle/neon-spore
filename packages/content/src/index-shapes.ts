/**
 * Every **shape** on `@neon-spore/content`'s surface: the contours, outlines
 * and stacks the renderer and the shape sheet draw from, and nothing else.
 *
 * `index.ts` was one flat list, and on 13 September 2026 the line that made
 * THE CAIRN's stack shared (`cairn-shape.ts`) took it to its 250-line limit.
 * A barrel has no seam in the code to split along, so — as `packages/sim`'s
 * did — it is split by *subject*: the geometry here, the rules, waves, scenes
 * and controls where they were. `index.ts` re-exports this file wholesale,
 * which is safe precisely because there is nothing here but names.
 *
 * `@neon-spore/content` stays the one import path. Nothing outside the
 * package moved.
 */

export {
  ANTIPHON_CONTOURS,
  type AntiphonContour,
  antiphonRadiusMul,
} from "./antiphon-contours.js";
export {
  BALLOON_PARTS,
  type BalloonNode,
  balloonNodes,
  balloonThreadPath,
  balloonVeinPath,
} from "./balloon-parts.js";
export { BALLOON, balloonKnot, balloonOutline, balloonPath } from "./balloon-shape.js";
export { walkedSilhouette } from "./body-form.js";
export { livingPath, livingPoints, rimCount } from "./body-path.js";
export { type ClubbedRim, clubbedPoints } from "./body-path-clubbed.js";
export { CAIRN_BITE_ACROSS, CAIRN_BITE_UP, CAIRN_COURSES, cairnCourses } from "./cairn-shape.js";
export {
  CRAWLER,
  CRAWLER_PULSE,
  type CrawlerSilhouette,
  crawlerOutline,
  crawlerPath,
  crawlerPoints,
  PULSE_STEPS,
} from "./crawler-shape.js";
export {
  FILAMENT_CORONA,
  FILAMENT_RASP,
  HEART_POINT,
  HEART_TOP,
  heartPoints,
} from "./filament-look.js";
export {
  GHOST,
  type GhostSilhouette,
  ghostOutline,
  ghostPath,
  ghostPoints,
} from "./ghost-shape.js";
export { type HaloedOpts, haloedContour, haloedHole } from "./haloed.js";
export {
  type Bump,
  bumpAdd,
  hullAngleAtX,
  hullPointAtX,
  hullRadiusMul,
} from "./hull-shape.js";
export { LID, type LidSilhouette, lidOutline, lidPath } from "./lid-shape.js";
export { MAGNET_SHAPE, type MagnetShape, magnetOutline } from "./magnet-shape.js";
// The metaball trace SYMBIOSIS, the Colony and THE CHOIR share (`metaball.ts`).
export { type Bounds, type Field, isoLoops, perimeter, resample } from "./metaball.js";
export { resampleAll } from "./metaball-spread.js";
export { type RootedOpts, rootedContour } from "./rooted.js";
export {
  BULB,
  beatboxArms,
  CANNON_LOBE,
  CHOIR,
  COUNTDOWN,
  type CreatureSilhouette,
  type CrystalSilhouette,
  HULL,
  type HullSilhouette,
  type LobeShape,
  MAW,
  METEOR,
  POD,
  QUEEN_SHELL,
  SHELL,
  SHIELD_LOBE,
  SLICK,
  THROB,
  TORCH,
} from "./silhouettes.js";
export { LEECH, LIMPET } from "./silhouettes-cling.js";
export { GUM, SAC_SKIN, type SacSkin, sacPoints } from "./silhouettes-gum.js";
export { type StuddedOpts, studdedContour } from "./studded.js";
export type { Pin } from "./surface.js";
export { type Facet, facet, LAT_LIMIT, limbX, pin, surfaceDim, surfaceLit } from "./surface.js";
// THE VEER's rider, as figures and as loops — one description of the clown.
// The shape is one file and the arithmetic that places it on a rock is
// another; both come through here, so a caller sees one clown.
export { clownFigure, clownLoops } from "./veer-clown-figure.js";
export {
  type ClownArc,
  type ClownDisc,
  type ClownFigure,
  type ClownSilhouette,
  VEER_CLOWN,
} from "./veer-clown-shape.js";
export {
  type RingSilhouette,
  WARDEN_OPENING,
  WARDEN_PUPIL_OPEN,
  WARDEN_RING,
  type WardenOpening,
  wardenOpening,
} from "./warden-shape.js";
