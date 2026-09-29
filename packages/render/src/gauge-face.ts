import type { Point } from "@neon-spore/content";
import type { Dial } from "./gauge.js";
import { rimPoint } from "./gauge-alien.js";
import { halo } from "./glow.js";
import { mixHex, rgba } from "./hex.js";
import { PALETTE } from "./palette.js";
import { splinePath } from "./spline.js";

/**
 * **THE GAUGE's face**: two eyes on the crown over the open mouth, and a
 * tongue lolling in it. The owner, 29 September 2026: *i like idea that visual
 * it looks like a mouth, can you enhance that we see like a face of an alien
 * and some open mouth visual e.g. tongue and eyes and whatever*. The teeth are
 * the rim's (`gauge-alien.ts`); this is the rest of the face.
 *
 * The eyes watch the cannon's aim, so the alien is looking at what is about to
 * hit it — on both screens, because the aim is on both. They blink on the
 * renderer's clock and screw shut while it flinches from a hit.
 *
 * Neither is in an ammunition colour: red and cyan on this picture are only
 * ever the wound (`gauge-hurt.ts` says the same of the gashes). The eyes are
 * the alien's own venom, the tongue a dark mauve.
 */

/** The eyes: how far either side of straight up, how far out, and how big. */
const EYE_SPREAD = 0.25;
const EYE_OUT = 1.37;
const EYE_W = 0.19;
const EYE_H = 0.11;
/** How far the outer corners tilt up, in radians. */
const EYE_TILT = 0.28;

/** The tongue's middle line in dial radii from the pivot, root to tip. */
const TONGUE: readonly (readonly [number, number])[] = [
  [0.12, 0.06],
  [0.34, 0.01],
  [0.53, -0.09],
  [0.62, -0.24],
];
/** Its half-width at the root and at the tip. */
const TONGUE_ROOT = 0.16;
const TONGUE_TIP = 0.1;
const TONGUE_DARK = "#2E0D22";
const TONGUE_LIT = "#8A4760";

const EYE_DEEP = "#1A0F08";
const SLIT = "#050308";

/** The tongue, in the mouth and behind everything our ship stands in front of. */
export function drawGaugeTongue(ctx: CanvasRenderingContext2D, dial: Dial, time: number): void {
  const sway = Math.sin(time * 1.3) * 0.035;
  const mid: Point[] = TONGUE.map(([x, y], i) => {
    const k = i / (TONGUE.length - 1);
    return { x: dial.cx + dial.r * (x + sway * k * k), y: dial.cy + dial.r * y };
  });
  const left: Point[] = [];
  const right: Point[] = [];
  for (let i = 0; i < mid.length; i++) {
    const a = mid[Math.max(0, i - 1)] as Point;
    const b = mid[Math.min(mid.length - 1, i + 1)] as Point;
    const len = Math.hypot(b.x - a.x, b.y - a.y) || 1;
    const nx = -(b.y - a.y) / len;
    const ny = (b.x - a.x) / len;
    const k = i / (mid.length - 1);
    const w = dial.r * (TONGUE_ROOT + (TONGUE_TIP - TONGUE_ROOT) * k);
    const p = mid[i] as Point;
    left.push({ x: p.x + nx * w, y: p.y + ny * w });
    right.push({ x: p.x - nx * w, y: p.y - ny * w });
  }
  const tip = mid[mid.length - 1] as Point;
  const before = mid[mid.length - 2] as Point;
  const len = Math.hypot(tip.x - before.x, tip.y - before.y) || 1;
  const round = dial.r * TONGUE_TIP * 0.9;
  const end = {
    x: tip.x + ((tip.x - before.x) / len) * round,
    y: tip.y + ((tip.y - before.y) / len) * round,
  };
  const path = splinePath([...left, end, ...right.reverse()], true);

  ctx.save();
  const g = ctx.createLinearGradient(dial.cx, dial.cy, end.x, end.y);
  g.addColorStop(0, TONGUE_DARK);
  g.addColorStop(1, TONGUE_LIT);
  ctx.fillStyle = g;
  ctx.fill(path);
  ctx.strokeStyle = mixHex(TONGUE_LIT, PALETTE.venom, 0.25);
  ctx.lineWidth = 1.6;
  ctx.stroke(path);
  // The groove down its middle, and the wet on its back.
  ctx.strokeStyle = rgba(TONGUE_DARK, 0.9);
  ctx.lineWidth = Math.max(1.2, dial.r * 0.018);
  ctx.lineCap = "round";
  ctx.stroke(splinePath(mid.slice(0, -1).concat(tip), false));
  ctx.fillStyle = rgba(PALETTE.hullRim, 0.18 + 0.08 * Math.sin(time * 1.7));
  ctx.beginPath();
  ctx.ellipse(
    before.x - dial.r * 0.04,
    before.y,
    dial.r * 0.05,
    dial.r * 0.02,
    -1.1,
    0,
    Math.PI * 2,
  );
  ctx.fill();
  ctx.restore();
}

