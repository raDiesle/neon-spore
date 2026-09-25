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
 *
 * **This page is full, and gives a boss back rather than grow.** From THE
 * CAIRN on the rows are on the second, `effects-ingest-silent-boss-b.ts`. The
 * boundary moved a boss earlier when one boss's two new rows put this page
 * over its limit, and again when THE CURTAIN's three did: the seam is build
 * order, so it is the *last* boss here that goes next door, never the one
 * being worked on.
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
  // sound. The numbers coming down their straws and the verdict under them are
  // drawn every frame off `flights` and `verdictBeat`, fields of the fight's own
  // state (`splice.ts`); the hull damage rides on the `breach` beside it.
  "spliceFeed",
  "spliceFed",
  "spliceWrong",
  "spliceDown",
  "queenDown",
  // THE STARE's catch, read above the loop by `stare-fx.ts` — the flash on
  // the caught seat's panel and the burst out of the eye — before this switch
  // ever sees it, the way THE MIRROR's four are. The hull's own `breach` goes
  // up in the same tick.
  "stareCaught",
  "stareShut", // And the lid's two, read above the loop by the same file.
  "stareOpen",
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
  // THE UNDERTOW's ten: the plate bowing, the lobe standing in its breach and
  // the body passing through are read off the world every frame
  // (`undertow-draw.ts`, `undertow-lobe.ts`), and a breach that opens is
  // drawn open. What it does to the hull it does through `scarHull` and
  // `breachHull`, so a scar — and the plate a tall lobe takes, drawn as a
  // hole in the outline (`plate-gap.ts`) — is on the field the same tick.
  // The one that outlives its frame, the plate closing under a cannon slid
  // off in time, is read above the loop by `undertow-fx.ts`.
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
  // THE CURTAIN's thirteen, read above the loop by `curtain-fx.ts` the way THE
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
  "curtainPin",
  "curtainJam",
  "curtainLift",
  "curtainTear",
  "curtainOut",
  // THE TASTER's fifteen, read above the loop by `taster-fx.ts` the way THE
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
  // The three hands leave nothing behind either: which blade is pinned, how
  // far a carry has gone and whether the interlock stands open are all on the
  // boss and drawn off it every frame (`sim/taster-hand.ts`).
  "tasterPin",
  "tasterWipe",
  "tasterPry",
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
  // And the four hands' five the same way: a foot walked along the plating, a
  // thumb in the socket, a bill rolled back onto the cord, a return hauled a
  // beat down it and the cord hauled out by hand are all of them a state of
  // the boss, and the boss is drawn every frame (`sim/ledger-hand.ts`).
  "ledgerFoot",
  "ledgerPlug",
  "ledgerRoll",
  "ledgerPull",
  "ledgerHaul",
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
  "sinewCatch",
  "sinewSlack",
  "sinewFall",
  "sinewSwing",
  "sinewOut",
  "sinewCrush",
  // THE SURGE's thirteen are read as one family above the loop by
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
  "surgeRock",
  "surgeLost",
  "surgeAbsorb",
  "surgeClose",
  "surgeEvert",
  "surgeOut",
  // THE LEAD's seventeen are read as one family above the loop by
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
  "leadGrip",
  "leadRelease",
  "leadTear",
  "leadPass",
  "leadWall",
  "leadDown",
  "leadOut",
  "tether",
  "eyeOpen",
  "wardenDown",
  "mazeCommit",
  "mazeProbe",
  "mazeVerdict",
  "mazeDown",
] as const satisfies readonly SimEvent["type"][];
