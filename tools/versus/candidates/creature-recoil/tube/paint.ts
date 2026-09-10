import { KEY } from "../../../../../packages/content/src/light.js";
import { surfaceDim, surfaceLit } from "../../../../../packages/content/src/surface.js";
import { strokeGlow } from "../../../../../packages/render/src/glow.js";
import { mixHex, rgba } from "../../../../../packages/render/src/hex.js";
import type { CageDraw } from "../../../../../packages/render/src/recoil-look.js";
import { ribPath } from "../../../../../packages/render/src/recoil-ribs.js";

/**
 * TUBE — the same springs and the same hoop, made of round wire.
 *
 * The ribs walk the shipped folds (`ribPath`) and the hoop keeps its arcs
 * and its gaps, so the count reads exactly as it did. What changes is the
 * material: every stroke is laid down three times, dark at full width, the
 * metal narrower and shifted toward the key, and a thread of light narrower
 * still and shifted further — which is how a line becomes a cylinder, the
 * near side catching the light and the far side falling into the body's
 * dark. The hoop is lit round its ring by its own normal against the key
 * (`surfaceLit`), so its upper-left runs bright and its lower-right dark,
 * and each bolt is a ball with a highlight rather than a disc with a rim.
 * The neon stays: the thread of light is the shipped glow, on the wire's
 * crest instead of on the whole line.
 */

/** The hoop is walked in this many pieces per rib's quarter, each lit by
 * where it faces. */
const PIECES = 6;
/** What the wire keeps of its colour turned fully from the key. */
const FLOOR = 0.25;
const SHADOW = "#0B1024";
const SHEEN = "#F4F1EA";
/** How far the lighter passes shift toward the key, as shares of the
 * wire's width. */
const SHIFT_MID = 0.18;
const SHIFT_TOP = 0.36;

/** A lit share for a normal lying in the picture plane at angle `a`, tilted
 * a little toward the viewer — a wire's crest at that bearing. */
function bearingLit(a: number): number {
  // `surfaceLit` takes a normal as a latitude and an apparent longitude on a
  // ball; this is the crest of a tube seen at bearing `a`, whose normal is
  // `(cos a, sin a, 0.6)` before normalising.
  const nx = Math.cos(a);
  const ny = Math.sin(a);
  const nz = 0.6;
  const len = Math.hypot(nx, ny, nz);
  const y = ny / len;
  const cosLat = Math.sqrt(Math.max(1e-6, 1 - y * y));
  return surfaceLit(cosLat, y, nx / len / cosLat, nz / len / cosLat);
}

/** One path as a round wire: three passes, each narrower and nearer the key. */
function wire(
  ctx: CanvasRenderingContext2D,
  path: Path2D,
  width: number,
  dark: string,
  metal: string,
  glow: number,
): void {
  ctx.strokeStyle = dark;
  ctx.lineWidth = width;
  ctx.stroke(path);
  ctx.save();
  ctx.translate(KEY.x * width * SHIFT_MID, KEY.y * width * SHIFT_MID);
  ctx.strokeStyle = metal;
  ctx.lineWidth = width * 0.62;
  ctx.stroke(path);
  ctx.translate(KEY.x * width * (SHIFT_TOP - SHIFT_MID), KEY.y * width * (SHIFT_TOP - SHIFT_MID));
  strokeGlow(ctx, path, mixHex(metal, SHEEN, 0.45), Math.max(0.6, width * 0.28), glow);
  ctx.restore();
}

/**
 * The hoop's quarter for one rib, with the shipped gap where a spent rib's
 * bolt was: the wire's dark and metal passes whole, then the thread of light
 * in pieces, each as bright as the ring's own normal against the key at that
 * bearing — so the ring runs lit at the upper-left and dark at the lower-right
 * without a seam in the wire itself.
 */
function hoop(d: CageDraw, a: number, spent: boolean, hex: string, glow: number): void {
  const { ctx, x, y, hoop: r, struts } = d;
  const half = Math.PI / struts;
  const gap = spent ? half * 0.45 : 0;
  const width = Math.max(1, r * (spent ? 0.1 : 0.15));
  const dark = mixHex(SHADOW, d.dark, 0.5);
  const runs: [number, number][] = [
    [a - half, a - gap],
    [a + gap, a + half],
  ];
  for (const [from, to] of runs) {
    if (to <= from) continue;
    const whole = new Path2D();
    whole.arc(x, y, r, from, to);
    ctx.strokeStyle = dark;
    ctx.lineWidth = width;
    ctx.stroke(whole);
    ctx.save();
    ctx.translate(KEY.x * width * SHIFT_MID, KEY.y * width * SHIFT_MID);
    ctx.strokeStyle = mixHex(dark, hex, 0.7);
    ctx.lineWidth = width * 0.62;
    ctx.stroke(whole);
    ctx.translate(KEY.x * width * (SHIFT_TOP - SHIFT_MID), KEY.y * width * (SHIFT_TOP - SHIFT_MID));
    ctx.lineCap = "butt";
    const n = Math.max(1, Math.round((PIECES * (to - from)) / half));
    for (let k = 0; k < n; k++) {
      const a0 = from + ((to - from) * k) / n;
      const a1 = from + ((to - from) * (k + 1)) / n;
      const p = new Path2D();
      p.arc(x, y, r, a0, a1 + 0.02);
      const lit = surfaceDim(FLOOR, bearingLit((a0 + a1) / 2));
      ctx.globalAlpha = lit * (spent ? 0.75 : 1);
      strokeGlow(ctx, p, mixHex(hex, SHEEN, 0.45), Math.max(0.6, width * 0.28), glow * lit);
    }
    ctx.restore();
    ctx.globalAlpha = spent ? 0.75 : 1;
  }
}

/** A bolt as a ball: a radial gradient off-centre toward the key. */
function bolt(d: CageDraw, a: number, hex: string): void {
  const { ctx, x, y, hoop: r } = d;
  const br = Math.max(1.5, r * 0.12);
  const bx = x + Math.cos(a) * r;
  const by = y + Math.sin(a) * r;
  const g = ctx.createRadialGradient(
    bx + KEY.x * br * 0.4,
    by + KEY.y * br * 0.4,
    br * 0.1,
    bx,
    by,
    br,
  );
  g.addColorStop(0, mixHex(hex, SHEEN, 0.7));
  g.addColorStop(0.45, hex);
  g.addColorStop(1, mixHex(SHADOW, d.dark, 0.4));
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(bx, by, br, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = rgba(SHADOW, 0.5);
  ctx.lineWidth = Math.max(0.5, br * 0.18);
  ctx.stroke();
}

/** The cage in round wire. */
export function tube(d: CageDraw): void {
  const { ctx, x, y, inner, hoop: r, struts, left, metal, burnt, glow, time } = d;
  ctx.save();
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  for (let i = 0; i < struts; i++) {
    const spent = i >= left;
    const a = (i / struts) * Math.PI * 2 - Math.PI / 2;
    const hex = spent ? burnt : metal;
    const lit = spent ? glow * 0.25 : glow;
    ctx.globalAlpha = spent ? 0.75 : 1;
    const rib = ribPath(x, y, a, inner, r, spent, time);
    wire(ctx, rib, Math.max(1, r * (spent ? 0.1 : 0.16)), mixHex(SHADOW, d.dark, 0.5), hex, lit);
    hoop(d, a, spent, hex, lit);
    ctx.globalAlpha = 1;
    if (!spent) bolt(d, a, hex);
  }
  ctx.restore();
}
