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
 * there, and the next boss lands without touching anybody's comment. The
 * property that had to survive the split is the same one that file explains
 * — `SILENT` keeps its literal member types through the spread, so `isSilent`
 * still narrows and `burstFor`'s `assertNever` still catches an event named
 * in neither.
 */
export const SILENT_BOSS = [
  // THE STARE's catch, and it is silent for now rather than for ever: the eye,
  // its turn, the seat it settles on and the flash on the button somebody
  // pressed anyway are the look half of that boss and are not drawn yet
  // (`docs/spec/bosses.md`). The hull's own `breach` lands in the same tick,
  // so the pair is not left wondering whether anything happened.
  "stareCaught",
  // THE BATON's seven: the arm, the bead and the locked seat's grey are drawn
  // from the boss's state every frame (`baton-draw.ts`, `band-lock.ts`), and
  // a spark on a landing would be a look on top of a shipped one. A shed
  // socket is a meteor and the last drop is a pod, and both burst on their own.
  "batonLaunch",
  "batonStruck",
  "batonLanded",
  "batonRelit",
  "batonSettled",
  "batonShed",
  "batonDown",
  // THE UNDERTOW's nine: the hull lifting and the lobe in it are the look
  // half, not drawn yet (`docs/spec/bosses.md`); the scar it leaves and the
  // hull's own `breach` at the end land on the field by themselves.
  "undertowBow",
  "undertowLobe",
  "undertowTaken",
  "undertowScar",
  "undertowWidened",
  "undertowUnseated",
  "undertowRise",
  "undertowSwallowed",
  "undertowThrough",
  // THE CANDLE's seven: the dark is a mask read off the world every frame
  // (`candle-dark.ts`), and a spark in it would be a light the design forbids.
  "candleDark",
  "candleDim",
  "candleMove",
  "candleTurn",
  "candleFed",
  "candleLast",
  "candleOut",
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
  // THE SURGE's twelve are one family read above the loop by
  // `surge-fx.ts`, never rows here (`docs/spec/bosses.md` §11.28).
  "surgeSettle",
  "surgeGrip",
  "surgeRelease",
  "surgeNear",
  "surgeVent",
  "surgeBurst",
  "surgeGum",
  "surgeLost",
  "surgeAbsorb",
  "surgeClose",
  "surgeEvert",
  "surgeOut",
  // THE LEAD's fourteen are one family read above the loop by
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
  "scuttleRebuff",
  "scuttleSlack",
  "scuttleWind",
  "scuttleLast",
  "scuttleDown",
  "scuttleOut",
  // THE ANTIPHON's ten, silent until the look lane draws the body: what
  // sparks will be one family read above the loop by `antiphon-fx.ts`, never
  // rows here (`docs/spec/bosses.md` §11.31).
  "antiphonEnter",
  "antiphonGrow",
  "antiphonPit",
  "antiphonHarden",
  "antiphonSink",
  "antiphonSpill",
  "antiphonStill",
  "antiphonShip",
  "antiphonBurst",
  "antiphonOut",
] as const satisfies readonly SimEvent["type"][];
