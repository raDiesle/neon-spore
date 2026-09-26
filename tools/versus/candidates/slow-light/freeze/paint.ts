import { smoothstep } from "../../../../../packages/render/src/ease.js";
import { mixHex, rgba } from "../../../../../packages/render/src/hex.js";
import { PALETTE } from "../../../../../packages/render/src/palette.js";
import { clipRoundBody } from "../../../../../packages/render/src/slow-keep-out.js";
import { glowStroke, reach, spent, withLight } from "../window.js";

/** Rings set off per beat. */
const PER_BEAT = 4;

/** How hard a ring brakes as it falls in: the larger, the sooner it is crawling. */
const BRAKE = 2.4;

/** Where a ring comes to rest, in body radii from the centre: clear of the skin. */
const NEAR = 1.18;

/** How quickly a ring dims once it has slowed, per beat of its age. */
const FADE = 0.9;

/** A ring's width at the edge of the screen and at rest, in body radii. */
const WIDE = 0.22;
const THIN = 0.05;

/** How bright a ring is when it sets off. */
const LIT = 0.55;

/**
 * **FREEZE — the light falls in and never lands.** Four times a beat a ring
 * of cold light sets off from beyond the corners of the screen and closes on
 * the boss — fast at first, then slower and slower, until it is standing
 * almost still a little off the skin, reddening and fading there like light
 * at the edge of something it cannot cross. The rings bank up at the boss
 * into a band of fine lines, the newest still falling through the room while
 * the oldest are going out: time running slower the nearer it is to the boss.
 *
 * How it can lose: a ring crossing the field is a moving edge over every body
 * on it, and a pair watching for a fall may read one as a fall.
 */
export const freezeWindow = withLight((ctx, l, at, up, win) => {
  const floor = l.hullY;
  if (floor <= 0 || at.r <= 0) return;
  const far = reach(l, at);
  const near = at.r * NEAR;
  const now = spent(win);

  ctx.save();
  clipRoundBody(ctx, l, at, 0, floor);
  ctx.globalCompositeOperation = "lighter";
  const first = Math.max(0, Math.floor((now - win.beats) * PER_BEAT));
  const last = Math.floor(now * PER_BEAT);
  for (let k = first; k <= last; k++) {
    const age = now - k / PER_BEAT;
    if (age < 0) continue;
    // The distance still to go falls away as an exponential: it never
    // reaches the skin, it only stops getting there.
    const left = Math.exp(-BRAKE * age);
    const rad = near + (far - near) * left;
    const slow = 1 - left;
    const lit = LIT * up * smoothstep(age * PER_BEAT) * Math.exp(-FADE * age * slow);
    if (lit <= 0.005) continue;
    const width = at.r * (THIN + (WIDE - THIN) * left);
    const colour = mixHex(PALETTE.arcRim, PALETTE.red, smoothstep(slow));
    ctx.strokeStyle = rgba(colour, lit);
    ctx.beginPath();
    ctx.arc(at.x, at.y, rad, 0, Math.PI * 2);
    glowStroke(ctx, width * 0.5);
  }
  ctx.restore();
});
