import {
  type SimConfig,
  type SinewState,
  sinewBandMilli,
  sinewSum,
  sinewZone,
} from "@neon-spore/sim";
import { strokeGlow } from "./glow.js";
import { rgba } from "./hex.js";
import type { Layout } from "./layout.js";
import { PALETTE, STROKE } from "./palette.js";
import type { Point } from "./sinew-shape.js";
import { showsSinewSum, showsSinewZone } from "./view-role-clocks.js";

/**
 * **The strain band**: a collar around the tendon on its way down, and the
 * one place the split is drawn.
 *
 * It is a gauge from nought at its foot to two hands' reach at its top
 * (`sinewBandMilli`), and each seat is shown one thing on it. The pilot is
 * shown **the zone** — the stretch of it a fibre parts inside — and not
 * where the sum is; the navigator is shown **the sum** — where both pulls
 * together have got to — and not where the zone is (`view-role.ts`). What
 * both are shown is the hold counting: the collar's rim comes up and a pip
 * lights per beat the sum has sat inside, because *in* is a fact the
 * simulation tells both seats (`sinewEnter`) and the count is the thing the
 * pair says out loud together. The rim follows the hold and never the sum,
 * so nothing on the pilot's screen leaks the number he has to be told.
 *
 * The zone is green and the sum is warm: two colours neither the mass nor
 * the fibres use, so a screen can be asked which it was shown.
 */

/** Where along the tendon the collar sits, root 0 to mass 1. */
const ALONG = 0.42;
/** The collar's half-width and half-height, in tiles. */
const HALF_W = 0.26;
const HALF_H = 1.05;
/** A pip: its radius in tiles and how far beside the collar it stands. */
const PIP_R = 0.07;
const PIP_OUT = 0.18;

function rounded(x: number, y: number, w: number, h: number, r: number): Path2D {
  const p = new Path2D();
  p.moveTo(x + r, y);
  p.lineTo(x + w - r, y);
  p.quadraticCurveTo(x + w, y, x + w, y + r);
  p.lineTo(x + w, y + h - r);
  p.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  p.lineTo(x + r, y + h);
  p.quadraticCurveTo(x, y + h, x, y + h - r);
  p.lineTo(x, y + r);
  p.quadraticCurveTo(x, y, x + r, y);
  p.closePath();
  return p;
}

export function drawSinewBand(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  cfg: SimConfig,
  s: SinewState,
  root: Point,
  mass: Point,
  beat: number,
  beatPhase: number,
  time: number,
): void {
  const cx = root.x + (mass.x - root.x) * ALONG;
  const cy = root.y + (mass.y - root.y) * ALONG;
  const hw = HALF_W * l.tile;
  const hh = HALF_H * l.tile;
  const band = Math.max(1, sinewBandMilli(cfg));
  const yOf = (milli: number) => cy + hh - (Math.min(band, Math.max(0, milli)) / band) * hh * 2;
  const holding = s.holdBeat >= 0;

  ctx.save();
  const collar = rounded(cx - hw, cy - hh, hw * 2, hh * 2, hw * 0.6);
  ctx.fillStyle = rgba(PALETTE.background, 0.75);
  ctx.fill(collar);

  if (showsSinewZone(l.role)) {
    const zone = sinewZone(s, cfg);
    const top = yOf(zone.high);
    const bottom = yOf(zone.low);
    const seg = new Path2D();
    seg.rect(cx - hw * 0.8, top, hw * 1.6, Math.max(1, bottom - top));
    ctx.fillStyle = rgba(PALETTE.good, 0.35);
    ctx.fill(seg);
    ctx.strokeStyle = PALETTE.goodRim;
    ctx.lineWidth = STROKE.inner;
    ctx.stroke(seg);
  }

  if (showsSinewSum(l.role)) {
    const y = yOf(sinewSum(s));
    const fill = new Path2D();
    fill.rect(cx - hw * 0.8, y, hw * 1.6, cy + hh - y);
    ctx.fillStyle = rgba(PALETTE.ember, 0.4);
    ctx.fill(fill);
    const mark = new Path2D();
    mark.moveTo(cx - hw * 1.3, y);
    mark.lineTo(cx + hw * 1.3, y);
    ctx.strokeStyle = PALETTE.emberRim;
    ctx.lineWidth = STROKE.outline;
    ctx.lineCap = "round";
    ctx.stroke(mark);
  }

  // The rim, and the hold on it: brighter while the sum sits in the zone,
  // pulsing on the beat so the count can be seen as well as said.
  const pulse = holding ? 0.6 + 0.4 * (1 - beatPhase) : 0.5;
  strokeGlow(ctx, collar, holding ? PALETTE.hullRim : PALETTE.dim, STROKE.inner, pulse);

  const pips = Math.max(1, cfg.sinewHoldBeats);
  const lit = holding ? Math.min(pips, beat - s.holdBeat + 1) : 0;
  for (let k = 0; k < pips; k++) {
    const py = cy + hh - ((k + 0.5) / pips) * hh * 2;
    const px = cx + hw + PIP_OUT * l.tile;
    const on = k < lit;
    const pip = new Path2D();
    pip.arc(px, py, PIP_R * l.tile * (on ? 1 + 0.2 * Math.sin(time * 6) : 1), 0, Math.PI * 2);
    ctx.fillStyle = on ? PALETTE.text : PALETTE.dim;
    ctx.globalAlpha = on ? 1 : 0.35;
    ctx.fill(pip);
  }
  ctx.restore();
}
