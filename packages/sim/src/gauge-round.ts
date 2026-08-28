import { ticksPerBeat } from "./config.js";
import type { GaugePhase, GaugeState } from "./gauge.js";
import { gaugeHeard, openGauge, stepGauge } from "./gauge.js";
import { breachHull } from "./hull.js";
import type { Command } from "./types.js";
import type { World } from "./world.js";

/**
 * THE GAUGE's clock: the three phases, the way in and the way out.
 *
 * It used to be a *shell* — `interlude.ts`, a category eleven more rounds
 * would enter through, reached by asking whether the gap in front of the next
 * wave carried one. The category is gone. A round that is not the field is a
 * **boss wave** now, and the eleven behind this one are eleven bosses: a wave
 * names `boss: { kind: "gauge" }`, `startWave` installs it, and everything
 * that used to be about reaching a round is now about reaching a wave, which
 * the game already knew how to do. `docs/decisions.md` #20 has the argument.
 *
 * What survives that change is everything the round is actually made of, and
 * that is the point of it: the field is still gone, the picture is still the
 * round's own, and the two seats still hold different halves.
 *
 * **The field is gone, and it costs nothing to make it gone.** `step` returns
 * before it reaches a single rule of the field, so `bullets.ts`, `beat.ts` and
 * `hull.ts` never learn this round exists. That is free because a gauge wave
 * carries no queue and no pods: there is never a rock in the air to answer for.
 *
 * **The clock keeps running, the wave does not.** `world.beat` advances
 * through the round exactly as it does through THE FORK — the metronome is the
 * game's heartbeat and the ear would notice ninety seconds of silence — but
 * `onBeat`'s field work does not run, so nothing spawns, falls or reaches the
 * hull. `world.waveBeat` stands still.
 *
 * **And the pair can lose the run in here.** That is the one rule that was
 * retired by name. The round draws no hull and the hull is still at stake:
 * the field's picture is absent, `world.hullMilli` persists underneath it, and
 * running out of time breaks it by `cfg.damageGauge` in the middle column —
 * the same call THE MIRROR and THE MAZE make when a boss with no body has to
 * cost the ship something. So a run can end in a round, the scar is on the
 * hull when the field comes back, and "it was only an interlude" is no longer
 * a thing anybody can say about a screen they just failed.
 */

/**
 * Beats of quiet before the round begins. The pair needs long enough to read
 * two screens that have just stopped being the field and to notice that they
 * do not say the same thing.
 */
export const GAUGE_LEAD_BEATS = 4;

/** Beats the result stands before the wave gives way to the next one. */
export const GAUGE_VERDICT_BEATS = 5;

/**
 * Whether the round has the world. The whole of whether `step` runs the field
 * at all, so it is asked once, in one place — and it is a question about the
 * boss, because that is now the only thing a round is.
 */
export function gaugeHolds(world: World): boolean {
  return world.boss !== null && world.boss.kind === "gauge";
}

/** The round, if it is the one running. Narrowing in one place rather than six. */
export function gaugeRound(world: World): GaugeState | null {
  const boss = world.boss;
  return boss !== null && boss.kind === "gauge" ? boss : null;
}

/**
 * Install it. Called by `startWave` from the wave's own `boss:` entry, exactly
 * as the queen, the warden, the vane, the mirror and the maze are — there is
 * no second door into this round any more, and that is most of what this
 * change bought.
 */
export function installGauge(world: World): GaugeState {
  return openGauge(world);
}

/** Beats the pair has been in this round. Display only. */
export function gaugeBeats(world: World): number {
  const round = gaugeRound(world);
  return round === null ? 0 : world.beat - round.openBeat;
}

/**
 * One tick of the round.
 *
 * Called from `step`'s own early return rather than from `stepBoss`, because
 * the needle moves on the *tick* and `stepBoss` runs on the beat. A valve that
 * only answered on the beat would feel like a queue rather than a hand on
 * something.
 */
export function stepGaugeRound(world: World): void {
  const round = gaugeRound(world);
  if (round === null) return;
  const since = world.beat - round.phaseBeat;

  if (round.phase === "lead") {
    if (since >= GAUGE_LEAD_BEATS) enterPhase(round, "play", world.beat);
    return;
  }
  if (round.phase === "verdict") {
    if (since >= GAUGE_VERDICT_BEATS) closeGauge(world);
    return;
  }

  const onBeat = world.tick % ticksPerBeat(world.cfg) === 0;
  const verdict = stepGauge(world, round, onBeat);
  if (verdict === null) return;
  round.passed = verdict;
  if (!verdict) spendHull(world);
  enterPhase(round, "verdict", world.beat);
}

/**
 * What running out of time costs, and it is the hull.
 *
 * The middle column, because the round has none of its own — the whole reason
 * the no-travel rule does not reach in here is that there are no columns to
 * talk about (`docs/decisions.md` #21). A number would have been enough for
 * the arithmetic; the scar is what makes it *read*, because it is still on the
 * hull when the field comes back and the pair can see what the round took.
 */
function spendHull(world: World): void {
  const col = Math.floor(world.cfg.cols / 2);
  breachHull(world, col, "meteorFastest", 0, world.cfg.damageGauge);
}

/**
 * The round is over: the boss goes, and the wave clears on the next beat
 * exactly as any other boss wave does once the last of it is off the field
 * (`beat.ts`). Passing and failing leave by the same door — what failing cost
 * was already taken, on the beat the time ran out.
 */
export function closeGauge(world: World): void {
  if (!gaugeHolds(world)) return;
  world.boss = null;
}

/**
 * One control, as the round heard it. Nothing reaches it outside `play`: the
 * lead-in is for reading two screens and the verdict is for looking at one, and
 * a press that counted during either would be a press nobody meant.
 */
export function gaugeRoundHeard(world: World, player: 1 | 2, command: Command): void {
  const round = gaugeRound(world);
  if (round === null || round.phase !== "play") return;
  gaugeHeard(world, round, player, command);
}

export function enterPhase(round: GaugeState, phase: GaugePhase, beat: number): void {
  round.phase = phase;
  round.phaseBeat = beat;
}
