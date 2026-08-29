import { beatMetronome, onBeat } from "./beat.js";
import { ackBriefing, briefingHolds } from "./briefing.js";
import { advanceBullets, releaseShot } from "./bullets.js";
import { applyCommand } from "./commands.js";
import { ticksPerBeat } from "./config.js";
import { restEnded } from "./fork.js";
import { gaugeHolds, gaugeRoundHeard, stepGaugeRound } from "./gauge-round.js";
import { dropLostGrips } from "./grip.js";
import { regenerateHull } from "./hull.js";
import { noteLanceFull } from "./lance.js";
import { mazeStringHeard, stepMazeTurn } from "./maze-controls.js";
import { advancePods } from "./pods.js";
import type { TimedCommand } from "./types.js";
import { pullTether } from "./warden.js";
import type { World } from "./world.js";

/** Advance exactly one tick. The only way the world ever changes. */
export function step(world: World, commands: readonly TimedCommand[]): void {
  world.events.length = 0;
  // A card is up. Nothing reaches the ship — the same rule THE MIRROR plays by
  // while it is presenting — and the only command that means anything is the
  // one that puts the card away.
  //
  // The tick still counts, and that is not a detail: a press is scheduled
  // `inputDelayTicks` into the future on both devices at once, so a world that
  // froze its tick counter would be waiting for a dismissal it had arranged to
  // never reach itself. The wave is what stands still, not the clock.
  if (briefingHolds(world)) {
    for (const c of commands) if (c.command.kind === "brief") ackBriefing(world, c.player);
    world.tick += 1;
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
  // The Warden's rescue is the one hold measured in ticks rather than beats,
  // because it accumulates: see `wardenPullBeats`.
  pullTether(world);
  advancePods(world);
  regenerateHull(world);
  progressWave(world);
}

/**
 * The rest between waves is over — and mark it spent, so the question is not
 * asked again on every following tick while the host gets around to it.
 *
 * What happens next is `restEnded`'s and not this file's: either the host is
 * asked for the next queue, as it always was, or the run stops and waits for
 * both thumbs. See `fork.ts`.
 */
function progressWave(world: World): void {
  if (world.restBeat <= 0 || world.beat < world.restBeat) return;
  world.restBeat = -1;
  restEnded(world);
}
