import { type SimConfig, type SurgeState, surgeBand, surgeNotchMilli } from "@neon-spore/sim";
import { strokeGlow } from "./glow.js";
import { rgba } from "./hex.js";
import type { Layout } from "./layout.js";
import { PALETTE, STROKE } from "./palette.js";
import { type Point, surgeSeamEnds, surgeSeamX } from "./surge-shape.js";
import { showsSurgeNotches, showsSurgePressure } from "./view-role-clocks.js";

/**
 * **THE SURGE's seam**: the dark line round the bulb's equator, and the
 * gauge read along it by seat (§11.28).
 *
 * The seam itself is on both screens: the bulb is one body and the line
 * across it is where it will open. What is *on* the line is the split. The
 * pilot's screen carries the **notches** — the ones already open as slits
 * the seam has parted at, the next as a bright mark with its band a pale
 * stretch either side, the ones after as dim ticks — and no pressure. The
 * navigator's screen carries the **pressure**, one bright mark sliding
 * left to right along the seam as the charge climbs, and no notch. So the
 * pilot can see where the band is and not what is in it, and the navigator
 * can see the mark climbing and not where it has to stop
 * (`view-role-clocks.ts`). `test` is shown both, one over the other.
 *
 * Every mark is white — the text colour and the hull's rim — and nothing on
 * the body is ever an ammunition colour: the seam says *where* and *how
 * far*, never *which*.
 */

/** How tall a notch's slit, the next notch's mark and the pressure mark
 * are, as shares of the bulb's half-height. */
const SLIT = 0.34;
const MARK = 0.5;
const TICK = 0.16;
const PRESSURE_MARK = 0.62;
/** How high the band stands off the seam, and how dark it is. */
const BAND_H = 0.22;
const BAND_ALPHA = 0.22;

export function drawSurgeGauge(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  cfg: SimConfig,
  s: SurgeState,
  c: Point,
  rx: number,
  ry: number,
  time: number,
  /** Whether the bulb has lost its seam to the eversion: marks go, the line stays. */
  everting: boolean,
): void {
  const ends = surgeSeamEnds(c, rx);
  // The seam: a shallow curve, dark on the bright body.
  const seam = new Path2D();
  seam.moveTo(ends.left, c.y);
  seam.quadraticCurveTo(c.x, c.y + ry * 0.12, ends.right, c.y);
  ctx.save();
  ctx.strokeStyle = rgba(PALETTE.background, 0.75);
  ctx.lineWidth = STROKE.outline * 1.4;
  ctx.lineCap = "round";
  ctx.stroke(seam);
  ctx.restore();
  if (everting) return;

  if (showsSurgeNotches(l.role)) drawNotches(ctx, cfg, s, c, rx, ry, time);
  if (showsSurgePressure(l.role)) drawPressure(ctx, cfg, s, c, rx, ry, time);
}

/** Where notch `k` sits on the gauge: the sim's own arithmetic, asked with
 * `k` as the count open, so the picture never re-derives the ladder. */
function notchAt(s: SurgeState, cfg: SimConfig, k: number): number {
  return surgeNotchMilli({ ...s, notches: k }, cfg);
}

function drawNotches(
  ctx: CanvasRenderingContext2D,
  cfg: SimConfig,
  s: SurgeState,
  c: Point,
  rx: number,
  ry: number,
  time: number,
): void {
  const n = Math.max(1, cfg.surgeNotches);
  // The next notch's band first, under its mark: a pale stretch of the seam
  // that breathes, so the pilot reads a *window* and not a point.
  if (s.notches < n) {
    const band = surgeBand(s, cfg);
    const x0 = surgeSeamX(c, rx, cfg, band.low);
    const x1 = surgeSeamX(c, rx, cfg, band.high);
    const h = ry * BAND_H * (1 + 0.15 * Math.sin(time * 3));
    ctx.save();
    ctx.fillStyle = rgba(PALETTE.text, BAND_ALPHA);
    ctx.fillRect(x0, c.y - h, x1 - x0, h * 2);
    ctx.restore();
  }
  for (let k = 0; k < n; k++) {
    const x = surgeSeamX(c, rx, cfg, notchAt(s, cfg, k));
    const open = k < s.notches;
    const next = k === s.notches;
    const h = ry * (open ? SLIT : next ? MARK : TICK);
    const p = new Path2D();
    p.moveTo(x, c.y - h);
    p.lineTo(x, c.y + h);
    if (next) {
      strokeGlow(ctx, p, PALETTE.text, STROKE.outline * 1.3, 1.1);
      continue;
    }
    ctx.save();
    // An open notch is a slit the seam has parted at — drawn as a gap in
    // the body's colour with a white edge; one not yet reached is a tick.
    ctx.strokeStyle = open ? PALETTE.text : PALETTE.dim;
    ctx.globalAlpha = open ? 0.9 : 0.55;
    ctx.lineWidth = open ? STROKE.outline * 1.6 : STROKE.outline;
    ctx.lineCap = "round";
    ctx.stroke(p);
    ctx.restore();
  }
}

/** The pressure: one white mark on the seam, brighter the higher it climbs. */
function drawPressure(
  ctx: CanvasRenderingContext2D,
  cfg: SimConfig,
  s: SurgeState,
  c: Point,
  rx: number,
  ry: number,
  time: number,
): void {
  const x = surgeSeamX(c, rx, cfg, s.pressureMilli);
  const share = s.pressureMilli / Math.max(1, cfg.surgeBurstMilli);
  const h = ry * PRESSURE_MARK * (1 + 0.06 * Math.sin(time * 7));
  const p = new Path2D();
  p.moveTo(x, c.y - h);
  p.lineTo(x, c.y + h);
  strokeGlow(ctx, p, PALETTE.hullRim, STROKE.outline * 1.5, 0.7 + 0.8 * share);
}
