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
  // THE BATON's seven, silent because its picture is read off its state
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
  // THE GORGE's nine, silent for the same reason: the sack, the beads and
  // the rupture are the look half and are not drawn yet.
  "gorgeSettle",
  "gorgeSwallow",
  "gorgeEmptied",
  "gorgeFull",
  "gorgeRupture",
  "gorgeVent",
  "gorgeSpit",
  "gorgeMouth",
  "gorgeOut",
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
