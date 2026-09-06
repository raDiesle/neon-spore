/**
 * **What one creature's own rules look like from outside**, one group of
 * exports per kind: the armour a colour wears, a crawler's links, a dart's
 * heading, a fence burning, a ghost's laps, a rim's mounts, a shell's pieces, a
 * strand's beads, a veil's morph, a volley's plates.
 *
 * Cut out of `index.ts` when a lane that wanted two more fence rules found the
 * barrel a line under its 250-line limit and shipped `export * from
 * "./fence.js"` instead — the file deciding an API question by running out of
 * room. A barrel has no seam in the code to be split along, so it is split the
 * way `index-bodies.ts` already was: by subject, with the parent doing nothing
 * but concatenating.
 *
 * The neighbour is `index-bodies.ts` and the line between them is what the
 * exports are *about*: a body wearing a covering there, a body's own behaviour
 * here. **Everything in both is a reading, never a rule** — the step, the ward
 * and the shot are the simulation's alone.
 */

export {
  COLOUR_UNSTRUCK,
  colourArmourLeft,
  colourArmourPhase,
  colourArmourTicks,
  colourIsArmoured,
} from "./colour-armour.js";
// THE CRAWLER, narrowed to what is asked from outside the sim.
export {
  CRAWLER_MAX,
  CRAWLER_MIN,
  CRAWLER_SIDES,
  type CrawlerSide,
  crawlerHeading,
  crawlerSegmentCount,
  crawlerSide,
  linkIsArmoured,
  linkIsEnd,
  linkOrder,
} from "./crawler.js";
export { lureVanishRow, wornKind } from "./creature-rules.js";
export {
  DART_COLS,
  DART_ROWS,
  dartFits,
  dartHeading,
  dartNextHeading,
  dartPickDir,
  dartStepCol,
} from "./dart.js";
export { echoBodies, echoSplitsLeft } from "./echo.js";
export {
  ECHO_AXES,
  echoAxis,
  echoSplitPhase,
  echoWaitBeats,
} from "./echo-split.js";
// THE FENCE, written out. It went out as `export *` for one lane only, because
// the barrel had no room for the nine lines this takes — which is the whole
// reason this file exists. `fenceBurn`, `fenceOnSpawn` and `fenceStruck` are
// the simulation's own and stay inside it.
export {
  fenceGapCols,
  fenceGapSeen,
  fenceIsBurnt,
  fenceIsOpen,
  fenceMask,
  fenceSettleTicks,
} from "./fence.js";
// And where it is cracked: the columns a bolt opens and the colour each wants.
// `crackMask` and `fenceCracksOnSpawn` are the simulation's own and stay
// inside it, the way `fenceMask`'s two neighbours do.
export { fenceCrackAt, fenceCrackCols } from "./fence-crack.js";
export { type GhostPath, ghostCrosses, ghostIsCharging, ghostLaps, ghostRage } from "./ghost.js";
export {
  gyreMountsLeft,
  gyreSpinPerBeat,
  gyreSucked,
} from "./gyre.js";
export {
  GYRE_CLICKS,
  GYRE_LAP_BEATS,
  GYRE_MOUNTS,
  GYRE_RADIUS,
  GYRE_RING,
  gyreClick,
  gyreLap,
  gyreRestCol,
  gyreRestRow,
  gyreStep,
  mountClick,
  mountColor,
  mountOffset,
} from "./gyre-rim.js";
export { magnetPoleColor } from "./magnet.js";
export { recoilBouncesLeft, recoilRow, recoilTurn } from "./recoil.js";
export { rindLayersLeft } from "./rind.js";
export {
  NO_SHELL,
  SHELL_COLS,
  SHELL_INTACT,
  shellBecomes,
  shellHasPiece,
  shellIsBare,
  shellPieceAt,
  shellPiecesLeft,
} from "./shell.js";
export {
  beadIsActive,
  beadIsLit,
  beadIsSpent,
  beadOrder,
  beadStrand,
  strandBeads,
  strandBecomes,
  strandHead,
  strandLeft,
  strandLive,
} from "./strand.js";
export {
  beadColor,
  beadDrop,
  STRAND_MAX,
  STRAND_MIN,
  STRAND_STEP,
  strandBeadCount,
  strandFalls,
  strandSpan,
} from "./strand-shape.js";
export {
  THROB_TURN_MILLI,
  throbBeats,
  throbColorAt,
  throbFacing,
  throbTurnMilli,
} from "./throb.js";
export {
  type VeerDir,
  veerDist,
  veerHeading,
  veerRowIsChange,
  veerRowsToChange,
} from "./veer.js";
export {
  veilArmourPhase,
  veilArmourTicks,
  veilBeatsToMorph,
  veilBecomes,
  veilIsArmoured,
  veilMorph,
  veilMorphs,
  veilOnSpawn,
} from "./veil.js";
export {
  volleyBecomes,
  volleyClimbLeft,
  volleyFloor,
  volleyIsClimbing,
  volleyPlatesLeft,
  volleyReturn,
} from "./volley.js";
export { wispHops, wispOnField, wispRows, wispTileAt } from "./wisp.js";
