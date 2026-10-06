import type { FlueLevel, SimConfig } from "@neon-spore/sim";
import { flueCentre, flueEmberAt } from "./flue-shape.js";
import { rgba } from "./hex.js";
import type { Layout } from "./layout.js";
import { PALETTE, STROKE } from "./palette.js";

/**
 * **THE FLUE's scale**: a tick under the slot for every half beat the ember
 * has still to run to the sight, out to either end, a whole beat's longer.
 * The owner asked for a numbered scale to time the call by (5 October 2026)
 * and had the numbers taken off it the next day; it is counted in beats
 * rather than columns because a beat is what the pair can count aloud and
 * what a call has to lead by: whatever the level's speed or THE SLOW, the
 * ember at `1` meets the sight one beat later.
 *
 * **It is laid per level**, from the level's own speed, so the scale is how
 * the speed is shown: a slow ember's ticks stand close round the sight, a
 * fast one's far out at the ends. It is on both screens, because the ticks
 * say nothing about where the ember is.
 */

/** The ticks, from the slot's underside, a whole beat's and a half's, in tiles. */
const TICK_FROM = 0.3;
const TICK_BEAT = 0.7;
const TICK_HALF = 0.48;

export interface FlueTick {
  /** How far the ember is from the sight, in thousandths of a column. */
  milli: number;
  /** Half beats from the sight; a whole beat when even. */
  halves: number;
}

/** Every tick of `level`'s scale on one side of the sight, nearest first, out to the slot's end. */
export function flueScaleTicks(cfg: SimConfig, level: FlueLevel): FlueTick[] {
  const out: FlueTick[] = [];
  const step = level.speedMilli / 2;
  if (step <= 0) return out;
  for (let k = 1; k * step <= cfg.flueSpanMilli; k++) out.push({ milli: k * step, halves: k });
  return out;
}

/** The scale under the slot, either side of the sight, faint between levels. */
export function drawFlueScale(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  cfg: SimConfig,
  level: FlueLevel,
  lit: boolean,
): void {
  const y = flueCentre(l, cfg).y;
  const alpha = lit ? 0.9 : 0.4;
  ctx.save();
  ctx.lineWidth = STROKE.inner;
  ctx.lineCap = "round";
  ctx.strokeStyle = rgba(PALETTE.hullRim, alpha);
  for (const tick of flueScaleTicks(cfg, level)) {
    const whole = tick.halves % 2 === 0;
    for (const side of [-1, 1]) {
      const x = flueEmberAt(l, cfg, side * tick.milli).x;
      ctx.beginPath();
      ctx.moveTo(x, y + TICK_FROM * l.tile);
      ctx.lineTo(x, y + (whole ? TICK_BEAT : TICK_HALF) * l.tile);
      ctx.stroke();
    }
  }
  ctx.restore();
}
