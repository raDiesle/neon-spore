import type { SimEvent } from "@neon-spore/sim";

/**
 * **The bosses' half of the silent list, the second page** — from THE CAIRN
 * on.
 *
 * Cut when THE ANTIPHON's ten rows would have put
 * `effects-ingest-silent-boss.ts` over its 250-line limit, the seam the
 * first page itself was cut on: the order the bosses were built in. THE
 * CAIRN's two came over on 19 September 2026 for the same reason and by the
 * same rule — page one went over, so page one handed its last boss across
 * rather than the lane cutting its own rows out of the middle. THE FLEET's
 * five followed the same day, when THE CURTAIN's jam put page one over
 * again — and THE TASTER's three hands would have put it over a third time
 * had they not already gone. THE SCUTTLE's ten came over the same way when
 * THE LEDGER's four hands put page one over a fourth: page one hands its
 * **last** boss across, never the rows the lane is working on.
 * `INGEST_SILENT` spreads this in place after the first page, so the guard
 * and the type it narrows by are unchanged.
 *
 * **This page went over in its turn** on 22 September 2026, and THE WELL's
 * four went across to `effects-ingest-silent-boss-c.ts` by the rule page one
 * wrote. THE GIMBAL's ten, which put it over, are on that third page rather
 * than here — the one departure, and the reason is arithmetic: the boss that
 * moved is four rows and the boss being worked on is ten, so handing THE
 * WELL across bought less room than the rows needed and a second boss would
 * have had to be torn out of the middle to make the difference. THE GAUGE's
 * four followed on 25 September 2026, when THE FILAMENT's late put this page
 * at its ceiling — the last boss here, by the same rule.
 *
 * Every row means what it means there — *this event leaves nothing behind
 * for the next frame* — and the reasons stay with the rows.
 */
