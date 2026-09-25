import type { SimEvent } from "@neon-spore/sim";

/**
 * **The bosses' events that are deliberately not a burst**, the part of
 * `effects-spark-silent.ts`'s list that grows by a family at a time.
 *
 * A boss's events are one family: either read above the loop by a
 * `<boss>-fx.ts` of its own, which throws whatever bursts the boss wants on
 * the frame it wants them, or — between the lane that built the boss and the
 * lane that draws it — answered by nothing at all, because a transient about
 * a thing nobody can see is a picture of nothing. Either way the row here is
 * the same, and its comment says which of the two it is. THE SINEW's family
 * was the one that put the other file over its 250 lines, after THE GORGE's,
 * THE CURTAIN's and THE TASTER's had each added a dozen, and the older
 * bosses followed on 17 September 2026 so the seam is the one
 * `effects-ingest-silent-boss.ts` cut: every boss here, every creature
 * there, and the next boss lands without touching anybody's comment. **This
 * page is full.** From THE INSTAR on the rows are on the second,
 * `effects-spark-silent-boss-b.ts`, and that is where the next boss's go.
 * The boundary moved a boss earlier when THE CANDLE's two new rows put this
 * page over its limit again, and again on 19 September 2026 when THE
 * ANTIPHON's own ten did — `surgeRock` had already taken this page to
 * exactly 250 lines, the ceiling and not under it, so the next boss to land
 * here was already going to go over (`docs/queue.md`): the seam is build
 * order, so it is the *last* boss here that goes next door, never the one
 * being worked on.
 * The property that had to survive the split is the same one that file explains
 * — `SILENT` keeps its literal member types through the spread, so `isSilent`
 * still narrows and `burstFor`'s `assertNever` still catches an event named
 * in neither.
 */
