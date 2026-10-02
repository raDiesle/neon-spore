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
import { PALETTE } from "./palette.js";
import { drawSinewFluid } from "./sinew-fluid.js";
import { type Point, sinewMassHung, sinewRoot, sinewSum01 } from "./sinew-shape.js";
import { showsSinewSum, showsSinewZone } from "./view-role-clocks.js";

/**
 * **The strain band**: a tube hung in the middle of the tendon, the upper
 * fibres running into its top and the lower ones out of its foot
 * (`sinew-fibres.ts`), and the one place the split is drawn.
 *
 * It is a gauge from nought at its foot to two hands' reach at its top
 * (`sinewBandMilli`), and each seat is shown one thing on it. The pilot is
 * shown **the zone** — the stretch of it a fibre parts inside — and not
 * where the sum is; the navigator is shown **the sum** — where both pulls
 * together have got to — and not where the zone is (`view-role.ts`).
 *
 * **Rebuilt on the owner's notes of 2 October 2026.** The tube is three times
 * as wide and half again as tall, because it is the thing both players watch.
 * The sum is a bubbling fluid up to **one bright line** that stands out past
 * both walls (`sinew-fluid.ts`); the zone is a green wash with a bracket on
 * each wall and **no edge across the tube**, so the only line across it is
 * the sum's and a player never has to ask which line is the real one. While
 * the sum sits in the zone the frame goes green and breathes, on both
 * screens — *in* is a fact the simulation tells both seats (`sinewEnter`) —
 * and the line itself goes green on the screen that shows it. The count of
 * the hold is not pips beside the tube any more: it is the next fibre fraying
 * (`sinew-fray.ts`), which is what the count is counting down to.
 *
 * The zone is green and the sum is warm: two colours neither the mass nor
 * the fibres use, so a screen can be asked which it was shown.
 */

/** Where along the tendon the tube's middle sits, root 0 to mass 1. */
const ALONG = 0.5;
/** The tube's half-width and half-height, in tiles. */
const HALF_W = 0.75;
const HALF_H = 1.7;
/** How far the sum's line stands out past each wall, in tiles, and how thick it is. */
const LINE_OUT = 0.32;
const LINE_W = 0.11;
/** The zone's brackets: how far out of the wall they stand, and how thick, in tiles. */
const BRACKET_OUT = 0.16;
const BRACKET_W = 0.07;

/** The tube's centre and half-sizes, on the tendon between root and mass. */
export interface CollarBox {
  x: number;
  y: number;
  rx: number;
  ry: number;
}

function collarBetween(l: Layout, root: Point, mass: Point): CollarBox {
  return {
    x: root.x + (mass.x - root.x) * ALONG,
    y: root.y + (mass.y - root.y) * ALONG,
    rx: HALF_W * l.tile,
    ry: HALF_H * l.tile,
  };
}

/**
 * Where the tube stands: hung between the root and where the mass hangs —
 * not where it bounces, so the gauge holds still to be read while the mass
 * bobs under it. The caption's question too (`caption-anchor-boss.ts`), and
 * the drawing's, so a page about the zone or the sum rings the gauge they
 * are on. `swingTiles` is the snap-back's whip; a caption passes none.
 */
export function sinewCollarBox(
  l: Layout,
  cfg: SimConfig,
  s: SinewState,
  beat: number,
  beatPhase: number,
  swingTiles = 0,
): CollarBox {
  return collarBetween(
    l,
    sinewRoot(l, cfg, s, beat, beatPhase),
    sinewMassHung(l, cfg, s, beat, beatPhase, swingTiles),
  );
}

function rounded(x: number, y: number, w: number, h: number, r: number): Path2D {
  const p = new Path2D();
  p.roundRect(x, y, w, h, r);
  return p;
}

/** A bracket on one wall, from `top` to `bottom`, opening toward the tube. */
function bracket(x: number, top: number, bottom: number, side: -1 | 1, out: number): Path2D {
  const p = new Path2D();
  p.moveTo(x, top);
  p.lineTo(x + side * out, top);
  p.lineTo(x + side * out, bottom);
  p.lineTo(x, bottom);
  return p;
}

