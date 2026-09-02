import { beatMetronome, onBeat } from "./beat.js";
import { briefHeard, briefingHolds, stepReady } from "./briefing.js";
import { advanceBullets, releaseShot } from "./bullets.js";
import { applyCommand } from "./commands.js";
import { ticksPerBeat } from "./config.js";
import { fleetHeard } from "./fleet.js";
import { gaugeHolds, gaugeRoundHeard, stepGaugeRound } from "./gauge-round.js";
import { dropLostGrips } from "./grip.js";
import { regenerateHull } from "./hull.js";
import { noteLanceFull } from "./lance.js";
import { mazeStringHeard, stepMazeTurn } from "./maze-controls.js";
import { pinballHolds, pinballRoundHeard, stepPinballRound } from "./pinball-round.js";
import { advancePods } from "./pods.js";
import { snakeHolds, snakeRoundHeard, stepSnakeRound } from "./snake-round.js";
import type { TimedCommand } from "./types.js";
import { stepWardenTether, wardenTetherHeard } from "./warden.js";
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
  // counter moves, the way `noteLanceFull` does further down.
  //
  // And nothing below this line runs, `regenerateHull` included. That is the
  // whole of THE FORK's "not a free repair bay" rule, inherited by the shape
  // of the tick rather than by a check anybody has to remember.
  if (briefingHolds(world)) {
    for (const c of commands) {
      if (c.command.kind === "brief") briefHeard(world, c.player, c.command.on ?? true);
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
  // Before the beat and before the shots: the lobe fills on the tick counter,
  // so the tick it comes full on is this one, whatever else happens next.
  noteLanceFull(world);
  const tpb = ticksPerBeat(world.cfg);
  if (world.tick % tpb === 0) onBeat(world);

  advanceBullets(world);
  // After the shots, before anything else asks who is holding what: a hand
  // stays on a creature until the creature stops existing.
  dropLostGrips(world);
  // Straight after the shots, so a line whose eye was just hit snaps back in
  // the same tick the plate came off (`stepWardenTether`).
  stepWardenTether(world);
  advancePods(world);
  regenerateHull(world);
  progressWave(world);
}

/**
 * The rest between waves is over — and mark it spent, so the question is not
 * asked again on every following tick while the host gets around to it.
 *
 * It used to be able to stop here instead and wait for two thumbs (THE FORK).
 * It cannot any more, and nothing was lost: the pair's moment moved to the end
 * of the guide, where there is something to have been reading (`briefing.ts`).
 */
function progressWave(world: World): void {
  if (world.restBeat <= 0 || world.beat < world.restBeat) return;
  world.restBeat = -1;
  world.events.push({ type: "needWave", wave: world.wave + 1 });
}
