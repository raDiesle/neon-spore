import type { World } from "./world.js";

/**
 * How a wave ends, in one place, because two paths reach it.
 *
 * The field's path is `beat.ts`: everything spawned, nothing left standing.
 * A round's path is `step.ts`: the round says it is spent, and there is no
 * field to be empty. Both have to credit the clear and start the same rest, so
 * both call the same two functions rather than each writing the rule out.
 */

/**
 * The wave is over. Credit it and start the rest before the next one.
 *
 * Asked on every beat once the field is clear, so it guards on `restBeat`:
 * only the first beat of a finished wave scores it.
 */
export function noteWaveCleared(world: World): void {
  if (world.restBeat !== 0) return;
  world.balance.wavesCleared += 1;
  world.score += world.cfg.scoreWave;
  world.restBeat = world.beat + world.cfg.waveRestBeats;
}

/**
 * The rest between waves is over — and mark it spent, so the question is not
 * asked again on every following tick while the host gets around to it.
 *
 * It used to be able to stop here instead and wait for two thumbs (THE FORK).
 * It cannot any more, and nothing was lost: the pair's moment moved to the end
 * of the guide, where there is something to have been reading (`briefing.ts`).
 */
export function progressWave(world: World): void {
  if (world.restBeat <= 0 || world.beat < world.restBeat) return;
  world.restBeat = -1;
  world.events.push({ type: "needWave", wave: world.wave + 1 });
}

/**
 * Whether the round on screen has finished and is only being looked at.
 *
 * A round that replaces the whole picture (THE GAUGE, SNAKE, PINBALL) used to
 * take itself off the world the moment its verdict had stood — and the field,
 * with its hull and its ship, came straight back for the three beats of rest
 * before the next wave. On a wave that restarts into itself, which is what the
 * director does all afternoon, that reads as the round dropping out to the
 * wrong picture and back (`docs/spec/interludes.md`: the field is *gone*).
 *
 * So the round stays installed and says it is spent instead. The picture holds
 * until `startWave` puts the next wave's boss in its place, and the wave ends
 * through `noteWaveCleared` here rather than through `beat.ts`'s empty field.
 */
export function roundSpent(world: World): boolean {
  const boss = world.boss;
  if (boss === null) return false;
  if (boss.kind !== "gauge" && boss.kind !== "snake" && boss.kind !== "pinball") return false;
  return boss.phase === "spent";
}

/** The tail of a round's tick: a spent round ends its wave the way a cleared
 * field does, and holds its own picture until the next wave arrives. */
export function endSpentRound(world: World): void {
  if (!roundSpent(world)) return;
  noteWaveCleared(world);
  progressWave(world);
}
