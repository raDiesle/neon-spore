import type { GaugeState } from "./gauge.js";
import { gaugeBound, gaugeWoundOpen } from "./gauge-band.js";
import { gaugeCalled } from "./gauge-call.js";
import { gaugeTongueHeard, releaseTongue } from "./gauge-tongue.js";
import { gaugeToothHeard, releaseTooth } from "./gauge-tooth.js";
import type { Command } from "./types.js";
import type { World } from "./world.js";

/**
 * **THE GAUGE's thumbs on the dial itself**, and the state that asks for the
 * band's (`docs/spec/interludes.md`, `.claude/skills/new-boss` §6.2).
 *
 * The round shipped as one state and two panel controls: the pilot holds the
 * valve, the navigator presses the call, ninety seconds of *left — less —
 * less — now*. The state below is entered by the pair's own last answer
 * rather than by a clock, which is the whole of why it is worth having: the
 * round is never in a state the two of them did not just put it in.
 *
 * **The jam is gone.** A tooth pulled wrong, or a tooth or the tongue left in,
 * stuck the valve, and the needle was then the pilot's hand. On 2 October
 * 2026 the owner made a mistake lose the round instead, for every boss — *a
 * miss makes the boss wave fail and requires retry* — so nothing could reach
 * the jam, and it went with its gesture, its settle and its cue.
 *
 * - **The bind**, hers. Every `gaugeBindMarks` marks the band winds tight to
 *   `gaugeBoundSpanMilli`, and her thumb on it holds it open — full width, and
 *   the walk stopped — for as long as she keeps it there. **She cannot call
 *   while it is down**, which is the whole price and the reason it is a
 *   gesture rather than a button: the pair has to agree out loud on the moment
 *   she lets go, and that moment is the only thing in the round she does not
 *   decide alone.
 *
 * The gesture is made on the *picture* and not on the panel, on the half of
 * it the navigator's seat is shown (`render/gauge.ts`). A thumb from the wrong
 * seat is ignored rather than refused loudly — there is nothing drawn on that
 * seat's screen to have pressed, and a red ring or a refusal's sound would
 * tell the pilot where the band is, the thing the round keeps from him (28
 * September 2026).
 * A thumb that lands is said, `gaugeHold`, so the ring it lands on can wash
 * green the way every mark's does (`render/gauge-marks.ts`).
 */

/**
 * **The three of them, by name**, for the STATES sheet: a state of a boss is
 * any named condition the pair meets a different gesture in, and these are not
 * the round's clock (`GAUGE_PHASES`). The second axis is a second table out of
 * the simulation, as SNAKE's grips and THE PULSE's hearts are — never a list
 * written by hand on the director's side (`boss-phases.ts`).
 *
 * There is no neutral name here — the ordinary state of the round is the
 * round, `play`. `bound` is the band's. `loose` is the rest's: a tooth waiting
 * to be pulled between two levels (`gauge-tooth.ts`). `twisting` is both
 * seats': the tongue out in the rest after the second, waiting for two hands
 * wrung opposite ways (`gauge-tongue.ts`).
 */
export const GAUGE_GRIPS = ["bound", "loose", "twisting"] as const;
export type GaugeGrip = (typeof GAUGE_GRIPS)[number];

/** Whether the band is asked of the navigator's thumb: live, and wound tight. */
export function gaugeBandAsks(gauge: GaugeState): boolean {
  return gauge.phase === "play" && gaugeBound(gauge) && gaugeWoundOpen(gauge);
}

/**
 * The two panel controls, and the two seats they belong to.
 *
 * The seat check is a rule of the simulation rather than a coat of paint on
 * the picture, for the reason the rest of the split is: a pilot who could call
 * would be playing both halves of a round whose only content is that he cannot
 * see the marks, and both devices have to agree exactly which presses counted.
 * The call itself is next door (`gauge-call.ts`). Here beside the two thumbs
 * since THE GAUGE's loose tooth took `gauge.ts` to the line: both are what a
 * seat's press does to the round.
 */
export function gaugeHeard(world: World, gauge: GaugeState, player: 1 | 2, command: Command): void {
  if (command.kind === "valve") {
    // The pilot turns. A valve from the navigator is not refused loudly — she
    // has no valve drawn on her screen at all, so there is nothing to refuse.
    if (player !== 1) return;
    gauge.valve = command.on ? command.dir : 0;
    return;
  }
  if (command.kind === "call" && player === 2) gaugeCalled(world, gauge, command.color);
}

/**
 * One drag on the dial, as the round hears it. Called from `gaugeRoundHeard`
 * rather than from `boss-hands.ts`, because a round holds the whole of `step`
 * and never reaches the field's own hands (`step-round.ts`).
 */
export function gaugeHandHeard(
  world: World,
  gauge: GaugeState,
  player: 1 | 2,
  command: Command,
): void {
  if (command.kind !== "drag") return;
  if (command.target === "gaugeBand") band(world, gauge, player, command.on);
  else if (command.target === "gaugeTooth") gaugeToothHeard(world, gauge, player, command);
  else if (command.target === "gaugeTongue") gaugeTongueHeard(world, gauge, player, command);
}

/** Her thumb holding the wound band open, and only while it is wound. */
function band(world: World, gauge: GaugeState, player: 1 | 2, on: boolean): void {
  if (player !== 2 || !gaugeBound(gauge) || !gaugeWoundOpen(gauge)) return;
  if (on && !gauge.openThumb) world.events.push({ type: "gaugeHold", part: "band" });
  gauge.openThumb = on;
}

/**
 * Both hands off, whatever they were doing.
 *
 * Called when the round leaves `play` (`gauge-round.ts`): a phase that ended
 * under a thumb would leave a band held open into a verdict nobody can act
 * on, and the next round is a fresh `openGauge` anyway. The bind is *not*
 * cleared — it is what the pair did, and the verdict's picture is allowed to
 * show it.
 */
export function releaseGaugeHands(gauge: GaugeState): void {
  gauge.openThumb = false;
  releaseTooth(gauge);
  releaseTongue(gauge);
}
