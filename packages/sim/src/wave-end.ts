import { beatPhaseTicks } from "./beat-clock.js";
import { beatSeconds } from "./config.js";
import type { Pod } from "./types.js";
import type { World } from "./world.js";

/**
 * How a wave ends, in one place, because two paths reach it.
 *
 * The field's path is `beat.ts`: everything spawned, nothing left standing.
 * A round's path is `step.ts`: the round says it is spent, and there is no
 * field to be empty. Both have to credit the clear and start the same rest, so
 * both call the same two functions rather than each writing the rule out.
 *
 * And what may still be standing when it does: `hangingHusk`, which is the one
 * object on the field that does not hold a wave open.
 */

/**
 * The wave is over. Credit it and start the rest before the next one.
 *
 * Asked on every beat once the field is clear, so it guards on `restBeat`:
 * only the first beat of a finished wave credits it.
 */
export function noteWaveCleared(world: World): void {
  if (world.restBeat !== 0) return;
  world.balance.wavesCleared += 1;
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
 * Whether the rest after a cleared wave is what the pair is looking at.
 *
 * **Asked rather than written out**, the way `lostAsks` is asked for the other
 * screen that stands on a wave that is over (`wave-fail.ts`). The arithmetic is
 * two comparisons and a sentinel that means three different things — `0` live,
 * a beat number through the rest, `-1` once the next wave has been asked for —
 * and a second copy of it in `render/` is a screen that stays up a beat into
 * the wave after it. CLAUDE.md's *called, not re-derived*;
 * `test/copies-table.ts` holds the row.
 */
export function clearHolds(world: World): boolean {
  return world.restBeat > 0 && world.beat < world.restBeat;
}

/**
 * How far into that rest, in seconds — the clock the screen over it falls on
 * (`docs/spec/between-waves.md`).
 *
 * **Derived rather than remembered**, which is the whole reason it is here and
 * not on `Effects`: two phones in lockstep read the same number off the same
 * world, and a restart cannot leave a half-played entrance behind because
 * there is nothing to leave. `world.beat` is a label and never multiplied back
 * into ticks (`beat-clock.ts`); what is used is the *difference* between two
 * labels on the same counter, which is what `progressWave` above compares.
 *
 * The sub-beat part is the tick's own phase. It is exact on the field's path,
 * where the clear is credited on a beat boundary; a round credits its clear on
 * the tick its verdict stands (`endSpentRound`), so the first fraction of a
 * beat of a round's rest can read as already spent. Under a tenth of a second
 * at the tempo the game ships at, and the alternative is a field on the world
 * that every hash would have to carry.
 */
export function restSeconds(world: World): number {
  if (!clearHolds(world)) return 0;
  const beat = beatSeconds(world.cfg);
  const gone = (world.cfg.waveRestBeats - (world.restBeat - world.beat)) * beat;
  const phase = beatPhaseTicks(world.cfg, world.tick) / world.cfg.tickHz;
  return Math.max(0, Math.min(world.cfg.waveRestBeats * beat, gone + phase));
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
  const round =
    boss.kind === "gauge" ||
    boss.kind === "snake" ||
    boss.kind === "pinball" ||
    boss.kind === "pulse" ||
    boss.kind === "scout";
  if (!round) return false;
  return boss.phase === "spent";
}

/** The tail of a round's tick: a spent round ends its wave the way a cleared
 * field does, and holds its own picture until the next wave arrives. */
export function endSpentRound(world: World): void {
  if (!roundSpent(world)) return;
  noteWaveCleared(world);
  progressWave(world);
}

/**
 * Whether this pod is one a wave may end on top of: **a husk still hanging,
 * and only that.**
 *
 * A pod holds the wave open because a pod still hanging is a pod still to be
 * freed and taken. A husk is the opposite errand — the right answer to one is
 * to leave it exactly where it is — so a wave that is otherwise over is not
 * held open by a lie nobody took the bait on. A husk already *falling* holds
 * it like any other pod: it is a thing in the air about to cost the pair a
 * wave or nothing, and clearing over the top of it would decide that with a
 * race between two counters.
 */
export function hangingHusk(p: Pod): boolean {
  return p.husk && !p.loose;
}
