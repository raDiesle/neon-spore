import { strokeGlow } from "../../../../../packages/render/src/glow.js";
import { rgba } from "../../../../../packages/render/src/hex.js";
import type { Layout } from "../../../../../packages/render/src/layout.js";
import { PALETTE } from "../../../../../packages/render/src/palette.js";
import type { CollarBox } from "../../../../../packages/render/src/sinew-band.js";
import { drawSinewHoldBars } from "../../../../../packages/render/src/sinew-hold.js";
import {
  showsSinewSum,
  showsSinewZone,
} from "../../../../../packages/render/src/view-role-clocks.js";
import {
  type SimConfig,
  type SinewState,
  sinewBandMilli,
  sinewSum,
  sinewZone,
} from "../../../../../packages/sim/src/index.js";

/** The design's word for the band: white, the objective, half on each phone. */
const WHITE = "#FFFFFF";

/**
 * The strain band as the design drew it: **one white bar**, half of it on
 * each phone. The pilot's half is the zone, a solid white block standing in
 * the bar where a fibre parts; the navigator's is the sum, the bar filled
 * white from its foot up to where both pulls have got to. Neither screen
 * carries a colour of its own for its half — the white is the objective
 * either way, and *in* is the bar's rim going bright and breathing on both.
 * The hold's count fills the bar as it does the game's tube.
 */
export function drawWhiteBand(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  cfg: SimConfig,
  s: SinewState,
  box: CollarBox,
  beatPhase: number,
  hold: number,
): void {
  const { x: cx, y: cy, rx: hw, ry: hh } = box;
  const band = Math.max(1, sinewBandMilli(cfg));
  const yOf = (milli: number) => cy + hh - (Math.min(band, Math.max(0, milli)) / band) * hh * 2;
  const holding = s.holdBeat >= 0;
  const tile = l.tile;
  const zoneShown = showsSinewZone(l.role);
  const sumShown = showsSinewSum(l.role);
  const breathe = 0.5 + 0.5 * Math.cos(beatPhase * Math.PI * 2);

  ctx.save();
  const bar = new Path2D();
  bar.roundRect(cx - hw, cy - hh, hw * 2, hh * 2, tile * 0.08);
  ctx.fillStyle = rgba(PALETTE.background, 0.9);
  ctx.fill(bar);
  ctx.save();
  ctx.clip(bar);
  if (zoneShown) {
    const zone = sinewZone(s, cfg);
    const top = yOf(zone.high);
    ctx.fillStyle = rgba(WHITE, sumShown ? 0.45 : holding ? 0.85 + 0.15 * breathe : 0.92);
    ctx.fillRect(cx - hw, top, hw * 2, Math.max(1, yOf(zone.low) - top));
  }
  if (sumShown && !zoneShown) {
    const top = yOf(sinewSum(s));
    ctx.fillStyle = rgba(WHITE, holding ? 0.85 + 0.15 * breathe : 0.92);
    ctx.fillRect(cx - hw, top, hw * 2, cy + hh - top);
  }
  if (hold >= 0) {
    const target = zoneShown ? yOf(sinewZone(s, cfg).low) : yOf(sinewSum(s));
    drawSinewHoldBars(ctx, { x: cx, y: cy, hw, hh }, target, cfg.sinewHoldBeats, hold, tile);
  }
  ctx.restore();

  // A screen shown both halves (a watcher's) reads the sum as a line on the zone.
  if (sumShown && zoneShown) {
    const y = yOf(sinewSum(s));
    const mark = new Path2D();
    mark.moveTo(cx - hw, y);
    mark.lineTo(cx + hw, y);
    strokeGlow(ctx, mark, WHITE, tile * 0.06, 1);
  }
  if (holding) strokeGlow(ctx, bar, WHITE, tile * (0.06 + 0.04 * breathe), 0.7 + 0.3 * breathe);
  else strokeGlow(ctx, bar, WHITE, tile * 0.04, 0.55);
  ctx.restore();
}
