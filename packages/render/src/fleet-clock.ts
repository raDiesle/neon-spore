import { type FleetState, fleetBeatsLeft, type World } from "@neon-spore/sim";
import type { Chart } from "./fleet-chart.js";
import { PALETTE } from "./palette.js";

/**
 * How long THE FLEET has left, as a bar and as a number.
 *
 * **The clock is the whole of the danger here.** Nothing this boss does can
 * reach the hull; what costs the hull is *not finishing* — running out breaks
 * it by `damageFleet` in the middle column and the scar is still standing when
 * the next wave opens (`docs/spec/bosses.md` 11.6). So the one instrument
 * under the chart is the only warning the pair get, and it is worth its own
 * file: `fleet-chart.ts` draws a lattice and an axis, and this draws the
 * thing that can end the round.
 *
 * **The number is the owner's, asked for by name.** The bar shipped alone, on
 * the argument that a count of beats is a thing one of them would read out and
 * this fight has enough to say already. That was the wrong call and he said
 * so: a bar answers *roughly how much* and the question a pair actually asks
 * each other under a clock is *how long*, which is a number or it is nothing.
 * Both are drawn now — the bar for the glance, the number for the sentence.
 *
 * It counts in **seconds**, not beats. Beats are what the simulation runs on
 * and seconds are what two people in a room mean by "half a minute left".
 */

/** The share of the clock that is drawn as an emergency. */
const LATE = 0.125;

/** Seconds left, smoothed through the beat so the numeral ticks once a second. */
function secondsLeft(world: World, boss: FleetState, beatPhase: number): number {
  const beats = Math.max(0, fleetBeatsLeft(world, boss) - beatPhase);
  return (beats * 60) / world.cfg.bpm;
}

/** `1:40`, and never `100`. Two people say minutes at this length. */
function clockText(seconds: number): string {
  const whole = Math.ceil(Math.max(0, seconds));
  const mins = Math.floor(whole / 60);
  return `${mins}:${String(whole - mins * 60).padStart(2, "0")}`;
}

/**
 * The bar and the numeral, under the chart's own letters.
 *
 * The bar drains across the whole width and goes red for its last eighth; the
 * numeral sits under the middle of it and goes red with it, and takes a pulse
 * on the beat once it does — the one moment in this fight where the picture is
 * allowed to shout, because it is the only moment where the pair can still do
 * something about it.
 */
export function drawFleetClock(
  ctx: CanvasRenderingContext2D,
  c: Chart,
  world: World,
  boss: FleetState,
  beatPhase: number,
): void {
  const total = Math.max(1, world.cfg.fleetRoundBeats);
  const left = fleetBeatsLeft(world, boss) / total;
  const late = left < LATE;
  const w = c.cols * c.tile;
  const y = c.top + c.rows * c.tile + Math.max(13, c.tile * 0.6);
  const h = Math.max(2, c.tile * 0.09);

  ctx.save();
  ctx.fillStyle = "rgba(47,224,240,.14)";
  ctx.fillRect(c.left, y, w, h);
  ctx.fillStyle = late ? PALETTE.red : PALETTE.shield;
  ctx.fillRect(c.left, y, w * Math.max(0, Math.min(1, left)), h);

  // The numeral. Bigger when it is late and pulsing on the beat, because by
  // then it is the only thing on the chart that has changed in ten seconds.
  const beat = late ? 1 - beatPhase : 0;
  const size = Math.max(12, c.tile * (0.52 + 0.12 * beat));
  ctx.font = `700 ${Math.round(size)}px "Courier New",monospace`;
  ctx.textAlign = "center";
  ctx.fillStyle = late ? PALETTE.redRim : PALETTE.text;
  ctx.globalAlpha = late ? 0.75 + 0.25 * beat : 0.85;
  ctx.fillText(clockText(secondsLeft(world, boss, beatPhase)), c.left + w / 2, y + h + size);
  ctx.restore();
}
