import type { DragTarget, SimConfig } from "@neon-spore/sim";

/**
 * **How far each handle is carried** when a film does not say — cut off
 * `scene-drag.ts` when THE THROAT's pump took that file past its 250-line
 * limit, along the seam it already had: everything here is one number per
 * handle, read off the config, and nothing here builds a command.
 */

/**
 * How far a handle is carried when the film does not say: as far as it goes.
 *
 * The three numbers are the simulation's own, and are read off the config
 * rather than repeated here — `packages/sim/test/purity.test.ts` exists to
 * catch exactly the second copy this would otherwise be.
 */
export function tautMilli(target: DragTarget, cfg: SimConfig): number {
  if (target === "lidString") return cfg.lidTautMilli;
  if (target === "wardenTether") return cfg.wardenTautMilli;
  // A held body has no taut at all — it is carried a tile at a time and may be
  // carried again — so what a film that does not say means is one column.
  if (target === "gripBody") return cfg.gripPushMilli;
  // An arrow has no taut either: it does not travel, it is a switch a hand
  // throws, and the distance is the one that counts as thrown
  // (`choirArrowHeard`). The side is read off the target rather than authored —
  // carrying one the wrong way is a thing the *pair* can do and not a thing a
  // film would be written to do.
  if (target === "choirLeft") return -cfg.choirPullMilli;
  if (target === "choirRight") return cfg.choirPullMilli;
  // A balloon's two handles are the arrows' arrangement again, with a body
  // between them: each is carried **outward**, away from the skin, and taut is
  // the stretch at which it gives (`sim/balloon-pull.ts`). The sign is the
  // side, so a film says which handle and never how far.
  if (target === "balloonLeft") return -cfg.balloonTautMilli;
  if (target === "balloonRight") return cfg.balloonTautMilli;
  // THE SINEW's two are pulled down as far as a hand reaches, and a film
  // about this boss almost never wants that: the sum of the two pulls has to
  // land inside a zone, so a page writes `toMilli` for each hand. Left out,
  // it is one hand at the band's limit — the last fibre's own number.
  if (target === "sinewLeft" || target === "sinewRight") return cfg.sinewReachMilli;
  // THE SURGE's bulb is not carried at all: a thumb on the glass charges it
  // and the lift is the gesture (`sim/surge-hand.ts` reads neither distance).
  if (target === "surgeBulb") return 0;
  // THE CURTAIN's hem is the same pull turned over: it is carried **up**, and
  // the gap over the core opens at `curtainLiftMilli` and not a thousandth
  // before (`sim/curtain-hand.ts`). The sign is the direction, so a film that
  // does not say means all the way to the top — and a film that wrote this
  // number positive would be a hand pulling the hem down over the core it is
  // meant to be baring.
  if (target === "curtainHem") return -cfg.curtainLiftMilli;
  // THE HIVE's underside is hauled **down**, and the mass relaxes the
  // thousandth it has come far enough (`sim/hive-hand.ts`); the carry is
  // cumulative from the grab and the deepest it reached is what counts, so a
  // film that does not say means the whole haul. The same handle in the
  // navigator's hand (`hand: 2`) is a pinch on one lobe, which reads no
  // distance at all and is carried this far for nothing.
  if (target === "hiveLobe") return cfg.hiveHaulMilli;
  // THE SPOOL's brake is a depth rather than a distance to anywhere
  // (`sim/spool-hand.ts`), so a film about it writes `toMilli` every time; left
  // out, it is the whole reach, which is the slowest the line runs.
  if (target === "spoolBrake") return cfg.spoolReachMilli;
  // THE HASP's latch is held down, and held is a depth past `haspGripMilli`
  // (`sim/hasp.ts`): left out, a film carries it the whole reach.
  if (target === "haspLatch") return cfg.haspReachMilli;
  // THE RATCHET's catch is the same level on the other seat (`sim/ratchet.ts`),
  // and its pawl is a press that reads no distance at all: the tick it goes
  // down is the whole of it (`sim/ratchet-hand.ts`).
  if (target === "ratchetCatch") return cfg.ratchetReachMilli;
  if (target === "ratchetPawl") return 0;
  // THE SCOUT's line and prime read no distance — a thumb on the little ship
  // is the reel, a thumb off its stern the lit thruster, each held
  // (`sim/scout-hand.ts`).
  if (target === "scoutLine" || target === "scoutPrime") return 0;
  // THE TRAPEZE's swipes are carried **toward the middle**, and count past
  // `trapezeSwipeMilli` (`sim/trapeze-hand.ts`): left out, a film carries one
  // twice that far, a swipe no reader would call short. Its lock reads none.
  if (target === "trapezePushLeft") return 2 * cfg.trapezeSwipeMilli;
  if (target === "trapezePushRight") return -2 * cfg.trapezeSwipeMilli;
  if (target === "trapezeLock") return 0;
  // THE THROAT's mouth is carried **up**, toward what is falling, and has no
  // end but the box it is kept in (`throatAimAt`): left out, a film carries it
  // one widest circle, which is a body reached from where it stood.
  if (target === "throatAim") return -cfg.throatMaxRadiusMilli;
  // THE ANTIPHON's rail is carried down a vein whose length is the
  // candidate's own, so a film writes progress along it, in thousandths, and
  // the runner turns it into a displacement (`sim/scene-aim.ts`): left out,
  // the whole vein, which is the candidate arriving.
  if (target === "antiphonRail") return 1000;
  // THE LATCH's grips are pulled **down**, and a pull carries the tendril no
  // further than `latchReachMilli` (`sim/latch-hand.ts`): left out, a film
  // pulls the whole reach. A hold is a grip pressed and not carried, which a
  // film writes `toMilli: 0` for.
  if (target === "latchGripLeft" || target === "latchGripRight") return cfg.latchReachMilli;
  return cfg.mazeTurnMilli;
}
