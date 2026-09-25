/**
 * **The clock bosses' half of the surface**, written out the same way.
 *
 * Split out of `boss-surface.ts` when THE THROAT's eight names took that file
 * two lines over its 250-line limit, along the seam `bosses-clocks.ts` cuts
 * one file down: every name here belongs to a boss whose whole difficulty is a
 * beat count the pair has to say out loud, which is also why every one of them
 * is imported by a *screen* — a number nobody can hear has to be drawn.
 *
 * Next door's rule holds word for word: a name here is one something outside
 * `packages/sim` imports, and `bun run typecheck` says so either way.
 */

// From THE ANTIPHON on, the second page (`boss-surface-clocks-b.ts`), and
// THE LEDGER's own, cut off when its two drawn hands took this file over the
// limit (`boss-surface-ledger.ts`).
export * from "./boss-surface-clocks-b.js";
export * from "./boss-surface-ledger.js";
export {
  BATON_SOCKET_DARK,
  BATON_SOCKET_LIT,
  BATON_SOCKET_SHED,
  BATON_STAGES,
  type BatonBead,
  type BatonEntry,
  type BatonStage,
  type BatonState,
  batonActor,
  batonBaseCol,
  batonBeadCol,
  batonBeadRowMilli,
  batonBoss,
  batonDark,
  batonLandTick,
  batonLaunchable,
  batonLead,
  batonLocked,
  batonOneSegment,
  batonSocketCol,
  batonSocketRow,
  batonWaiting,
  type CurtainEntry,
  type CurtainState,
  curtainBody,
  curtainBoss,
  curtainCoreBare,
  curtainCovers,
  curtainLobesLeft,
  curtainReach,
  curtainSoftAt,
  curtainStride,
  GORGE_PHASES,
  type GorgeEntry,
  type GorgeIntake,
  type GorgePhase,
  type GorgeState,
  gorgeBeads,
  gorgeBoss,
  gorgeFull,
  gorgeIntakeAt,
  gorgeNearestFull,
  gorgePhase,
  gorgeSink,
  // THE TASTER's entry, which authors nothing — the director's own guard
  // narrows on it (`tools/director/src/boss-nothing.ts`) — and then the fan
  // itself, which a screen has to read a blade at a time: what each edge is,
  // how thick, which are soft, whether the crest is cut through, and which
  // column the next blade comes out of. The two the picture deliberately does
  // **not** import are `tasterLean` and `tasterWeak`: the colour the pair is
  // leaning on is on the screen already, in every edge the fan has set, and
  // the colour the beam has to be is the one thing in this fight nobody is
  // shown (`taster-draw.ts`).
  // THE LEAD's entry, which authors nothing — the director's own guard
  // narrows on it (`tools/director/src/boss-nothing.ts`) — and then the body,
  // which two screens read different halves of: the column and the lean.
  // `leadAim` and `leadHeading` are the ones a *picture* asks about a beat
  // that has not happened, and neither screen draws the answer: they are
  // for the test that proves the sum the pair is doing comes out
  // (`lead.ts`, `render/lead-draw.ts`).
  type LeadEntry,
  type LeadFlight,
  type LeadState,
  leadAim,
  leadBoss,
  leadForecasts,
  leadGrippable,
  leadHeading,
  leadHolding,
  leadLast,
  // `leadLead`, `leadPassDir` and `leadWalk` are the director's hand doing
  // the pair's sum: the column a shot pressed this beat goes in, the pass.
  leadLead,
  leadPace,
  leadPassDir,
  leadPassing,
  leadRunning,
  leadShootable,
  leadStill,
  leadWalk,
  // THE SCUTTLE's entry, which authors nothing, and the frame the screens
  // read: which sockets still hold a part, which hang and which one is live,
  // and the beat the live one goes on — the count one seat says and the
  // other shoots against (`scuttle.ts`).
  type ScuttleEntry,
  type ScuttlePart,
  type ScuttlePartKind,
  type ScuttleState,
  STARE_PHASES,
  type StareEntry,
  type StarePhase,
  type StareState,
  type SurgeEntry,
  type SurgeState,
  scuttleAttached,
  scuttleBoss,
  scuttleCadence,
  scuttleFast,
  scuttleLeft,
  scuttleLeftCol,
  scuttleNextCol,
  scuttlePartCol,
  scuttleShootable,
  scuttleSocketCol,
  scuttleSocketRow,
  scuttleSwingable,
  scuttleSwingCol,
  scuttleThrowBeat,
  scuttleTwins,
  scuttleWindBeats,
  scuttleWinding,
  stareBoss,
  stareLooking,
  stareTellLeft,
  stareTurning,
  stareWatches,
  surgeBand,
  surgeBoss,
  surgeBulbLeft,
  surgeBulbRow,
  surgeBulbSpan,
  surgeChargePerHand,
  surgeCovers,
  surgeEverting,
  surgeHands,
  surgeHeld,
  surgeHoldsCharge,
  surgeInBand,
  surgeNotchMilli,
  surgeSealing,
  surgeWarding,
  TASTER_PHASES,
  type TasterBlade,
  type TasterEntry,
  type TasterPhase,
  type TasterState,
  THROAT_PHASES,
  type ThroatEntry,
  type ThroatPhase,
  type ThroatState,
  tasterBladeAt,
  tasterBoss,
  tasterGrowing,
  tasterLifted,
  tasterOrder,
  tasterPhase,
  // Whether the pin, the wipe and the pry are being offered at all — asked by
  // the rings drawn on them, never restated (`taster-hand.ts`).
  tasterPinnable,
  tasterPried,
  tasterPryable,
  tasterSoft,
  tasterStanding,
  tasterWindow,
  tasterWipable,
  throatBoss,
  throatEvertBeatsLeft,
  throatEvery,
  throatInhales,
  throatMouthCol,
  throatMouthRow,
  throatStride,
  throatToInhale,
} from "./bosses.js";
