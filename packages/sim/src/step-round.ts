import { beatMetronome } from "./beat.js";
import { isBeatTick } from "./beat-clock.js";
import { applyCommand } from "./commands.js";
import { gaugeHolds, gaugeRoundHeard, stepGaugeRound } from "./gauge-round.js";
import { pinballHolds, pinballRoundHeard, stepPinballRound } from "./pinball-round.js";
import { pulseHolds, pulseRoundHeard, stepPulseRound } from "./pulse-round.js";
import { snakeHolds, snakeRoundHeard, stepSnakeRound } from "./snake-round.js";
import { stepTellRound, tellHolds, tellRoundHeard } from "./tell-round.js";
import type { Command, TimedCommand } from "./types.js";
import { endSpentRound } from "./wave-end.js";
import type { World } from "./world.js";

/**
 * The rounds' own tick, and the one thing all five of them have in common.
 *
 * **Five copies of one branch, and this is the fifth one's doing.** `step.ts`
 * carried THE GAUGE, SNAKE, PINBALL and THE PULSE as four hand-written early
 * returns that differed in three identifiers and in nothing else — read the
 * commands, count the tick, ring the metronome, step the round, end a spent
 * one. THE TELL would have been a fifth, and nine more rounds are designed. A
 * rule spelled out five times is a rule that drifts on the sixth, which is
 * `CLAUDE.md`'s *called, not re-derived* said about control flow rather than
 * about arithmetic.
 *
 * **What the branch actually says**, once, so no round has to repeat it:
 *
 * - The field is **gone** as an early return, not dimmed and not re-skinned —
 *   no spawn, no fall, no shot, no hull resolved (`docs/spec/interludes.md`).
 * - `restart` still gets through, so a run is leavable from anywhere.
 * - The metronome keeps running, because the beat is the game's heartbeat and
 *   every round's own clock hangs off it. Ninety seconds of silence is a thing
 *   the ear would notice.
 * - The round is stepped on the **tick**, from here rather than from
 *   `stepBoss`. Each of the five wants that resolution for its own reason and
 *   the table below says which.
 * THE MIRROR is not in the table and is not an oversight: it *suspends* the
 * field rather than replacing it, so it is a boss stepped on the beat like the
 * queen and the warden (`docs/spec/bosses.md` 11.3).
 *
 * - A round that has run its course ends its wave from here: there is no field
 *   to be empty, so `endSpentRound` does what an empty field does elsewhere.
 */

interface RoundStep {
  /** Whether this round has the world. Asked in order, first answer wins. */
  holds: (world: World) => boolean;
  /** One command, as this round hears it. Whose press counts is its own rule. */
  heard: (world: World, player: 1 | 2, command: Command) => void;
  /** One tick of it. */
  step: (world: World) => void;
}

/**
 * The five, and why each of them is stepped on the tick rather than the beat.
 *
 * - **THE GAUGE** — the needle answers a *held* valve, and a valve that only
 *   answered on the beat would feel like a queue rather than a hand on
 *   something.
 * - **SNAKE** — the body moves on its own step counter, which is finer than a
 *   beat and has to be.
 * - **PINBALL** — it *integrates a body*: a beat is 75 ticks and a ball
 *   stepped at that rate would pass through the table.
 * - **THE PULSE** — the whole round is *when a thumb landed*, and a press
 *   judged on the beat is judged to within six hundred milliseconds, which is
 *   not a judgement.
 * - **THE TELL** — the exchange itself lands on a beat boundary, because a
 *   window is counted in beats; what it needs the tick for is the press. A
 *   thumb that came down on the last tick of a window locked inside it, and a
 *   press read on the next beat would be a throw the pair did not make.
 */
const ROUNDS: readonly RoundStep[] = [
  { holds: gaugeHolds, heard: gaugeRoundHeard, step: stepGaugeRound },
  { holds: snakeHolds, heard: snakeRoundHeard, step: stepSnakeRound },
  { holds: pinballHolds, heard: pinballRoundHeard, step: stepPinballRound },
  { holds: pulseHolds, heard: pulseRoundHeard, step: stepPulseRound },
  { holds: tellHolds, heard: tellRoundHeard, step: stepTellRound },
];

/**
 * One tick of whichever round is installed, or `false` when none is and the
 * field's own tick should run.
 *
 * A boolean rather than a thrown early return, so `step` reads as *if a round
 * has the world, it has had its tick* — one line where there were four
 * near-identical blocks.
 */
export function stepRound(world: World, commands: readonly TimedCommand[]): boolean {
  const round = ROUNDS.find((r) => r.holds(world));
  if (round === undefined) return false;
  for (const c of commands) {
    if (c.command.kind === "restart") applyCommand(world, c);
    else round.heard(world, c.player, c.command);
  }
  world.tick += 1;
  if (isBeatTick(world.cfg, world.tick)) beatMetronome(world);
  round.step(world);
  endSpentRound(world);
  return true;
}