/**
 * The eyes over the mouth, looking where the cannon points. `flinch` is how
 * hard it is recoiling from a hit, 0..1.
 */
export function drawGaugeEyes(
  ctx: CanvasRenderingContext2D,
  dial: Dial,
  aimMilli: number,
  time: number,
  flinch: number,
): void {
  const look = rimPoint(dial, aimMilli);
  // A blink every few seconds, a tenth of a second long.
  const blink = Math.max(0, Math.sin(time * 0.9) - 0.985) / 0.015;
  const open = Math.max(0.08, 1 - Math.max(blink, flinch * 0.85));
  for (const side of [-1, 1]) {
    const a = -Math.PI / 2 + side * EYE_SPREAD;
    const at = {
      x: dial.cx + Math.cos(a) * dial.r * EYE_OUT,
      y: dial.cy + Math.sin(a) * dial.r * EYE_OUT,
    };
    drawEye(ctx, dial, at, side * EYE_TILT, look, open, time);
  }
}

function drawEye(
  ctx: CanvasRenderingContext2D,
  dial: Dial,
  at: Point,
  tilt: number,
  look: Point,
  open: number,
  time: number,
): void {
  const w = dial.r * EYE_W;
  const h = dial.r * EYE_H * open;
  const pulse = 0.5 + 0.5 * Math.sin(time * 2.3);
  halo(ctx, at.x, at.y, w * 1.9, PALETTE.venom, 0.18 + 0.1 * pulse);
  ctx.save();
  ctx.translate(at.x, at.y);
  ctx.rotate(tilt);
  const lid = almond(w, h);
  ctx.fillStyle = EYE_DEEP;
  ctx.fill(lid);
  ctx.save();
  ctx.clip(lid);
  // The iris slides a little towards where the cannon points.
  const dx = look.x - at.x;
  const dy = look.y - at.y;
  const d = Math.hypot(dx, dy) || 1;
  const cos = Math.cos(-tilt);
  const sin = Math.sin(-tilt);
  const ix = ((dx * cos - dy * sin) / d) * w * 0.4;
  const iy = ((dx * sin + dy * cos) / d) * dial.r * EYE_H * 0.3;
  const ir = dial.r * EYE_H * 0.85;
  ctx.fillStyle = PALETTE.venom;
  ctx.beginPath();
  ctx.arc(ix, iy, ir, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = SLIT;
  ctx.beginPath();
  ctx.ellipse(ix, iy, ir * 0.24, ir * 0.9, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = rgba(PALETTE.hullRim, 0.8);
  ctx.beginPath();
  ctx.arc(ix - ir * 0.35, iy - ir * 0.4, ir * 0.16, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  ctx.strokeStyle = PALETTE.venom;
  ctx.lineWidth = 1.8;
  ctx.stroke(lid);
  ctx.restore();
}

/** A pointed eye shape, `w` from the middle to either corner and `h` high. */
function almond(w: number, h: number): Path2D {
  const p = new Path2D();
  p.moveTo(-w, 0);
  p.quadraticCurveTo(0, -h * 2, w, 0);
  p.quadraticCurveTo(0, h * 2, -w, 0);
  p.closePath();
  return p;
}
