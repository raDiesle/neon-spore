import type { SimEvent } from "@neon-spore/sim";

/**
 * **The bosses' half of the not-a-burst list, the second page** — from THE
 * INSTAR on.
 *
 * Cut when THE FILAMENT's ten rows would have put
 * `effects-spark-silent-boss.ts` over its 250-line limit, the seam
 * `effects-ingest-silent-boss-b.ts` cut a boss earlier: the order the bosses
 * were built in. `SILENT` spreads this in place after the first page, so
 * `isSilent` still narrows and `burstFor`'s `assertNever` still catches an
 * event named on neither.
 *
 * THE INSTAR's eleven came over on 19 September 2026 for the same reason
 * and by the same rule — page one went over, so page one handed its last
 * boss across rather than the lane cutting its own rows out of the middle.
 * THE HIVE's nine followed the same day, when THE TASTER's three hands put
 * page one over again. THE ANTIPHON's ten followed later the same day, when
 * `surgeRock` had already taken page one to exactly 250 lines and the next
 * boss to land there was going to go over regardless of which one it was
 * (`docs/queue.md`).
 *
 * THE GAUGE's four and THE WELL's four went on to a third page on
 * 22 September 2026, when THE SPOOL's eleven and THE HASP's fourteen landed
 * here in the same sitting and left this one two lines under the wall. The
 * seam is the same one: the **last** bosses on the page go, never the boss
 * being worked on (`effects-spark-silent-boss-c.ts`).
 *
 * Every row means what it means there — *no burst answers this event* — and
 * the reasons stay with the rows.
 */
