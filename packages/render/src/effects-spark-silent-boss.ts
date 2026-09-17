import type { SimEvent } from "@neon-spore/sim";

/**
 * **The choreographed bosses' events that are deliberately not a burst**, the
 * part of `effects-spark-silent.ts`'s list that grows by a family at a time.
 *
 * A field boss's events are one family: either read above the loop by a
 * `<boss>-fx.ts` of its own, which throws whatever bursts the boss wants on
 * the frame it wants them, or — between the lane that built the boss and the
 * lane that draws it — answered by nothing at all, because a transient about
 * a thing nobody can see is a picture of nothing. Either way the row here is
 * the same, and its comment says which of the two it is. THE SINEW's family
 * was the one that put the other file over its 250 lines, after THE GORGE's,
 * THE CURTAIN's and THE TASTER's had each added a dozen; the property that had
 * to survive the split is the same one that file explains — `SILENT` keeps
 * its literal member types through the spread, so `isSilent` still narrows
 * and `burstFor`'s `assertNever` still catches an event named in neither.
 */
export const SILENT_BOSS = [
  // THE GORGE's nine: one family, read above the loop by `gorge-fx.ts` —
  // the bursts are thrown there, and the beads leaving are its transient.
  "gorgeSettle",
  "gorgeSwallow",
  "gorgeEmptied",
  "gorgeFull",
  "gorgeRupture",
  "gorgeVent",
  "gorgeSpit",
  "gorgeMouth",
  "gorgeOut",
  // THE CURTAIN's ten: one family, read above the loop by `curtain-fx.ts`
  // the way THE GORGE's is.
  "curtainUnroll",
  "curtainShadow",
  "curtainSoft",
  "curtainShove",
  "curtainReroll",
  "curtainLobeOff",
  "curtainCoreHit",
  "curtainFire",
  "curtainTear",
  "curtainOut",
  // THE TASTER's twelve, read above the loop by `taster-fx.ts` the way THE
  // GORGE's and THE CURTAIN's are: the crest, the fan and every edge on it are
  // drawn off the boss each frame, and the two that outlive a frame are a
  // blade tumbling off and the shiver down the crest when the fan re-edges.
  // The bursts are thrown there in the blade's own colour, which this table
  // could not do — a shear does not carry one (`bosses.md` §11.25).
  "tasterRise",
  "tasterGrow",
  "tasterSet",
  "tasterThick",
  "tasterPare",
  "tasterShear",
  "tasterCrest",
  "tasterLift",
  "tasterTaste",
  "tasterClose",
  "tasterRefused",
  "tasterOut",
  // THE SINEW's thirteen: nothing draws the boss until its look lands
  // (`docs/spec/bosses.md` §11.26), and then they are one family read above
  // the loop by a `sinew-fx.ts`, never rows here.
  "sinewSettle",
  "sinewGrip",
  "sinewRelease",
  "sinewEnter",
  "sinewLoose",
  "sinewPart",
  "sinewSnap",
  "sinewRock",
  "sinewSlack",
  "sinewFall",
  "sinewSwing",
  "sinewOut",
  "sinewCrush",
] as const satisfies readonly SimEvent["type"][];
