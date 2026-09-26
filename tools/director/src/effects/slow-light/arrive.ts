import { smoothstep } from "../../../../../packages/render/src/ease.js";
import { sinHash } from "../../../../../packages/render/src/hash.js";
import { rgba } from "../../../../../packages/render/src/hex.js";
import { PALETTE } from "../../../../../packages/render/src/palette.js";
import { glowStroke, reach, spent } from "../../../../../packages/render/src/slow-crawl.js";
import { clipRoundBody } from "../../../../../packages/render/src/slow-keep-out.js";
import { beatFrac } from "../../../../../packages/render/src/slow-lens.js";
import { withLight } from "./window.js";

/** Stars round the boss. Enough that the burst reads as a field, not a fan. */
const STARS = 56;

/** Where the stars stand, in body radii from the centre, at the nearest. */
const NEAREST = 1.5;

/** Where a streak's tail stands on the downbeat, in body radii: just off the skin. */
const TAIL = 1.15;

/** The share of a beat a streak takes to shrink into its star. */
const SHRINK = 0.45;

/** A streak's width at the star end, and a star's glow, in body radii. */
const WIDTH = 0.11;
const GLOW = 0.22;

/** How bright a streak is on the downbeat, and how bright a star rests afterwards. */
const STREAK_LIT = 1;
const STAR_LIT = 0.75;

/** How much dimmer each beat's arrival is than the first — the jump lands once. */
const ECHO = 0.55;

/**
 * **ARRIVE — the boss drops out of a warp jump, and the light round it comes
 * to rest.** The owner's own picture, 26 September 2026: a jump run
 * backwards. On every slowed downbeat the field round the boss is streaked
 * out from its skin like stars at light speed, and across the first half of
 * the beat each streak shrinks, fast and then slower, into a point at its far
 * end — the stars stopping. The points hang there, still, until the next
 * downbeat throws them out again. The first beat of a window is the jump
 * itself and the brightest; every later one is its echo.
 *
 * How it can lose: forty streaks round one body on a downbeat is a starburst
 * for a frame, and a burst is a hit in this game's vocabulary.
 */
export const arriveWindow = withLight((ctx, l, at, up, win) => {
  const floor = l.hullY;
  if (floor <= 0 || at.r <= 0) return;
  const far = reach(l, at);
  const beat = Math.floor(spent(win));
  const u = beatFrac(win);
  // Fast and then slower: the deceleration is the whole of *time slowing*.
  const shrink = 1 - (1 - Math.min(1, u / SHRINK)) ** 3;
  const echo = beat === 0 ? 1 : ECHO;

  ctx.save();
  clipRoundBody(ctx, l, at, 0, floor);
  ctx.globalCompositeOperation = "lighter";
  ctx.lineCap = "round";
  for (let s = 0; s < STARS; s++) {
    // Looked up rather than rolled, and re-dealt each beat so every arrival
    // throws a field of its own rather than the same one again.
    const angle = (s / STARS) * Math.PI * 2 + sinHash(s, beat) * 0.4;
    const dist = at.r * NEAREST + (far - at.r * NEAREST) * sinHash(s, beat, 1) ** 1.3;
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const sx = at.x + cos * dist;
    const sy = at.y + sin * dist;
    const width = at.r * WIDTH * (0.6 + sinHash(s, 2) * 0.8);

    if (shrink < 1) {
      // The tail runs out from the skin to the star; the streak is the light
      // still in flight.
      const tail = at.r * TAIL + (dist - at.r * TAIL) * shrink;
      const tx = at.x + cos * tail;
      const ty = at.y + sin * tail;
      const lit = STREAK_LIT * up * echo * (1 - shrink * 0.6);
      const g = ctx.createLinearGradient(tx, ty, sx, sy);
      g.addColorStop(0, rgba(PALETTE.arc, 0));
      g.addColorStop(0.7, rgba(PALETTE.arc, lit * 0.5));
      g.addColorStop(1, rgba(PALETTE.arcRim, lit));
      ctx.strokeStyle = g;
      ctx.beginPath();
      ctx.moveTo(tx, ty);
      ctx.lineTo(sx, sy);
      glowStroke(ctx, width);
    }

    // The star it came to rest as: up out of nothing as the streak lands, and
    // dimming toward the next downbeat.
    const rest = smoothstep(shrink) * (1 - u * 0.5);
    const lit = STAR_LIT * up * rest * (0.5 + sinHash(s, beat, 3) * 0.5);
    if (lit <= 0) continue;
    const rad = at.r * GLOW;
    const star = ctx.createRadialGradient(sx, sy, 0, sx, sy, rad);
    star.addColorStop(0, rgba(PALETTE.arcRim, lit));
    star.addColorStop(0.35, rgba(PALETTE.arc, lit * 0.4));
    star.addColorStop(1, rgba(PALETTE.arc, 0));
    ctx.fillStyle = star;
    ctx.fillRect(sx - rad, sy - rad, rad * 2, rad * 2);
  }
  ctx.restore();
});