export const SILENT_BOSS_B = [
  // THE HIVE's twelve are one family read above the loop by `hive-fx.ts`,
  // never rows here (`docs/spec/bosses.md` §11.14).
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
  // THE INSTAR's eleven are one family read above the loop by
  // `instar-fx.ts`, never rows here (`docs/spec/bosses.md` §11.32).
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
  // THE FILAMENT's eleven throw no burst from this table: they are one family
  // read above the loop, the way THE INSTAR's are, and every burst of theirs
  // — on the tile drawn, on the head that snapped, on the body a filament
  // came out of — is thrown by `filament-fx.ts` (`docs/spec/bosses.md` §11.33).
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
  // THE GIMBAL's ten throw no burst from this table: they are one family read
  // above the loop, the way THE FILAMENT's and THE HIVE's are, and every burst
  // of theirs — on the cradle's own centre for the marks, the shear and the
  // hatch, and on the column a seam breached — is thrown by `gimbal-fx.ts`,
  // which is also where the kick, the shake and the glare live
  // (`docs/spec/bosses.md` §11.34).
  "gimbalEnter",
  "gimbalMarks",
  "gimbalTrue",
  "gimbalSlip",
  "gimbalShear",
  "gimbalLeak",
  "gimbalSeamOut",
  "gimbalSeamHit",
  "gimbalHatch",
  "gimbalOut",
  // THE SPOOL's eleven: what sparks is one family read above the loop by
  // `spool-fx.ts`, never rows here (`docs/spec/bosses.md` §11.36).
  "spoolEnter",
  "spoolZone",
  "spoolLeg",
  "spoolGrip",
  "spoolLet",
  "spoolSlip",
  "spoolRock",
  "spoolRib",
  "spoolSlack",
  "spoolDrift",
  "spoolOut",
  // THE ANTIPHON's eleven: what sparks is one family read above the loop by
  // `antiphon-fx.ts`, never rows here (`docs/spec/bosses.md` §11.31).
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
  // THE CAIRN held: a hand on the pile bought a beat off its clock and
  // nothing left the body, so there is nothing on the field to remember.
  // What says it is the settle mark that stopped filling (`cairn-settle.ts`),
  // read off the state every frame — a transient would be a second copy of a
  // gauge that is already right.
  "cairnHeld",
  // THE MIRROR's pin throws a ring off both lobes, not a burst: `mirror-grip-fx.ts`.
  "mirrorGrip",
  // THE GORGE's two thumbs and the clench throw theirs from `gorge-fx.ts`,
  // with the sack's other nine — one family, read above the loop.
  "gorgePinch",
  "gorgePry",
  "gorgeClench",
  // THE MAZE's thumb on its heart throws a ring, not a burst: `maze-grip-fx.ts`.
  "mazeGrip",
  // THE WARDEN's thumb, throw and slam throw a ring off the eye, not a burst: `warden-grip-fx.ts`.
  "wardenHold",
  "wardenThrow",
  "wardenSlam",
  // THE FLEET's five throw no burst from this table: they are one family read
  // above the loop, the way THE WARDEN's three are, and the particles the
  // flood, the rake, the plug and the wreck throw — the thumb on the plume
  // throws none, a thumb being no impact — go out of `fleet-grip-fx.ts` with
  // the ring each of them is (`docs/spec/bosses.md` §11.6).
  "fleetFlood",
  "fleetBreach",
  "fleetRake",
  "fleetPlug",
  "fleetWreck",
  // THE VANE's two hands, no burst until the look lane draws them.
  "vanePin",
  "vaneSlip",
  "vaneHaul",
  // The knock's picture is the blow on the hub and a pin fewer drawn.
  "vaneKnock",
  // SNAKE's two hands, no burst until the look lane draws them.
  "snakePrise",
  "snakeLift",
  "snakeDrop",
  // PINBALL's two hands, drawn since 22 September 2026 and still no burst:
  // the ring is already saying both, and a tilt takes it away (`pinball-grip.ts`).
  "pinWind",
  "pinNudge",
  "pinTilt",
  // THE SCOUT's two hands, drawn since 22 September 2026 and still no burst:
  // each stands on a ring that is already saying it (`scout-grip.ts`).
  "scoutReel",
  "scoutSlip",
  "scoutPrime",
  // THE PULSE's hand on the bar, no burst until the look lane draws it.
  "pulseBrace",
  "pulseSlip",
  "pulseArrest",
  // THE BATON's arm under a thumb: no burst, for the same reason its eleven
  // next door throw none — the arm is read off the boss every frame.
  "batonSwell",
  "batonStripped",
  "batonRefused",
  "batonHeld",
  "batonParted",
  // THE UNDERTOW's two thumbs, drawn since 22 September 2026 and still no
  // burst: each stands on a ring that is already saying it (`undertow-grip.ts`
  // draws a pinned lobe `held`, and the free's dial *is* the count).
  "undertowPinned",
  "undertowFreed",
  // THE THROAT's two hands, drawn since 21 September 2026 and still no burst:
  // both stand on the tube, which is a fixture the field draws every frame,
  // and on a ring of their own (`throat-grip.ts`).
  "throatCinch",
  "throatSlip",
  "throatHaul",
  // And its clock's four, no burst for the same reason: the breath, the choke,
  // the swallow and the eversion are all states of a fixture the field redraws
  // every frame, and a shower over any of them is a look (`docs/looks.md`).
  "throatInhale",
  "throatChoke",
  "throatSwallow",
  "throatEvert",
  // THE HASP's fourteen throw no burst from this table: every burst of
  // theirs — over the latch that burnt, the rim that seized, the clasp that
  // swung off, the bolt at the hull — is thrown by `hasp-fx.ts`, above the
  // loop like THE GIMBAL's, and split between the seats the way the fight
  // is (`docs/spec/bosses.md` §11.37).
  "haspEnter",
  "haspLit",
  "haspGrip",
  "haspLet",
  "haspBurn",
  "haspCool",
  "haspSeize",
  "haspFree",
  "haspOpen",
  "haspBolt",
  "haspBoltOut",
  "haspBoltHit",
  "haspClear",
  "haspOut",
] as const satisfies readonly SimEvent["type"][];
