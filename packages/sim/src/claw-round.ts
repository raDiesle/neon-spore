import {
  type ClawPhase,
  type ClawState,
  clawHeard,
  clawRound,
  openClaw,
  stepClaw,
} from "./claw.js";
import { midCol, ticksPerBeat } from "./config.js";
import { breachHull } from "./hull.js";
import type { Command } from "./types.js";
import type { World } from "./world.js";

/**
 * THE CLAW's clock: the four phases, the way in and the way out.
 *
 * The sibling of `gauge-round.ts`, and deliberately the same shape — a round
 * that is not the field takes the whole of `step` for as long as it stands,
 * and the three that already do it are the argument for the fourth doing it
 * identically rather than inventing a way in of its own.
 *
 * **The field is gone, and it costs nothing to make it gone.** `step` returns
 * before it reaches a single rule of the field, so `bullets.ts`, `beat.ts` and
 * the fall loop never learn this round exists. That is free because a claw
 * wave carries no queue and no pods: there is never a rock in the air to
 * answer for.
 *
 * **The clock keeps running, the wave does not.** `world.beat` advances
 * through the round exactly as it does through a wave's opening — the
 * metronome is the game's heartbeat, and the field's own shifting hangs off
 * it — but `onBeat`'s field work does not run. `world.waveBeat` stands still.
 *
 * **And the pair can lose the run in here.** The round draws no hull and the
 * hull is still at stake, twice over: a rock raised breaks it by
 * `damageClawRock` on the spot (`claw.ts`), and running out of time breaks it
 * by `damageClaw`. Both scars are on the hull when the field comes back.
 */

/**
 * Beats of quiet before the round begins. The pair needs long enough to read
 * two screens that have just stopped being the field and to notice that they
 * do not say the same thing. THE GAUGE's four, for THE GAUGE's reason.
 */
export const CLAW_LEAD_BEATS = 4;

/** Beats the result stands before the wave gives way to the next one. */
export const CLAW_VERDICT_BEATS = 5;

/**
 * Whether the round has the world. The whole of whether `step` runs the field
 * at all, so it is asked once, in one place — and it is a question about the
 * boss, because that is the only thing a round is.
 */
export function clawHolds(world: World): boolean {
  return world.boss !== null && world.boss.kind === "claw";
}

/**
 * Install it. Called by `startWave` from the wave's own `boss:` entry, exactly
 * as the other eight are.
 */
export function installClaw(world: World): ClawState {
  return openClaw(world);
}

/** Beats the pair has been in this round. Display only. */
export function clawBeats(world: World): number {
  const round = clawRound(world);
  return round === null ? 0 : world.beat - round.openBeat;
}

/**
 * One tick of the round.
 *
 * Called from `step`'s own early return rather than from `stepBoss`, because
 * the claw answers a press on the *tick* and `stepBoss` runs on the beat. A
 * machine that only moved on the beat would feel like a queue rather than a
 * hand on something.
 */
export function stepClawRound(world: World): void {
  const round = clawRound(world);
  if (round === null) return;
  const since = world.beat - round.phaseBeat;

  if (round.phase === "lead") {
    if (since >= CLAW_LEAD_BEATS) {
      // The clock and the drift both start when the play does, not when the
      // picture arrived: a lead-in that spent four beats of the round would be
      // a round whose first shift happened while nobody could press anything.
      round.openBeat = world.beat;
      round.driftBeat = world.beat;
      enterClawPhase(round, "play", world.beat);
    }
    return;
  }
  // Over, and only being looked at. The round stays installed so the field
  // does not come back for the beats of rest (`wave-end.ts`).
  if (round.phase === "spent") return;
  if (round.phase === "verdict") {
    if (since >= CLAW_VERDICT_BEATS) enterClawPhase(round, "spent", world.beat);
    return;
  }

  const onBeat = world.tick % ticksPerBeat(world.cfg) === 0;
  const verdict = stepClaw(world, round, onBeat);
  if (verdict === null) return;
  round.passed = verdict;
  if (!verdict) spendHull(world);
  enterClawPhase(round, "verdict", world.beat);
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
  breachHull(world, midCol(world.cfg), "meteorFastest", 0, world.cfg.damageClaw);
}

/**
 * Take the round off the world outright, picture and all.
 *
 * Not how a round ends — one that has run its course goes to `spent` and stays
 * on screen until the next wave replaces it (`wave-end.ts`). This is for a run
 * being *left*: `restart` in `commands.ts`, which has to clear a boss that
 * holds the whole of `step` before the host answers `needWave`.
 */
export function closeClaw(world: World): void {
  if (!clawHolds(world)) return;
  world.boss = null;
}

/**
 * One control, as the round heard it. Nothing reaches it outside `play`: the
 * lead-in is for reading two screens and the verdict is for looking at one, and
 * a press that counted during either would be a press nobody meant.
 */
export function clawRoundHeard(world: World, player: 1 | 2, command: Command): void {
  const round = clawRound(world);
  if (round === null || round.phase !== "play") return;
  clawHeard(world, round, player, command);
}

export function enterClawPhase(round: ClawState, phase: ClawPhase, beat: number): void {
  round.phase = phase;
  round.phaseBeat = beat;
}
