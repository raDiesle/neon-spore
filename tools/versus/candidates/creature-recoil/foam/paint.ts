import { KEY } from "../../../../../packages/content/src/light.js";
import { mixHex, rgba } from "../../../../../packages/render/src/hex.js";
import { STROKE } from "../../../../../packages/render/src/palette.js";
import type { CageDraw } from "../../../../../packages/render/src/recoil-look.js";

/**
 * FOAM — no cage at all: the body wears its bounces as bubbles stuck to it.
 *
 * Every answer so far has been a frame — springs, a wire ball, coils — and
 * a frame is metal on a field where everything alive is grown. This throws
 * the frame away. One bubble per bounce the body arrived with, each a
 * translucent sphere the body's own colour clinging to its outside the way
 * foam clings to a thing pulled out of water, and each drawn as a ball: a
 * soft fill, a rim that catches the far light, a pale crescent on the
 * shoulder toward the key. They wobble on their own clocks and swell a
 * little with the strain, because a bubble under pressure does. A spent
 * bounce is a **burst** bubble — the ring it was, broken into four scorched
 * arcs still hanging where the film was — so the count reads from the top
 * going round exactly as the ribs did: whole bubbles left, broken rings
 * spent.
 *
 * The body is untouched, and everything here is stained the body's colour
 * (`metal`, `dark`, `burnt` are the caller's), so what is inside is the
 * colour the cannon has to match and nothing round it argues with that.
 *
 * **How it can lose.** *Three balls on a ball are a cluster of bodies.* If
 * a bubble reads as a second creature rather than as something on the first,
 * the pair has more bodies to name than the wave gave them. Judge it on
 * whether the bubbles are plainly *on* the body — the overlap is what says
 * so, and if it is lost at 26 px, so is the candidate.
 */

/** A bubble's radius as a share of the body's, and how far its centre sits
 * out from the body's centre as a share of the hoop — deep enough into the
 * body to read as stuck on rather than beside it. */
const BUBBLE = 0.6;
const OUT = 0.72;
/** How much a bubble wobbles, as a share of its radius, and how much it
 * swells at full strain. */
const WOBBLE = 0.08;
const SWELL = 0.18;
const SHEEN = "#F4F1EA";
const SHADOW = "#0B1024";

/** One bubble as a ball: fill, far rim, key-side crescent. */
function bubble(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  r: number,
  metal: string,
  dark: string,
  glow: number,
): void {
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  // The film: darker toward the far side, so the ball has a back.
  const fill = ctx.createRadialGradient(
    cx + KEY.x * r * 0.4,
    cy + KEY.y * r * 0.4,
    r * 0.1,
    cx,
    cy,
    r,
  );
  fill.addColorStop(0, rgba(metal, 0.16));
  fill.addColorStop(0.8, rgba(dark, 0.22));
  fill.addColorStop(1, rgba(SHADOW, 0.35));
  ctx.fillStyle = fill;
  ctx.fill();
  // The rim, brightest on the far side where the light wraps.
  const keyA = Math.atan2(KEY.y, KEY.x);
  ctx.strokeStyle = rgba(metal, 0.4 + 0.3 * glow);
  ctx.lineWidth = STROKE.inner;
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.94, keyA + Math.PI - 0.9, keyA + Math.PI + 0.9);
  ctx.strokeStyle = rgba(mixHex(metal, SHEEN, 0.5), 0.55);
  ctx.lineWidth = STROKE.inner * 1.2;
  ctx.stroke();
  // The crescent on the key's shoulder.
  ctx.beginPath();
  ctx.ellipse(
    cx + KEY.x * r * 0.45,
    cy + KEY.y * r * 0.45,
    r * 0.3,
    r * 0.16,
    keyA,
    0,
    Math.PI * 2,
  );
  ctx.fillStyle = rgba(SHEEN, 0.5);
  ctx.fill();
}

/** A burst one: four scorched arcs of the ring it was, each pushed out a
 * little from where the film stood. */
function burst(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  r: number,
  burnt: string,
): void {
  ctx.strokeStyle = rgba(burnt, 0.85);
  ctx.lineWidth = STROKE.inner;
  ctx.lineCap = "round";
  for (let k = 0; k < 4; k++) {
    const a = (k / 4) * Math.PI * 2 + 0.4;
    const push = 1 + 0.12 * ((k * 7) % 3);
    ctx.beginPath();
    ctx.arc(cx, cy, r * push, a, a + 0.55);
    ctx.stroke();
  }
}

export function foam(d: CageDraw): void {
  const { ctx, x, y, inner, hoop, struts, left, strain, metal, dark, burnt, glow, time, phase } = d;
  ctx.save();
  ctx.translate(x, y);
  const size = inner * BUBBLE * (1 + SWELL * (strain - 1));
  for (let i = 0; i < struts; i++) {
    const spent = i >= left;
    const a = (i / struts) * Math.PI * 2 - Math.PI / 2;
    const wob = 1 + WOBBLE * Math.sin(time * 2.3 + phase + i * 2.1);
    const cx = Math.cos(a) * hoop * OUT;
    const cy = Math.sin(a) * hoop * OUT;
    if (spent) burst(ctx, cx, cy, size, burnt);
    else bubble(ctx, cx, cy, size * wob, metal, dark, glow);
  }
  ctx.restore();
}
