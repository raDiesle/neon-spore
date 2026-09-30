import { NO_BEARING, TURN } from "./bearing.js";
import type { SimConfig } from "./config.js";
import { GAUGE_FULL, type GaugeState } from "./gauge.js";
import { gaugeBound, gaugeWoundOpen } from "./gauge-band.js";
import { gaugeCalled } from "./gauge-call.js";
import { gaugeToothHeard, releaseTooth } from "./gauge-tooth.js";
import type { Command } from "./types.js";
import type { World } from "./world.js";

/**
 * **THE GAUGE's two thumbs on the dial itself**, and the two states that ask
 * for them (`docs/spec/interludes.md`, `.claude/skills/new-boss` §6.2).
 *
 * The round shipped as one state and two panel controls: the pilot holds the
 * valve, the navigator presses the call, ninety seconds of *left — less —
 * less — now*. Both of the states below are entered by the pair's own last
 * answer rather than by a clock, which is the whole of why they are worth
 * having: the round is never in a state the two of them did not just put it
 * in, and neither of them can see the other's half of why.
 *
 * - **The jam**, his. A call that misses sticks the valve, and the needle is
 *   then his hand on the needle itself — a bearing round the dial, so the
 *   needle simply goes where the finger points. That is instant where the
 *   valve is slow, and what it costs is `gaugeSettleBeats` in which a call is
 *   refused: the sentence stops being *left — less — less* and becomes *swing
 *   it over — stop — wait — now*. It clears the moment a call lands.
 * - **The bind**, hers. Every `gaugeBindMarks` marks the band winds tight to
 *   `gaugeBoundSpanMilli`, and her thumb on it holds it open — full width, and
 *   the walk stopped — for as long as she keeps it there. **She cannot call
 *   while it is down**, which is the whole price and the reason it is a
 *   gesture rather than a button: the pair has to agree out loud on the moment
 *   she lets go, and that moment is the only thing in the round she does not
 *   decide alone.
 *
 * Both gestures are made on the *picture* and not on the panel, and each is
 * on the half of the picture its own seat is shown: the needle is on both
 * screens, the band on the navigator's alone (`render/gauge.ts`). A thumb from
 * the wrong seat is ignored rather than refused loudly — there is nothing
 * drawn on that seat's screen to have pressed, and a red ring or a refusal's
 * sound would tell the navigator the valve is dead and the pilot where the
 * band is, the two things the round keeps from each (28 September 2026).
 * A thumb that lands is said, `gaugeHold`, so the ring it lands on can wash
 * green the way every mark's does (`render/gauge-marks.ts`).
 */

/**
 * **The two of them, by name**, for the STATES sheet: a state of a boss is any
 * named condition the pair meets a different gesture in, and these two are not
 * the round's clock (`GAUGE_PHASES`). The second axis is a second table out of
 * the simulation, as SNAKE's grips and THE PULSE's hearts are — never a list
 * written by hand on the director's side (`boss-phases.ts`).
 *
 * Unlike those, these two are **not one enum**: the jam is his and the bind is
 * hers, they are entered by different halves of the same call, and a pair that
 * misses on the mark after a bind is in both at once. So there is no neutral
 * third name here — the ordinary state of the round is the round, `play`.
 * `loose` is the third, and the rest's: a tooth waiting to be pulled between
 * two levels (`gauge-tooth.ts`).
 */
export const GAUGE_GRIPS = ["jammed", "bound", "loose"] as const;
export type GaugeGrip = (typeof GAUGE_GRIPS)[number];

/** Whether the valve is dead and the needle is the pilot's to swing by hand. */
export function gaugeJammed(gauge: GaugeState): boolean {
  return gauge.jamBeat !== -1;
}

/** Whether the needle is asked of the pilot's hand: the round is live and the
 * valve is dead. The rings and the halo read it (`render/gauge-grip.ts`). */
export function gaugeNeedleAsks(gauge: GaugeState): boolean {
  return gauge.phase === "play" && gaugeJammed(gauge);
}

/** Whether the band is asked of the navigator's thumb: live, and wound tight. */
export function gaugeBandAsks(gauge: GaugeState): boolean {
  return gauge.phase === "play" && gaugeBound(gauge) && gaugeWoundOpen(gauge);
}

/**
 * Whether a needle that was swung by hand has not stood still long enough to
 * be called. True while the hand is down and for `gaugeSettleBeats` after it
 * lifts.
 *
 * It is the *only* thing the hand costs, so it is asked in one place and the
 * call reads it: a settle written out beside the judgement would be a second
 * opinion about whether the pair may speak yet.
 */
export function gaugeSettling(cfg: SimConfig, gauge: GaugeState, beat: number): boolean {
  return gauge.handOn || (gauge.liftBeat !== -1 && beat - gauge.liftBeat < cfg.gaugeSettleBeats);
}

/**
 * Where on the dial a bearing points, in thousandths of the dial.
 *
 * The dial is the **top half** of a circle: left is bearing 750 and nought on
 * the dial, the top is 0 and the middle, right is 250 and the full sweep. A
 * finger that strays into the bottom half has not pointed at anything, so it
 * is taken to the end it is nearer — which is what a hand sliding off the rim
 * looks like, and never a needle that jumps across the face.
 */
export function gaugeBearingMilli(bearingMilli: number): number {
  const b = ((bearingMilli % TURN) + TURN) % TURN;
  const across = ((b + TURN / 4) % TURN) * 2;
  if (across <= GAUGE_FULL) return across;
  return across > GAUGE_FULL * 1.5 ? 0 : GAUGE_FULL;
}

/**
 * The two controls, and the two seats they belong to.
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
  if (command.target === "gaugeNeedle") needle(world, gauge, player, command.on, command.fromMilli);
  else if (command.target === "gaugeBand") band(world, gauge, player, command.on);
  else if (command.target === "gaugeTooth") gaugeToothHeard(world, gauge, player, command);
}

/**
 * His hand on the needle, and only while the valve is jammed. Two ways to move
 * one needle at the same moment would make the valve decorative, and the valve
 * is what the round is about for four marks out of five.
 */
function needle(
  world: World,
  gauge: GaugeState,
  player: 1 | 2,
  on: boolean,
  bearingMilli: number,
): void {
  if (player !== 1 || !gaugeJammed(gauge)) return;
  if (!on) {
    // The lift is what starts the settle, and it starts it whether or not the
    // hand ever moved: a thumb put down and taken off again has still been on
    // the needle, and the pair cannot be asked to know that it did not slip.
    gauge.handOn = false;
    gauge.liftBeat = world.beat;
    return;
  }
  if (!gauge.handOn) world.events.push({ type: "gaugeHold", part: "needle" });
  gauge.handOn = true;
  // A press with no bearing yet is a hand that has landed and not yet said
  // where — the same `NO_BEARING` the crank and the rings answer (`bearing.ts`).
  if (bearingMilli === NO_BEARING || bearingMilli < 0) return;
  gauge.needleMilli = gaugeBearingMilli(bearingMilli);
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
 * under a thumb would leave a band held open and a needle settling into a
 * verdict nobody can act on, and the next round is a fresh `openGauge`
 * anyway. The jam and the bind are *not* cleared — they are what the pair did,
 * and the verdict's picture is allowed to show it.
 */
export function releaseGaugeHands(gauge: GaugeState): void {
  gauge.handOn = false;
  gauge.openThumb = false;
  releaseTooth(gauge);
}