export function drawSinewBand(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  cfg: SimConfig,
  s: SinewState,
  box: CollarBox,
  beatPhase: number,
  time: number,
): void {
  const { x: cx, y: cy, rx: hw, ry: hh } = box;
  const band = Math.max(1, sinewBandMilli(cfg));
  const yOf = (milli: number) => cy + hh - (Math.min(band, Math.max(0, milli)) / band) * hh * 2;
  const holding = s.holdBeat >= 0;
  const tile = l.tile;

  ctx.save();
  const glass = rounded(cx - hw, cy - hh, hw * 2, hh * 2, hw * 0.35);
  ctx.fillStyle = rgba(PALETTE.background, 0.85);
  ctx.fill(glass);
  ctx.save();
  ctx.clip(glass);

  if (showsSinewZone(l.role)) {
    const zone = sinewZone(s, cfg);
    const top = yOf(zone.high);
    const bottom = yOf(zone.low);
    ctx.fillStyle = rgba(PALETTE.good, holding ? 0.34 + 0.12 * (1 - beatPhase) : 0.26);
    ctx.fillRect(cx - hw, top, hw * 2, Math.max(1, bottom - top));
  }
  if (showsSinewSum(l.role)) {
    const tube = { x: cx, y: cy, hw, hh, tile };
    drawSinewFluid(ctx, tube, yOf(sinewSum(s)), sinewSum01(s, cfg), time);
  }
  ctx.restore();

  // The zone's brackets, on the walls and outside them: where the zone
  // starts and stops, said without a line across the fluid.
  if (showsSinewZone(l.role)) {
    const zone = sinewZone(s, cfg);
    const top = yOf(zone.high);
    const bottom = yOf(zone.low);
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    // The zone's own green under a pale rim: the saturated green as a hex is
    // the verdict's, and a quiet frame does not say it (`sinew-verdict.test.ts`).
    for (const side of [-1, 1] as const) {
      const b = bracket(cx + side * hw, top, bottom, side, BRACKET_OUT * tile);
      ctx.strokeStyle = rgba(PALETTE.good, holding ? 0.9 : 0.7);
      ctx.lineWidth = BRACKET_W * tile * 2;
      ctx.stroke(b);
      strokeGlow(ctx, b, PALETTE.goodRim, BRACKET_W * tile, holding ? 1 : 0.6);
    }
  }

  // The frame: dim at rest, green and breathing while the sum sits in the
  // zone and the count runs — the clear *yes, hold it there*.
  const breathe = 0.5 + 0.5 * Math.cos(beatPhase * Math.PI * 2);
  if (holding) {
    strokeGlow(ctx, glass, PALETTE.good, tile * (0.07 + 0.03 * breathe), 0.7 + 0.3 * breathe);
  } else {
    strokeGlow(ctx, glass, PALETTE.dim, tile * 0.05, 0.5);
  }

  // The sum's line: the one line across the tube, standing out past both
  // walls with a point on each end aimed in at it.
  if (showsSinewSum(l.role)) {
    const y = yOf(sinewSum(s));
    const out = LINE_OUT * tile;
    const hex = holding ? PALETTE.good : PALETTE.text;
    const mark = new Path2D();
    mark.moveTo(cx - hw - out, y);
    mark.lineTo(cx + hw + out, y);
    ctx.lineCap = "round";
    strokeGlow(ctx, mark, hex, LINE_W * tile, 1);
    ctx.fillStyle = hex;
    for (const side of [-1, 1] as const) {
      const tip = cx + side * (hw + out);
      const point = new Path2D();
      point.moveTo(tip + side * tile * 0.16, y - tile * 0.14);
      point.lineTo(tip, y);
      point.lineTo(tip + side * tile * 0.16, y + tile * 0.14);
      point.closePath();
      ctx.fill(point);
    }
  }
  ctx.restore();
}
