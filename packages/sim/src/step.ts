import { balloonHeard, rubBalloons } from "./balloon-pull.js";
import { beatMetronome, onBeat } from "./beat.js";
import { briefHeard, briefingHolds, guideStepHeard, stepReady } from "./briefing.js";
import { advanceBullets, releaseShot } from "./bullets.js";
import { stepChoirFuse } from "./choir.js";
import { choirArrowHeard, stepChoirWindow } from "./choir-gesture.js";
import { wardCoils } from "./coil.js";
import { applyCommand } from "./commands.js";
import { ticksPerBeat } from "./config.js";
import { fleetHeard } from "./fleet.js";
import { gaugeHolds, gaugeRoundHeard, stepGaugeRound } from "./gauge-round.js";
import { dropLostGrips } from "./grip.js";
import { gripPushHeard } from "./grip-push.js";
import { regenerateHull } from "./hull.js";
import { stepBeam } from "./lance.js";
import { releaseLance } from "./lance-burn.js";
import { lidHeard } from "./lid.js";
import { stepMalfunction } from "./malfunction.js";
import { mazeStringHeard, stepMazeTurn } from "./maze-controls.js";
import { pinballHolds, pinballRoundHeard, stepPinballRound } from "./pinball-round.js";
import { advancePods } from "./pods.js";
import { pulseHolds, pulseRoundHeard, stepPulseRound } from "./pulse-round.js";
import { stepReach } from "./reach.js";
import { snakeHolds, snakeRoundHeard, stepSnakeRound } from "./snake-round.js";
import type { TimedCommand } from "./types.js";
import { stepWardenTether, wardenTetherHeard } from "./warden-rope.js";
import { endSpentRound, progressWave } from "./wave-end.js";
import type { World } from "./world.js";

