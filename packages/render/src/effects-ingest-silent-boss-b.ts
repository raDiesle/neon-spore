import type { SimEvent } from "@neon-spore/sim";

/**
 * **The bosses' half of the silent list, the second page** — from THE
 * ANTIPHON on.
 *
 * Cut when THE ANTIPHON's ten rows would have put
 * `effects-ingest-silent-boss.ts` over its 250-line limit, the seam the
 * first page itself was cut on: the order the bosses were built in.
 * `INGEST_SILENT` spreads this in place after the first page, so the guard
 * and the type it narrows by are unchanged.
 *
 * Every row means what it means there — *this event leaves nothing behind
 * for the next frame* — and the reasons stay with the rows.
 */
export const INGEST_SILENT_BOSS_B = [
  // THE ANTIPHON's ten leave nothing behind for the next frame here: the
  // body, the organs, the rail and the pits are read off the state every
  // frame, and what outlives a frame — the eruption of every pit — and the
  // bursts are one family read above the loop by `antiphon-fx.ts`, never
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
  // THE HIVE's nine: a breach open or sealed and the swell before one opens
  // are read off the boss every frame, and the bursts, the clench and the
  // jolt are `hive-fx.ts`'s, read above the loop as one family the way THE
  // SCUTTLE's are (`docs/spec/bosses.md` §11.14).
  "hiveEnter",
  "hiveSwell",
  "hiveOpen",
  "hiveSpill",
  "hiveSkin",
  "hiveWrong",
  "hiveSeal",
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
  // THE FILAMENT's ten are one family read above the loop, the way THE
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
  // PINBALL's two hands on the table, silent until the look lane draws them:
  // a slack spring and a tilted table are state, read off `slack` and
  // `tilted` every frame (`sim/pinball-hand.ts`).
  "pinWind",
  "pinNudge",
  "pinTilt",
  // THE SCOUT's two hands on its picture, silent until the look lane draws
  // them: a line on the ship and a primed thruster are state, read off
  // `reeling` and `primeTick` every frame (`sim/scout-hand.ts`).
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
  // THE UNDERTOW's two thumbs on the hull, silent until the look lane draws
  // them: which lobe she is pinning and how long she has held his column are
  // state, read off `pinCol` and `freed` every frame (`sim/undertow-hand.ts`).
  // Her other ten are on the first page, with the floor they answer.
  "undertowPinned",
  "undertowFreed",
] as const satisfies readonly SimEvent["type"][];
