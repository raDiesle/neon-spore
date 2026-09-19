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
 * Every row means what it means there — *no burst answers this event* — and
 * the reasons stay with the rows.
 */
export const SILENT_BOSS_B = [
  // THE HIVE's nine are one family read above the loop by `hive-fx.ts`,
  // never rows here (`docs/spec/bosses.md` §11.14).
  "hiveEnter",
  "hiveSwell",
  "hiveOpen",
  "hiveSpill",
  "hiveSkin",
  "hiveWrong",
  "hiveSeal",
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
  // THE FILAMENT's ten throw no burst from this table: they are one family
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
  "filamentPulled",
  "filamentDown",
  "filamentOut",
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
  // SNAKE's two hands, no burst until the look lane draws them.
  "snakePrise",
  "snakeLift",
  "snakeDrop",
  // PINBALL's two hands, no burst until the look lane draws them.
  "pinWind",
  "pinNudge",
  "pinTilt",
  // THE SCOUT's two hands, no burst until the look lane draws them.
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
  // THE UNDERTOW's two thumbs, no burst until the look lane draws them: the
  // pin stands on a lobe the field is already drawing.
  "undertowPinned",
  "undertowFreed",
  // THE THROAT's two hands, no burst until the look lane draws them: both
  // stand on the tube, which is a fixture the field draws every frame.
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
  // THE GAUGE's four, the first events this round has had at all: no burst,
  // because a mark, a miss, a jam and a bind are every one of them a state the
  // plate already redraws every frame (`render/gauge.ts`). Sound is what was
  // missing, and it is bound instead (`packages/audio/src/bind-gauge.ts`).
  "gaugeMark",
  "gaugeMiss",
  "gaugeJam",
  "gaugeBind",
] as const satisfies readonly SimEvent["type"][];