/** Advance exactly one tick. The only way the world ever changes. */
export function step(world: World, commands: readonly TimedCommand[]): void {
  world.events.length = 0;
  // The wave has not started yet: its introduction is standing, or its guide
  // is up. Nothing reaches the ship — the same rule THE MIRROR plays by while
  // it is presenting — and the only command that means anything is the one
  // that says a seat is reading, or done (`briefing.ts`).
  //
  // The tick still counts, and that is not a detail: a press is scheduled
  // `inputDelayTicks` into the future on both devices at once, so a world that
  // froze its tick counter would be waiting for an ack it had arranged to
  // never reach itself. The wave is what stands still, not the clock. It is
  // also what the ready gate is counted in, so `stepReady` runs after the
  // counter moves, the way `releaseLance` does further down.
  //
  // And nothing below this line runs, `regenerateHull` included. That is the
  // whole of THE FORK's "not a free repair bay" rule, inherited by the shape
  // of the tick rather than by a check anybody has to remember.
  if (briefingHolds(world)) {
    for (const c of commands) {
      if (c.command.kind === "brief") briefHeard(world, c.player, c.command.on ?? true);
      else if (c.command.kind === "guideStep")
        guideStepHeard(world, c.player, c.command.back ?? false);
    }
    world.tick += 1;
    stepReady(world);
    return;
  }
  // THE GAUGE has the world: no spawn, no fall, no shot, no hull resolved.
  // "The field is gone" as an early return rather than a coat of paint
  // (`gauge-round.ts`). Two things still get through — `restart`, so a run is
  // leavable from anywhere, and the metronome, because the beat is the game's
  // heartbeat and the round's own drift hangs off it.
  //
  // It is the one boss that gets its tick here rather than its beat in
  // `stepBoss`: the needle answers a held valve on the tick, and a wave whose
  // whole picture is the round has no field for `onBeat` to advance.
  if (gaugeHolds(world)) {
    for (const c of commands) {
      if (c.command.kind === "restart") applyCommand(world, c);
      else gaugeRoundHeard(world, c.player, c.command);
    }
    world.tick += 1;
    if (world.tick % ticksPerBeat(world.cfg) === 0) beatMetronome(world);
    stepGaugeRound(world);
    // A round that has run its course ends its wave from here: there is no
    // field to be empty, and its picture holds until the next wave arrives.
    endSpentRound(world);
    return;
  }
  // SNAKE has it instead, and the branch is the same shape for the same
  // reasons — the field is gone as an early return, the metronome keeps
  // running, and the body answers a thumb on the *tick* rather than on the
  // beat (`snake-round.ts`). Two branches rather than one that asks which
  // round is up: the two rounds share a shape and not a verb, and a shared
  // branch would have to switch on the boss twice to know whose press it was.
  if (snakeHolds(world)) {
    for (const c of commands) {
      if (c.command.kind === "restart") applyCommand(world, c);
      else snakeRoundHeard(world, c.player, c.command);
    }
    world.tick += 1;
    if (world.tick % ticksPerBeat(world.cfg) === 0) beatMetronome(world);
    stepSnakeRound(world);
    // A round that has run its course ends its wave from here: there is no
    // field to be empty, and its picture holds until the next wave arrives.
    endSpentRound(world);
    return;
  }
  // PINBALL has it third, and the branch is the same shape once more. What is
  // different is why the tick matters here: the other two rounds answer a
  // thumb on the tick, and this one *integrates a body* on it — a beat is 75
  // ticks and a ball stepped at that rate would pass through the table
  // (`pinball-round.ts`).
  if (pinballHolds(world)) {
    for (const c of commands) {
      if (c.command.kind === "restart") applyCommand(world, c);
      else pinballRoundHeard(world, c.player, c.command);
    }
    world.tick += 1;
    if (world.tick % ticksPerBeat(world.cfg) === 0) beatMetronome(world);
    stepPinballRound(world);
    // A round that has run its course ends its wave from here: there is no
    // field to be empty, and its picture holds until the next wave arrives.
    endSpentRound(world);
    return;
  }
  // THE PULSE has it fourth, and the tick matters here for the reason turned
  // inside out: PINBALL steps on the tick because a body moves on it, and this
  // one because *when a thumb landed* is the whole round — judged on the beat
  // it would be judged to within six hundred milliseconds (`pulse-round.ts`).
  if (pulseHolds(world)) {
    for (const c of commands) {
      if (c.command.kind === "restart") applyCommand(world, c);
      else pulseRoundHeard(world, c.player, c.command);
    }
    world.tick += 1;
    if (world.tick % ticksPerBeat(world.cfg) === 0) beatMetronome(world);
    stepPulseRound(world);
    // A round that has run its course ends its wave from here: there is no
    // field to be empty, and its picture holds until the next wave arrives.
    endSpentRound(world);
    return;
  }
  // Commands are read even when the hull is through — otherwise `restart`
  // could never arrive and the game would be stuck on its own end screen.
  for (const c of commands) applyCommand(world, c);
  // THE MAZE's string, and the wheel it turns. Read here rather than in
  // `applyCommand` for the reason THE GAUGE's needle is stepped here: the
  // wheel answers a held thumb on the *tick*, and `stepBoss` runs on the beat
  // (`maze-round.ts`). `valve` is deliberately the same command THE GAUGE
  // turns with — one held verb, one seat, one vocabulary.
  for (const c of commands) mazeStringHeard(world, c.player, c.command);
  stepMazeTurn(world);
  // THE WARDEN's rope, read on the tick for the same reason: how far the hand
  // has carried the handle is how far the hatch stands open, and a gate that
  // only answered on the beat would feel like a queue (`warden.ts`).
  for (const c of commands) wardenTetherHeard(world, c.player, c.command);
  // THE LID's cord, on the tick for the same reason and one step further: the
  // plates part in proportion to the pull and shut the instant the hand lifts,
  // so a gate answered on the beat would open after the moment the pair had
  // just counted themselves into (`lid.ts`).
  for (const c of commands) lidHeard(world, c.player, c.command);
  // And the hand on a body itself, which is the grip carried sideways. Read on
  // the tick with the rest of them so the distance the finger has come is
  // never stale — what it *does* with that distance is on the beat, in
  // `carryGrips`, because a body may only ever stand on a tile centre
  // (`grip-push.ts`).
  for (const c of commands) gripPushHeard(world, c.player, c.command);
  // THE CHOIR's two arrows, read on the tick with the other four hands for
  // their reason: how far the pilot has carried one is never stale, and the
  // window between the two of them is counted in ticks (`choir-gesture.ts`).
  for (const c of commands) choirArrowHeard(world, c.player, c.command);
  stepChoirWindow(world);
  // And a membrane that has finished drawing together, which is where the
  // colour arrives and the body becomes something a shot can reach. On the
  // tick with the window above, because both are lengths counted in ticks and
  // a beat's granularity would let a bolt through a film still closing.
  stepChoirFuse(world);
  // THE BALLOON's two handles, read on the tick with the other five hands and
  // for their reason with the most riding on it: the pair counts itself into
  // the instant both of them pull, and an instant answered on the next beat
  // would land up to a whole beat after the one they said out loud
  // (`balloon-pull.ts`). `rubBalloons` is the answer, straight after the
  // reading, so a body both hands reached is given on the tick they reached
  // it rather than on the tick after.
  for (const c of commands) balloonHeard(world, c.player, c.command);
  rubBalloons(world);
  // THE FLEET's sights and its salvo, read on the tick for the third time and
  // the same reason: a square the pair just named out loud is answered now,
  // not on the next beat. Its clock is the one thing about it that is on the
  // beat, and that runs in `stepBoss` (`fleet.ts`).
  for (const c of commands) fleetHeard(world, c.player, c.command);
  if (world.over) return;
  // Exactly where `fire` used to push the bullet, so a shot laid half a beat
  // ago is indistinguishable from one pressed now by the time anything else
  // in the loop sees it. A run that is over never reaches it (`shot-charge.ts`).
  releaseShot(world);

  world.tick += 1;
  // The beam standing from the last one goes out first, so a column that was
  // burnt a beat ago is clear before this tick can light it again.
  stepBeam(world);
  // Before the beat and before the shots: the lobe fills on the tick counter,
  // so the tick it comes full on is this one, whatever else happens next.
  releaseLance(world);
  const tpb = ticksPerBeat(world.cfg);
  if (world.tick % tpb === 0) {
    onBeat(world);
    // A broken control acts on the beat, straight after the field has moved
    // under it — so the shot goes up the column the cannon is standing in
    // *now* and the dome comes up over the row a body has just stepped onto.
    // Nothing here is a command: `applyCommand` has already run and closed
    // both of these doors to a thumb (`malfunction.ts`).
    stepMalfunction(world);
  }
  // The dome under the plate, on the tick and not on the press. Here rather
  // than in `armShield` because the shield opens a coil by *standing* under
  // it: a plate carried into a coil's column while the window is still open
  // opens it, and so does a coil that crosses into a column the plate is
  // already holding. After the beat, so a body that has just stepped into the
  // shield's column is answered on the beat it is drawn arriving there rather
  // than a whole beat later (`coil.ts`).
  wardCoils(world);

  advanceBullets(world);
  // After the shots, before anything else asks who is holding what: a hand
  // stays on a creature until the creature stops existing.
  dropLostGrips(world);
  // Straight after the shots, so a line whose eye was just hit snaps back in
  // the same tick the plate came off (`stepWardenTether`).
  stepWardenTether(world);
  // The arm before the pods, so a pod let go at the hull on this tick falls
  // through the same `advancePods` every other pod does rather than waiting a
  // tick for the next one (`reach.ts`).
  stepReach(world);
  advancePods(world);
  regenerateHull(world);
  progressWave(world);
}
