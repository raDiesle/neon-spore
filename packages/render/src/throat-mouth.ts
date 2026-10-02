import { circleSubpath } from "@neon-spore/content";
import { type SimConfig, type ThroatState, throatRadiusMilli } from "@neon-spore/sim";
import { halo, strokeGlow } from "./glow.js";
import type { Layout } from "./layout.js";
import { STROKE } from "./palette.js";
import { splinePath } from "./spline.js";
import { paintLip } from "./throat-flesh-lip.js";
import { drawModeFace, drawPullCircle, throatHue } from "./throat-hue.js";
import { mouthX, mouthY } from "./throat-shape.js";

/**
 * The mouth and its lip.
 *
 * **The lip is the one place a colour is spent on this boss**, and it is the
 * colour the mouth is set to (`throat-hue.ts`): which of the four is set is
 * the fact both seats must read off the field before a body is pulled in.
 * Everything else about the gullet is `rock`, the honest word for a tube
 * shots pass straight through.
 *
 * **It stands as open as the pump has it** (`throatRadiusMilli`), so the
 * pilot's strokes are read off the lip on both screens, and off the circle
 * round it.
 */

/** How wide the lip's own ring is, as a share of a tile, shut and open. */
const LIP_SHUT = 0.34;
const LIP_OPEN = 0.54;

/** Beats a swallow's flare takes to go out. */
const FLARE_BEATS = 1.2;

/** How wide the mouth is standing open, 0..1: the pump's circle as a share
 * of its widest, and wide open while it turns inside out. */
export function gape(cfg: SimConfig, b: ThroatState): number {
  if (b.phase === "everts") return 1;
  return throatRadiusMilli(cfg, b) / cfg.throatMaxRadiusMilli;
}

export function drawMouth(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  cfg: SimConfig,
  b: ThroatState,
  beat: number,
  beatPhase: number,
  time: number,
): void {
  const x = mouthX(l, b);
  const y = mouthY(l, b);
  const open = gape(cfg, b);
  const r = l.tile * (LIP_SHUT + (LIP_OPEN - LIP_SHUT) * open);

  // The lip: a ring of wet muscle round a dark hole rather than a blob, so it
  // reads as an opening in something and not as a body sitting at the end of
  // the tube (`throat-flesh-lip.ts`). Two lobes and
  // a shallow depth — enough that it purses as it shuts and never enough to
  // become a shape with a front.
  const lip = splinePath(lipPoints(x, y, r, r * (0.42 + 0.34 * open), time), true);
  const hue = throatHue(b.mode);
  if (b.phase === "sucks") drawPullCircle(ctx, l, cfg, b, time);
  if (open > 0) halo(ctx, x, y, r * 2.4, hue.hex, 0.18 * open);
  paintLip(ctx, lip, x, y, r, l.tile, hue.hex, hue.rim, 0.6 + 0.4 * open);
  if (b.phase === "sucks") drawModeFace(ctx, b.mode, x, y, r);

  drawFlare(ctx, x, y, r, b.fedBeat, beat, beatPhase, hue.rim);
}

/** The lip's outline, pursed on its short axis. */
function lipPoints(
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  time: number,
): { x: number; y: number }[] {
  const pts: { x: number; y: number }[] = [];
  for (let i = 0; i < 28; i++) {
    const a = (i / 28) * Math.PI * 2;
    const purse = 1 + 0.08 * Math.sin(a * 2) + 0.03 * Math.sin(time * 1.7 + a * 3);
    pts.push({ x: cx + Math.cos(a) * rx * purse, y: cy + Math.sin(a) * ry * purse });
  }
  return pts;
}

/**
 * A receipt at the mouth: a ring going out from it for a beat.
 *
 * On both screens: a swallow is the one fact in this fight neither player has
 * to be told by the other.
 */
function drawFlare(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  at: number,
  beat: number,
  beatPhase: number,
  color: string,
): void {
  if (at === -1) return;
  const since = beat - at + beatPhase;
  if (since < 0 || since >= FLARE_BEATS) return;
  const fade = 1 - since / FLARE_BEATS;
  const ring = new Path2D(circleSubpath(x, y, r * (1 + since * 1.1)));
  strokeGlow(ctx, ring, color, STROKE.inner, 0.9, fade);
}
