import { balloonHeard } from "./balloon-pull.js";
import { rubBalloons } from "./balloon-rub.js";
import { onBeat } from "./beat.js";
import { isBeatTick } from "./beat-clock.js";
import { settleSpentBeatboxes } from "./beatbox-round.js";
import { briefHeard, briefingHolds, guideStepHeard, stepReady } from "./briefing.js";
import { advanceBullets, releaseShot } from "./bullets.js";
import { stepChoirFuse } from "./choir.js";
import { choirArrowHeard, stepChoirWindow } from "./choir-gesture.js";
import { stepClingers } from "./cling.js";
import { wardCoils } from "./coil.js";
import { applyCommand } from "./commands.js";
import { crankHeard } from "./crank.js";
import { fleetHeard } from "./fleet.js";
import { dropLostGrips } from "./grip.js";
import { gripPushHeard } from "./grip-push.js";
import { gumHeard } from "./gum.js";
import { stepBeam } from "./lance.js";
import { releaseLance } from "./lance-burn.js";
import { lidHeard, stepLidPulls } from "./lid.js";
import { stepMalfunction } from "./malfunction.js";
import { mazeStringHeard, stepMazeTurn } from "./maze-controls.js";
import { advancePods } from "./pods.js";
import { stepReach } from "./reach.js";
import { stepRound } from "./step-round.js";
import type { TimedCommand } from "./types.js";
import { stepWardenTether, wardenTetherHeard } from "./warden-rope.js";
import { progressWave } from "./wave-end.js";
import { countPlay, failHolds, stepFailHold } from "./wave-fail.js";
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
  // And nothing below this line runs. That was the whole of THE FORK's "not a
  // free repair bay" rule while the hull mended, inherited by the shape of the
  // tick rather than by a check anybody had to remember.
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
  // A hit has failed the wave. The field stands where it was struck, for the
  // same reason and by the same shape as the opening above — the tick counts,
  // nothing else moves — until the pause is spent and the same wave has been
  // asked for again (`wave-fail.ts`).
  if (failHolds(world)) {
    world.tick += 1;
    stepFailHold(world);
    return;
  }
  countPlay(world);
  // A round has the world: no spawn, no fall, no shot, no hull resolved.
  // "The field is gone" as an early return rather than a coat of paint, and
  // five of them now share the shape — which round is up, whose press it is,
  // and what its own tick does are a table in `step-round.ts`.
  if (stepRound(world, commands)) return;
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
  // THE CLAW's crank, read on the tick with the hands on the field and for
  // their reason: what winds the rope is the step from one bearing to the
  // next, and a turn answered on the beat would come down in seventy-five-tick
  // lurches under a finger that is going round smoothly (`crank.ts`). It is
  // the one `drag` in the game that is a hand on a *control* rather than on
  // something the field is carrying.
  for (const c of commands) crankHeard(world, c.player, c.command);
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
  // And player 2's hand on a stuck gum, on the tick for the balloon's reason:
  // a swipe is an instant, and one answered on the next beat would let the
  // cannon slide out from under it in between (`gum.ts`).
  for (const c of commands) gumHeard(world, c.player, c.command);
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
  if (isBeatTick(world.cfg, world.tick)) {
    // The clingers judge their controls before the field moves, so one that
    // takes hold on this beat has its first beat of fuse counted on the next
    // — a beat the pair has seen it standing there (`cling.ts`).
    stepClingers(world);
    onBeat(world);
    // After the field has fallen, and only then: a held cord rides its lid
    // down and has to stay on the field as it goes (`lid.ts`).
    stepLidPulls(world);
    // A broken control acts on the beat, straight after the field has moved
    // under it — so the shot goes up the column the cannon is standing in
    // *now* and the dome comes up over the row a body has just stepped onto.
    // Nothing here is a command: `applyCommand` has already run and closed
    // both of these doors to a thumb (`malfunction.ts`).
    stepMalfunction(world);
  }
  // **Every soundbox whose run has stopped, judged on the tick rather than on
  // the beat.** A run that skipped a beat is over the moment that beat's
  // window shuts, a fifth of a second past the boundary, and the owner's
  // report is the whole reason this call is here rather than only inside
  // `onBeat`: an answer given at the next boundary is a whole beat late, and
  // on this creature a beat late is an answer about a different beat
  // (`beatbox-round.ts`).
  //
  // After the beat above rather than before it, so a box that settles on the
  // same tick it also steps a row is settled where the pair watched it land.
  // `onBeat` still calls it too, and that call is not redundant: it runs
  // *between* the fall and `resolveHull`, so a box the pair got right on its
  // last beat is silenced rather than charged to the hull.
  settleSpentBeatboxes(world);
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
  progressWave(world);
}