export const SILENT_BOSS = [
  // THE STARE's catch, one event read above the loop by `stare-fx.ts`, which
  // throws its burst out of the eye itself and lights the caught seat's panel
  // (`stare-draw.ts` for the rest of that boss, which is read off its state
  // every frame). The hull's own `breach` lands in the same tick.
  "stareCaught",
  // And the lid's two, read above the loop by the same file (`stare-fx.ts`).
  "stareShut",
  "stareOpen",
  // THE BATON's eleven: the arm, the bead and the locked seat's grey are drawn
  // from the boss's state every frame (`baton-draw.ts`, `band-lock.ts`), and
  // a spark on a landing would be a look on top of a shipped one. A shed
  // socket is a meteor and the last drop is a pod, and both burst on their own.
  "batonLaunch",
  "batonStruck",
  "batonLanded",
  "batonRelit",
  "batonSettled",
  "batonTwin",
  "batonMerged",
  "batonAct",
  "batonMissed",
  "batonShed",
  "batonDown",
  // THE UNDERTOW's ten: the hull lifting and the lobe in it are drawn off
  // the world (`undertow-draw.ts`), the plate closing off `undertow-fx.ts`,
  // and a spark on plating that is seen moving would be the same fact twice;
  // the scar it leaves and the hull's own `breach` at the end land on the
  // field by themselves.
  "undertowBow",
  "undertowLobe",
  "undertowTaken",
  "undertowScar",
  "undertowWidened",
  "undertowUnseated",
  "undertowClosed",
  "undertowRise",
  "undertowSwallowed",
  "undertowThrough",
  // THE MIRROR's four: the ghost shot, the echo, the verdict and the fall —
  // `simon-fx.ts` owns the whole sequence.
  "mirrorShow",
  "mirrorEcho",
  "mirrorVerdict",
  "mirrorDown",
  // THE MAZE, all four of them: the shot going down the tangle is the whole
  // picture and it is not a spark on the field. Silent until the lane that
  // draws the lattice says otherwise.
  "mazeCommit",
  "mazeProbe",
  "mazeVerdict",
  "mazeDown",
  // THE FLEET's five, and none of them throws anything from here. A salvo is
  // not resolved where it is pressed: the shell arcs out of the cannon and
  // takes `FLEET_SHELL_BEATS` to reach the square, so a burst thrown on the
  // tick of the event would land a second and a quarter before anything got
  // there. `FleetFx` holds the flight and throws the same three sizes — 6
  // cyan, 14 red, 26 ember — on the frame the shell arrives (`fleet-fx.ts`).
  // The last of them never threw one: the sinking that rides beside it on the
  // same tick is the picture, and `fleetSunk` has already thrown for it.
  "fleetSalvo",
  "fleetSplash",
  "fleetHit",
  "fleetSunk",
  "fleetDown",
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
  // THE CURTAIN's thirteen: one family, read above the loop by `curtain-fx.ts`
  // the way THE GORGE's is.
  "curtainUnroll",
  "curtainShadow",
  "curtainSoft",
  "curtainShove",
  "curtainReroll",
  "curtainLobeOff",
  "curtainCoreHit",
  "curtainFire",
  "curtainPin",
  "curtainJam",
  "curtainLift",
  "curtainTear",
  "curtainOut",
  // THE TASTER's fifteen, read above the loop by `taster-fx.ts` the way THE
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
  // The three hands the same way: a thumb throws nothing, and what the thumb
  // is doing is on the boss (`sim/taster-hand.ts`).
  "tasterPin",
  "tasterWipe",
  "tasterPry",
  "tasterOut",
  // THE SINEW's thirteen are one family read above the loop by
  // `sinew-fx.ts`, never rows here (`docs/spec/bosses.md` §11.26).
  "sinewSettle",
  "sinewGrip",
  "sinewRelease",
  "sinewEnter",
  "sinewLoose",
  "sinewPart",
  "sinewSnap",
  "sinewRock",
  "sinewCatch",
  "sinewSlack",
  "sinewFall",
  "sinewSwing",
  "sinewOut",
  "sinewCrush",
  // THE LEDGER's eleven, silent **here** because all eleven are thrown by
  // `ledger-fx.ts` instead: every one of them names a column, which is the boss
  // itself, so the family is read above the loop where one `burst` can be
  // aimed at the socket or the seam without eleven rows in a table that is at
  // its limit — THE GORGE's, THE CURTAIN's and THE TASTER's arrangement
  // (`bosses.md` §11.27).
  "ledgerRoot",
  "ledgerSeam",
  "ledgerRefused",
  "ledgerBead",
  "ledgerWard",
  "ledgerWhip",
  "ledgerBill",
  "ledgerSocket",
  "ledgerLast",
  "ledgerHeld",
  "ledgerTear",
  // And the four hands' five, thrown by the same file for the same reason:
  // each of them names a column too — the foot, the socket, the bill rolled
  // over, the return hauled down and the cord hauled out (`sim/ledger-hand.ts`).
  "ledgerFoot",
  "ledgerPlug",
  "ledgerRoll",
  "ledgerPull",
  "ledgerHaul",
  // THE SURGE's thirteen are one family read above the loop by
  // `surge-fx.ts`, never rows here (`docs/spec/bosses.md` §11.28).
  "surgeSettle",
  "surgeGrip",
  "surgeRelease",
  "surgeNear",
  "surgeVent",
  "surgeBurst",
  "surgeGum",
  "surgeRock",
  "surgeLost",
  "surgeAbsorb",
  "surgeClose",
  "surgeEvert",
  "surgeOut",
  // THE LEAD's seventeen are one family read above the loop by
  // `lead-fx.ts`, never rows here (`docs/spec/bosses.md` §11.29).
  "leadEnter",
  "leadPace",
  "leadTurn",
  "leadFlight",
  "leadHit",
  "leadMiss",
  "leadReverse",
  "leadTorch",
  "leadRock",
  "leadStill",
  "leadGrip",
  "leadRelease",
  "leadTear",
  "leadPass",
  "leadWall",
  "leadDown",
  "leadOut",
  // THE SCUTTLE's ten are one family read above the loop by
  // `scuttle-fx.ts`, never rows here (`docs/spec/bosses.md` §11.30).
  "scuttleEnter",
  "scuttleLoose",
  "scuttleThrow",
  "scuttleStruck",
  "scuttleSwing",
  "scuttleRebuff",
  "scuttleSlack",
  "scuttleWind",
  "scuttleLast",
  "scuttleDown",
  "scuttleOut",
] as const satisfies readonly SimEvent["type"][];
