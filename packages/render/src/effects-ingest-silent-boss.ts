import type { SimEvent } from "@neon-spore/sim";

/**
 * **The bosses' half of the silent list**, and nothing else.
 *
 * Cut out of `effects-ingest-silent.ts` when THE STARE's catch took that file
 * seven lines over its 250-line limit — and it was standing *at* 250 before
 * this lane touched it, so the next event of any kind would have done the
 * same. The seam is the one the list already had in it: everything left next
 * door is a body on the field doing something, and this is whichever boss is
 * standing over it. Fourteen bosses are built and nine more rounds are
 * designed, so this is the half that grows.
 *
 * Every row means the same thing it meant next door — *this event leaves
 * nothing behind for the next frame* — and the reasons are kept with the rows
 * they are about. `INGEST_SILENT` spreads this in place, so the guard and the
 * type it narrows by are unchanged and nothing outside had to move.
 */
export const INGEST_SILENT_BOSS = [
  // THE MIRROR's four, read above the loop by an `ingest` of their own before
  // this switch ever sees them.
  "mirrorShow",
  "mirrorEcho",
  "mirrorVerdict",
  "mirrorDown",
  "plate",
  // THE CHOIR singing. The burst is thrown by `burstFor` above and the hull
  // damage rides on the `breach` beside it on the same tick, which is what
  // `ingestBreach` already remembers. Nothing about the chord itself outlives
  // its frame: the two events that *do* start a clock here are `choirArm` and
  // `choirMerge`, and both are in the switch next door.
  // THE SPLICE's four, each answered by a burst (`effects-spark.ts`) and a
  // sound. The number coming down its straw and the verdict under it are drawn
  // every frame off `feedBeat` and `verdictBeat`, fields of the fight's own
  // state (`splice.ts`); the hull damage rides on the `breach` beside it.
  "spliceFeed",
  "spliceFed",
  "spliceWrong",
  "spliceDown",
  "queenDown",
  // THE STARE's catch. Silent **for now and on purpose**: the boss's whole
  // picture — the eye, the turn that warns the pair, the seat it settles on
  // and the flash on the button that was pressed anyway — is the look half of
  // the work and has not been drawn yet (`docs/spec/bosses.md`). The hull's
  // own `breach` goes up in the same tick, so a caught press is not invisible
  // while this row stands; it is only unnamed.
  "stareCaught",
  // THE BATON's eleven, silent because its picture is read off its state
  // every frame rather than off an event: the arm, a socket going dark, the
  // bead in flight and the grey panel under the seat whose turn it is not are
  // all in `baton-draw.ts` and `band-lock.ts` already, and a burst on top of
  // them is a look for VERSUS, not for here. What it puts on the field it
  // puts there as a meteor and a pod, and those two burst on their own.
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
  // THE UNDERTOW's nine, silent for now rather than for ever: the plate
  // bowing, the lobe standing in its breach and the body passing through are
  // the look half of that boss and are not drawn yet (`docs/spec/bosses.md`).
  // What it does to the hull it does through `scarHull` and `breachHull`, so
  // a scar and the last lobe's breach are on the field the same tick.
  "undertowBow",
  "undertowLobe",
  "undertowTaken",
  "undertowScar",
  "undertowWidened",
  "undertowUnseated",
  "undertowRise",
  "undertowSwallowed",
  "undertowThrough",
  // THE CANDLE's seven, silent for the same reason: the dark, the glow and
  // its face are read off the world every frame (`candle-dark.ts`), and the
  // one light an event makes — the shot's flash — is the `fire` next door.
  "candleDark",
  "candleDim",
  "candleMove",
  "candleTurn",
  "candleFed",
  "candleLast",
  "candleOut",
  // THE GORGE's nine, read above the loop by `gorge-fx.ts` the way the
  // mirror's are: the bursts and the beads leaving are its; the sack, the
  // lobes and the beads in them are drawn off the boss every frame.
  "gorgeSettle",
  "gorgeSwallow",
  "gorgeEmptied",
  "gorgeFull",
  "gorgeRupture",
  "gorgeVent",
  "gorgeSpit",
  "gorgeMouth",
  "gorgeOut",
  // THE CURTAIN's ten, read above the loop by `curtain-fx.ts` the way THE
  // GORGE's are: the sheet, its lobes and the shadow behind it are drawn off
  // the boss every frame, and the tear is the one that outlives its frame.
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
  // CURTAIN's are. What the fan is — which blades stand, what each edge is,
  // how thick it is, which gaps are soft and how wet — is on the boss and is
  // drawn off it every frame (`taster-draw.ts`). The two that are not in the
  // world a frame later are a blade coming off the crest and the shiver when
  // every standing blade re-edges, and that file keeps both, along with the
  // one memory in the renderer of a colour the simulation has cleared: what
  // each blade was wearing when it went (`docs/spec/bosses.md` §11.25).
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
  // THE LEDGER's eleven, read above the loop by `ledger-fx.ts` the way THE
  // TASTER's are. The body, the seam's width, where the cord is rooted and how
  // far down it every return has got are all on the boss and drawn off it every
  // frame (`ledger-draw.ts`). Three of the eleven are moments the world keeps
  // nothing of — a warded return thrown back *up* the cord, the shock the
  // plating takes, and the flash of the tear — and that file keeps those
  // (`docs/spec/bosses.md` §11.27).
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
  // THE SINEW's thirteen are read as one family above the loop by
  // `sinew-fx.ts` (`Effects.sinew`), the way the two above are: a burst per
  // event at the mass or the handle, the flash on a snap, the hull's shock
  // on a landing.
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
  // THE SURGE's twelve are read as one family above the loop by
  // `surge-fx.ts` (`Effects.surge`), the way THE SINEW's are: a burst per
  // event at the bulb or the grip, the sink and the jet on a vent, the jolt
  // on a burst.
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
  // THE LEAD's fourteen are read as one family above the loop by
  // `lead-fx.ts` (`Effects.lead`), the way THE SURGE's are: a burst per
  // event at the foot or the column, the whip on a doubling back, the bead
  // that tumbles off on a hit (`docs/spec/bosses.md` §11.29).
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
  // THE SCUTTLE's ten are read as one family above the loop by
  // `scuttle-fx.ts` (`Effects.scuttle`), the way THE LEAD's are: a burst per
  // event at the socket or the column, the jolt of a throw, the plate that
  // tumbles off on a strike (`docs/spec/bosses.md` §11.30).
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
  "tether",
  "eyeOpen",
  "wardenDown",
  "mazeCommit",
  "mazeProbe",
  "mazeVerdict",
  "mazeDown",
  // THE FLEET is drawn straight off the world every frame — the marks from
  // `struck`, the sinking from `sunkBeat` — with one exception, and the
  // exception is read above this loop by an `ingest` of its own: a salvo is
  // in the air for `FLEET_SHELL_BEATS` after the tick that resolved it, so
  // the shell, its shadow and the burst it makes are `FleetFx`'s
  // (`fleet-fx.ts`).
  "fleetSalvo",
  "fleetSplash",
  "fleetHit",
  "fleetSunk",
  "fleetDown",
  // THE CAIRN losing a unit, either way. Nothing here outlives the frame
  // either, and for a plainer reason than the weight's: what leaves the pile
  // **is still on the field**. It is a rock now, with a column and a row of its
  // own, drawn every frame by the same code that draws every other rock — so a
  // transient remembering it would be the same stone painted twice. The burst
  // next door is the dust off the seam and the whole of the transient.
  "cairnPulled",
  "cairnShed",
] as const satisfies readonly SimEvent["type"][];
