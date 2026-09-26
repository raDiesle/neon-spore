import { smoothstep } from "../../../../../packages/render/src/ease.js";
import { sinHash } from "../../../../../packages/render/src/hash.js";
import { mixHex, rgba } from "../../../../../packages/render/src/hex.js";
import { PALETTE } from "../../../../../packages/render/src/palette.js";
import { clearOf, clipRoundBody } from "../../../../../packages/render/src/slow-keep-out.js";
import { glowStroke, reach, spent, withLight } from "../window.js";

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

/**
 * **CRAWL — the streams, slowing down.** The shipped light runs in round the
 * boss at one speed; this runs in and *brakes*. Every spark leaves the edge
 * of the screen as a long cold streak and loses speed as it nears, shortening
 * to a point and warming from ice-white to red as it slows, until it is
 * barely moving a tenth of a body off the skin. Nothing ever quite arrives,
 * so the sparks bank up there into a lit rim — light piled against the boss
 * because time is running slower the closer it gets.
 *
 * How it can lose: the rim is where the owner said the light should stop, and
 * a bank of red at the skin of a boss can read as the boss being hurt.
 */
export const crawlWindow = withLight((ctx, l, at, up, win) => {
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
      const left = Math.exp(-BRAKE * t);
      const speed = left;
      const rad = near + (far - near) * left;
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
      const width = at.r * WIDTH * (1 + (1 - speed) * 0.8);
      ctx.strokeStyle = g;
      ctx.beginPath();
      ctx.moveTo(bx, by);
      ctx.lineTo(x, y);
      glowStroke(ctx, width);
    }
  }
  ctx.restore();
});
