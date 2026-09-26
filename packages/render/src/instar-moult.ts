import { strokeGlow } from "./glow.js";
import { faded, type Look, toward } from "./instar-plate.js";
import type { Point } from "./instar-shape.js";
import { PALETTE, STROKE } from "./palette.js";

/**
 * **THE INSTAR's moult**: the old hide split open along the back, and the
 * next body pale in the split. The split runs the length of the back between
 * the two marks' halves — the half by the head is player 1's, the one by the
 * rear player 2's — and every counted swipe peels a strip more of a half down
 * off the pale body, its torn lip curled dark under the strip it lost
 * (`Figure.shedNear`, `shedFar`, driven by `deformed` in `instar-shape.ts`).
 * Left undone, the strike sets it: the split darkens into the hide and the
 * body is whole again (`InstarStrike.harden`).
 *
 * Side-on only: the moult is a profile pose (`instar-poses.ts`). Drawn over
 * the hide and under the wing and the nests (`instar-profile.ts`), on the
 * same back line the body is drawn through, so the split is always on it.
 */

/** Where along the back the split runs, as sample indices of the profile's sixteen. */
const FROM = 2;
const TO = 14;
/** How far down to the belly the split stands open before a strip is off, and
 * how far all of a half takes it. */
const GAPE = 0.16;
const PEEL = 0.74;
/** Samples along the split, and how many tatters hang off the lip. */
const STEPS = 36;
const TATTERS = 14;

export function drawMoult(
  ctx: CanvasRenderingContext2D,
  top: readonly Point[],
  bottom: readonly Point[],
  look: Look,
): void {
  const { f, r, fade, time } = look;
  if (f.split < 0.01 || fade <= 0) return;
  const mid = (FROM + TO) / 2;
  const back: Point[] = [];
  const lip: Point[] = [];
  for (let k = 0; k <= STEPS; k++) {
    const s = FROM + ((TO - FROM) * k) / STEPS;
    // A lens along the back, each half as deep as its own share is peeled.
    const blend = Math.max(0, Math.min(1, (s - mid + 1) / 2));
    const shed = f.shedNear + (f.shedFar - f.shedNear) * blend;
    const taper = Math.sin((Math.PI * k) / STEPS) ** 0.6;
    const t = sampled(top, s);
    back.push(t);
    lip.push(toward(t, sampled(bottom, s), f.split * taper * (GAPE + PEEL * shed)));
  }
  const pale = new Path2D();
  trace(pale, back);
  for (let i = lip.length - 1; i >= 0; i--) pale.lineTo(lip[i]?.x ?? 0, lip[i]?.y ?? 0);
  pale.closePath();
  // The new body: soft, wet, breathing under the hide it is coming out of.
  const breath = 0.85 + 0.15 * Math.sin(time * 3);
  ctx.save();
  ctx.fillStyle = faded(PALETTE.sheenRim, fade, 0.9 * breath);
  ctx.fill(pale);
  // Rounded under the key: lit along the back, flushed deeper toward the lip.
  const top0 = back[STEPS / 2] ?? { x: 0, y: 0 };
  const shade = ctx.createLinearGradient(top0.x, top0.y, top0.x, top0.y + r * 0.6);
  shade.addColorStop(0, faded(PALETTE.sheenMid, fade, 0));
  shade.addColorStop(1, faded(PALETTE.sheenMid, fade, 0.55));
  ctx.fillStyle = shade;
  ctx.fill(pale);
  // Not stopped, it sets: the split filled dark as the hide, and the torn
  // lips gone into it, whole again (`InstarStrike.harden`).
  ctx.fillStyle = faded(PALETTE.sheenDeep, fade, look.harden);
  ctx.fill(pale);
  ctx.restore();
  const soft = 1 - look.harden;
  strokeGlow(ctx, pale, faded(PALETTE.sheenRim, fade, soft), STROKE.inner, 0.8 * fade * breath);
  if (soft > 0.01) drawLip(ctx, lip, r, fade * soft);
}

/** The torn edge of the old hide: a dark curl with its rim lit, and rags
 * hanging off it where the strips tore. */
function drawLip(
  ctx: CanvasRenderingContext2D,
  lip: readonly Point[],
  r: number,
  fade: number,
): void {
  const edge = new Path2D();
  trace(edge, lip);
  ctx.save();
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.strokeStyle = faded(PALETTE.sheenDeep, fade);
  ctx.lineWidth = Math.max(2, r * 0.09);
  ctx.stroke(edge);
  ctx.fillStyle = faded(PALETTE.sheenDeep, fade);
  for (let j = 1; j < TATTERS; j++) {
    const a = lip[Math.round((j * (lip.length - 1)) / TATTERS)] ?? { x: 0, y: 0 };
    const w = r * 0.05;
    const h = r * (0.06 + 0.05 * (j % 3));
    ctx.beginPath();
    ctx.moveTo(a.x - w, a.y);
    ctx.lineTo(a.x + w * 0.3, a.y + h);
    ctx.lineTo(a.x + w, a.y);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
  strokeGlow(ctx, edge, faded(PALETTE.hullRim, fade, 0.7), STROKE.inner, 0.5 * fade);
}

/** A line through `ps` onto `path`, starting at the first. */
function trace(path: Path2D, ps: readonly Point[]): void {
  for (const [i, p] of ps.entries()) {
    if (i === 0) path.moveTo(p.x, p.y);
    else path.lineTo(p.x, p.y);
  }
}

/** A point `s` sample-indices along a list of samples, between two of them. */
function sampled(ps: readonly Point[], s: number): Point {
  const i = Math.min(ps.length - 2, Math.floor(s));
  const a = ps[i] ?? { x: 0, y: 0 };
  return toward(a, ps[i + 1] ?? a, s - i);
}
