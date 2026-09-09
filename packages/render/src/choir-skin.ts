import type { ChoirDraw } from "./choir-look.js";
import { choirVoiceAt, VOICES } from "./choir-shape.js";
import { halo } from "./glow.js";

/**
 * **The light THE CHOIR throws and the film it wears** — the surface half of
 * this creature, with nothing in it about the rule.
 *
 * Cut out of `choir.ts` the day the body got a record a candidate could patch,
 * along the seam that file already had: next door is *what the pair is doing*
 * — how far the gesture has got, which colour is arriving, how much of it has
 * — and this is *what that looks like*. `choir-shape.ts` is the third of the
 * three and holds where the two bodies stand.
 *
 * Nothing here knows what a world or a creature is. It takes a place, a
 * clock, how lit the pair is and the colour it is going, and it draws.
 */

/**
 * The shipped film: two halos under a single translucent skin with a solid rim.
 *
 * **It hides nothing behind it**, which is the owner's own instruction about
 * this creature and the reason the skin is a wash rather than a fill — the
 * grid, the beat flash and anything falling behind read straight through it,
 * and what is solid is the rim. Any candidate surface offered against this
 * inherits that constraint whole: a soap film that stopped being see-through
 * would not be a second answer to the question, it would be a different
 * creature.
 */
export function film(d: ChoirDraw): void {
  const { ctx, l, x, y, time, close, lit, tint, path } = d;
  // The light the pair throws, under everything: a body that is there and
  // cannot be reached still has to be seen coming — and, once the gesture has
  // started, a body visibly working up to something. The halo grows and takes
  // the colour with it, which is the reaction the owner asked to be able to
  // see coming (`choirGlow`).
  for (let i = 0; i < VOICES; i++) {
    const v = choirVoiceAt(l, x, y, i, time, close);
    // A breath on the wall clock while it is charged, so a pair holding inside
    // the window reads as *waiting to go* rather than as simply brighter.
    const beat = lit === 0 ? 0 : 0.85 + 0.15 * Math.sin(time * 7);
    halo(ctx, v.x, v.y, v.r * (1.9 + lit * 1.5), tint, (0.18 + lit * 0.5) * (beat || 1));
  }

  ctx.save();
  // **A film and not a fill.** The owner's complaint about an earlier draft was
  // that the body hid what was behind it, and a soap film is what this creature
  // has been called since the first sketch — so the skin is a wash the grid,
  // the beat flash and anything falling behind read straight through, and what
  // is solid is the rim.
  ctx.globalAlpha = 0.34 + lit * 0.22;
  ctx.fillStyle = tint;
  ctx.fill(path);
  ctx.globalAlpha = 1;
  ctx.strokeStyle = tint;
  ctx.lineWidth = Math.max(1.4, l.tile * 0.055);
  ctx.stroke(path);
  ctx.restore();
}
