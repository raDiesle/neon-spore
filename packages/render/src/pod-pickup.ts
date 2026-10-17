import { faded } from "./pod-fade.js";
import { type Seed, WAKES_AT } from "./pod-seed.js";

/**
 * **What makes a pod read as something to collect** — the owner, 17 October
 * 2026: *for all add some powerup blinking effect, so it is easier
 * identifiable to be something to collect, like coins or so how other games
 * do it*. Every real pod flashes on the count (`blinkAt`) and has a bar of
 * light sweep across it like a coin catching the light (`drawShine`). A fake,
 * on the seat that can tell, has neither: its blink is red, and on the count
 * it shows its tell instead (`countSwell`).
 */

/** A form's draw: the pod at a place and size, real or — on the seat that can
 * tell — the fake it is (`pod-forms.ts`). */
export type PodDraw = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  t: number,
  /** Beats left on its clock, `Infinity` for none. */
  beatsLeft: number,
  fake: boolean,
) => void;

/**
 * The count, as a swell 0..1..0 lasting `width` of it, on `blinkAt`'s own
 * rhythm — once a beat, twice from half the waking, four times in the last
 * beat, on the seconds for a pod that owes nothing. Wider than the blink,
 * because a fake's tell has to be seen, not glimpsed.
 */
export function countSwell(t: number, beatsLeft: number, width: number): number {
  let ph: number;
  if (!Number.isFinite(beatsLeft)) ph = (t * 1.6) % 1;
  else {
    const per = beatsLeft < 1 ? 4 : beatsLeft < WAKES_AT / 2 ? 2 : 1;
    ph = (beatsLeft * per) % 1;
  }
  return ph > 1 - width ? Math.sin(((ph - (1 - width)) / width) * Math.PI) : 0;
}

/** The coin's shine: a bar of white light across the sphere, once every
 * second and a half, three times as often as the clock runs out. */
export function drawShine(ctx: CanvasRenderingContext2D, s: Seed, t: number): void {
  const u = (t * (0.7 + 1.4 * s.awake)) % 1;
  if (u > 0.45) return;
  const k = u / 0.45;
  const off = (k * 2 - 1) * s.R * 1.6;
  ctx.save();
  ctx.beginPath();
  ctx.arc(s.x, s.y, s.R, 0, Math.PI * 2);
  ctx.clip();
  ctx.translate(s.x + off, s.y - off * 0.3);
  ctx.rotate(-0.6);
  ctx.globalAlpha = faded(0.85 * Math.sin(k * Math.PI));
  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(-s.R * 0.16, -s.R * 1.6, s.R * 0.32, s.R * 3.2);
  ctx.restore();
}

/** A four-point star, `a` its brightness — a twinkle on a gem's spike. */
export function drawStar(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  a: number,
): void {
  if (r <= 0.5 || a <= 0) return;
  ctx.globalAlpha = faded(a);
  ctx.fillStyle = "#FFFFFF";
  ctx.beginPath();
  for (let i = 0; i < 8; i++) {
    const ang = (i / 8) * Math.PI * 2 - Math.PI / 2;
    const rr = i % 2 === 0 ? r : r * 0.18;
    ctx.lineTo(x + Math.cos(ang) * rr, y + Math.sin(ang) * rr);
  }
  ctx.closePath();
  ctx.fill();
}
