import { smoothstep } from "./ease.js";
import { sinHash } from "./hash.js";
import { mixHex, rgba } from "./hex.js";
import type { Layout } from "./layout.js";
import { PALETTE } from "./palette.js";
import type { Aim } from "./slow-intake-aim.js";
import { clearOf, clipRoundBody } from "./slow-keep-out.js";
import type { SlowWindow } from "./slow-look.js";

/** Rays round the boss, and sparks of light strung along each one at once. */
const RAYS = 28;
const SPARKS = 4;

/** Beats a spark takes from the edge of the screen to its stop at the skin. */
const TRIP = 1.6;

/** How hard a spark brakes: the larger, the sooner it is crawling. */
const BRAKE = 4.2;

/** Where a spark comes to rest, in body radii from the centre: a tenth clear of the skin. */
const NEAR = 1.12;

/** A spark's length at full speed, in body radii, and its width. */
const STREAK = 1.8;
const WIDTH = 0.06;

/** How bright a spark is, and how far out of the keep-out it takes to reach that, in body radii. */
const LIT = 0.85;
const FEATHER = 0.35;

/** From the boss to the furthest corner of the field above the hull, in layout pixels. */
export function reach(l: Layout, at: Aim): number {
  return Math.hypot(Math.max(at.x, l.width - at.x), Math.max(at.y, l.hullY - at.y));
}

/** Beats the window has run, fractional. */
export function spent(win: SlowWindow): number {
  return win.beats - win.left;
}

/** Widths and strengths of the passes a line of light is stroked in, widest first. */
const GLOW = [
  [5, 0.05],
  [2.4, 0.14],
  [1, 1],
] as const;

/**
 * The current path stroked as light: two wide faint passes under the line
 * itself, so it has a falloff instead of the hard edge of one fat stroke.
 */
export function glowStroke(ctx: CanvasRenderingContext2D, width: number): void {
  const alpha = ctx.globalAlpha;
  for (const [wide, strength] of GLOW) {
    ctx.globalAlpha = alpha * strength;
    ctx.lineWidth = width * wide;
    ctx.stroke();
  }
  ctx.globalAlpha = alpha;
}

/**
 * **CRAWL — the light round the boss, slowing down.** The owner took it from
 * the `slow:light` slot on 26 September 2026, in place of the streams
 * (`tools/versus/DECIDED.md`); the streams and the other answers went to the
 * director's GRAPHICS → EFFECTS page, kept for boss effects to come.
 *
 * Every spark leaves the edge of the screen as a long cold streak and loses
 * speed as it nears, shortening to a point and warming from ice-white to red
 * as it slows, until it is barely moving a tenth of a body off the skin.
 * Nothing ever quite arrives, so the sparks bank up there into a lit rim —
 * light piled against the boss because time is running slower the closer it
 * gets.
 *
 * The clip is the play area with the body punched out of it
 * (`slow-keep-out.ts`), so no spark crosses the boss however the numbers are
 * tuned. How it can lose: a bank of red at the skin of a boss can read as the
 * boss being hurt.
 */
export function drawCrawl(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  at: Aim,
  up: number,
  win: SlowWindow,
): void {
  const floor = l.hullY;
  if (floor <= 0 || at.r <= 0) return;
  const far = reach(l, at);
  const near = at.r * NEAR;
  const now = spent(win);

  ctx.save();
  clipRoundBody(ctx, l, at, 0, floor);
  ctx.globalCompositeOperation = "lighter";
  ctx.lineCap = "round";
  for (let r = 0; r < RAYS; r++) {
    const angle = (r / RAYS) * Math.PI * 2 + sinHash(r) * 0.2;
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    for (let s = 0; s < SPARKS; s++) {
      // How far through its trip this spark stands; each one on a ray starts
      // a share of a trip after the last, so light keeps arriving.
      const t = (now / TRIP + s / SPARKS + sinHash(r, s)) % 1;
      // The distance still to go falls away as an exponential: fast out at
      // the edge, a crawl at the skin, and never quite nothing.
      const speed = Math.exp(-BRAKE * t);
      const rad = near + (far - near) * speed;
      const x = at.x + cos * rad;
      const y = at.y + sin * rad;
      // Its length is its speed, so a fast spark is a streak and a slow one a point.
      const len = at.r * STREAK * speed + at.r * WIDTH * 0.5;
      const bx = at.x + cos * (rad + len);
      const by = at.y + sin * (rad + len);
      // Cold while it is fast and warming only once it is crawling: a spark
      // that went red halfway in would be red everywhere.
      const colour = mixHex(PALETTE.arcRim, PALETTE.red, smoothstep(1 - speed ** 0.4));
      const clear = smoothstep(clearOf(at, x, y) / (at.r * FEATHER));
      // Up out of nothing at the screen's edge and gone at the end of the
      // trip, so no spark is seen to appear or vanish.
      const life = smoothstep(t / 0.08) * smoothstep((1 - t) / 0.25);
      const lit = LIT * up * clear * life;
      if (lit <= 0) continue;
      const g = ctx.createLinearGradient(bx, by, x, y);
      g.addColorStop(0, rgba(colour, 0));
      g.addColorStop(1, rgba(colour, lit));
      ctx.strokeStyle = g;
      ctx.beginPath();
      ctx.moveTo(bx, by);
      ctx.lineTo(x, y);
      glowStroke(ctx, at.r * WIDTH * (1 + (1 - speed) * 0.8));
    }
  }
  ctx.restore();
}