export const INGEST_SILENT_BOSS_B = [
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
  // THE CAIRN held: a hand on the pile bought a beat off its clock and
  // nothing left the body, so there is nothing on the field to remember.
  // What says it is the settle mark that stopped filling (`cairn-settle.ts`),
  // read off the state every frame — a transient would be a second copy of a
  // gauge that is already right.
  "cairnHeld",
  // THE ANTIPHON's eleven leave nothing behind for the next frame here: the
  // body, the organs, the rail and the pits are read off the state every
  // frame, and what outlives a frame — the eruption of every pit — and the
  // bursts are one family read above the loop by `antiphon-fx.ts`, never
  // rows here (`docs/spec/bosses.md` §11.31).
  "antiphonEnter",
  "antiphonGrow",
  "antiphonPit",
  "antiphonHarden",
  "antiphonPull",
  "antiphonSink",
  "antiphonSpill",
  "antiphonStill",
  "antiphonShip",
  "antiphonBurst",
  "antiphonOut",
  // THE HIVE's twelve: a breach open or sealed, the swell before one opens,
  // whether the mass is clenched and which lobe a thumb is on are read off
  // the boss every frame, and the bursts, the clench and the jolt are
  // `hive-fx.ts`'s, read above the loop as one family the way THE SCUTTLE's
  // are (`docs/spec/bosses.md` §11.14).
  "hiveEnter",
  "hiveSwell",
  "hiveOpen",
  "hiveSpill",
  "hiveSkin",
  "hiveWrong",
  "hiveSeal",
  "hiveClench",
  "hiveHaul",
  "hiveWrung",
  "hiveDown",
  "hiveOut",
  // THE INSTAR's eleven: the pose, the marks and how far each has got are
  // read off the boss every frame, and the bursts, the jolt, the flinch and
  // the lash are `instar-fx.ts`'s, read above the loop as one family the
  // way THE HIVE's are (`docs/spec/bosses.md` §11.32).
  "instarEnter",
  "instarMorph",
  "instarShow",
  "instarRefuse",
  "instarAnswer",
  "instarDone",
  "instarSlip",
  "instarLand",
  "instarStrike",
  "instarDown",
  "instarOut",
  // THE FILAMENT's eleven are one family read above the loop, the way THE
  // INSTAR's are: the whip of a snap or a recoil, the dark of a gap, the jolt
  // of a pull, and every burst, are `effects.boss.filament`'s
  // (`filament-fx.ts`); the lit tiles, the two thumbs and the gap are read
  // off the boss every frame (`filament-draw.ts`, `docs/spec/bosses.md` §11.33).
  "filamentEnter",
  "filamentArm",
  "filamentDrawn",
  "filamentFollowed",
  "filamentSnap",
  "filamentRecoil",
  "filamentDark",
  "filamentLate",
  "filamentPulled",
  "filamentDown",
  "filamentOut",
  // THE DIASTOLE's clamp catching leaves nothing behind for the next frame:
  // the held chamber is world state, squeezed shut off `clampBeat` on every
  // frame the window holds (`diastole-draw.ts`), and the catch itself is one
  // burst in `effects-spark-handed.ts`. The spasm is not here — it is a
  // shudder of the hull as well (`effects-ingest.ts`).
  "diastoleClamp",
  // THE MIRROR's pin: both thumbs landing on its lobes, or one leaving. Read
  // above the loop with its other four, by `MirrorFx.grip` (`mirror-grip-fx.ts`).
  "mirrorGrip",
  // THE GORGE's pinch, pry and clench: the two thumbs are world state, read
  // off `pinch` and `pry` every frame by the rings (`gorge-grip.ts`), and all
  // three are a burst thrown by `gorge-fx.ts` and nothing kept.
  "gorgePinch",
  "gorgePry",
  "gorgeClench",
  // THE MAZE's heart under the navigator's thumb, landing or leaving: the
  // ring it throws is `maze-grip-fx.ts`, read above the loop, and the
  // filled ring under her thumb is read off `gripThumb` every frame.
  "mazeGrip",
  // THE WARDEN's second and third hands: the thumb on the eye and the thrown
  // hatch are world state, read off `eyeHeld` and `throwBeat` every frame
  // (`warden-grip.ts`), and each moment throws a ring from
  // `warden-grip-fx.ts`, read above the loop with the rope's snap-back.
  "wardenHold",
  "wardenThrow",
  "wardenSlam",
  // THE FLEET's five: the wound itself is world state, read off `phase`,
  // `holeCol`, `rakeCol` and `wreckPullMilli` every frame by
  // `fleet-grip-draw.ts`, and the ring each of the five moments throws off it
  // is `fleet-grip-fx.ts`'s, read above the loop as one family the way THE
  // WARDEN's three are (`docs/spec/bosses.md` §11.6).
  "fleetFlood",
  "fleetBreach",
  "fleetRake",
  "fleetPlug",
  "fleetWreck",
  // THE VANE's two hands on the picture, silent until the look lane draws
  // them: where the arm is pinned and whether the housing is hauled are world
  // state, read off `pinBeat` and `hauled` every frame (`sim/vane-open.ts`);
  // the slip will be a burst and nothing kept.
  "vanePin",
  "vaneSlip",
  "vaneHaul",
  // SNAKE's two hands on its own body, silent until the look lane draws
  // them: the jaws are the mouth's own window, read off `mawTick` every
  // frame, and the lifted tail is `tailHeld` (`sim/snake-controls.ts`).
  "snakePrise",
  "snakeLift",
  "snakeDrop",
  // PINBALL's two hands, drawn since 22 September 2026 and still silent: a
  // slack spring and a spent nudge are state, read off `slack` and `nudges`
  // every frame and put on the rings themselves (`pinball-grip.ts`).
  "pinWind",
  "pinNudge",
  "pinTilt",
  // THE SCOUT's two hands, drawn since 22 September 2026 and still silent:
  // a line and a primed thruster are state, read off `reeling` and
  // `primeTick` every frame and put on the rings themselves — hers goes
  // `held`, his is a dial draining (`sim/scout-hand.ts`, `scout-grip.ts`).
  "scoutReel",
  "scoutSlip",
  "scoutPrime",
  // THE PULSE's hand on the bar, silent until the look lane draws it: which
  // seats are holding it is state, read off `brace1` and `brace2` every
  // frame (`sim/pulse-hand.ts`).
  "pulseBrace",
  "pulseSlip",
  "pulseArrest",
  // THE BATON's arm under a thumb: every one of them leaves nothing behind for
  // the next frame, because the arm *is* the state — which socket is swelling
  // and whose thumbs are on the two beads are read off `swellSocket` and
  // `mergeThumbs` every frame (`sim/baton-hand.ts`, `baton-draw.ts`).
  "batonSwell",
  "batonStripped",
  "batonRefused",
  "batonHeld",
  "batonParted",
  // THE UNDERTOW's two thumbs on the hull, drawn since 22 September 2026 and
  // still silent: which lobe she is pinning and how long she has held his
  // column are state, read off `pinCol` and `freed` every frame and put on
  // the rings themselves (`sim/undertow-hand.ts`, `undertow-grip.ts`).
  // Her other ten are on the first page, with the floor they answer.
  "undertowPinned",
  "undertowFreed",
  // THE THROAT's two hands on the gullet, drawn since 21 September 2026 and
  // still silent: the pinched ring darkens off `cinchBeat` and the mouth's
  // column is derived every frame, so both are already on the picture
  // (`sim/throat-hand.ts`, `throat-draw.ts`, `throat-grip.ts`).
  "throatCinch",
  "throatSlip",
  "throatHaul",
  // And the gullet's own clock, which got sounds on 19 September 2026 and no
  // effects with them: every one of the four is a state the field is already
  // drawing — the breath off the phase and `phaseBeat`, the choke and the
  // swallow off `chokedBeat` and `fedBeat`, the eversion off the phase itself
  // under THE SLOW. A burst here would be a second sentence over a picture
  // that already says it, and changing what the fight *looks* like is a look
  // and goes to VERSUS (`docs/looks.md`).
  "throatInhale",
  "throatChoke",
  "throatSwallow",
  "throatEvert",
  // THE SCUTTLE's ten are read as one family above the loop by
  // `scuttle-fx.ts` (`Effects.scuttle`), the way THE LEAD's are: a burst per
  // event at the socket or the column, the jolt of a throw, the plate that
  // tumbles off on a strike (`docs/spec/bosses.md` §11.30).
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
