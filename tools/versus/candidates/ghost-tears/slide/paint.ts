import { facet, GHOST, pin, surfaceDim } from "../../../../../packages/content/src/index.js";
import { slabs } from "../../../../../packages/render/src/ghost-glitch.js";
import type { TearsDraw } from "../../../../../packages/render/src/ghost-look.js";
import { rgba } from "../../../../../packages/render/src/hex.js";

/**
 * The paint SLIDE is made of.
 *
 * `slabs` is called, not rewritten: how many bands there are, where each sits
 * and how far its temper has thrown it are three rules about *this creature*
 * and the shipped look owns all of them (`ghost-glitch.ts`). What this file
 * changes is only what a band's `shift` **means**.
 *
 * The projection is `surface.ts`'s, called and never spelled out — and it is
 * read at `theta = 0`, which is the whole difference from the candidate beside
 * it. Nothing turns. A band is a full-width strip lying across a body that is
 * standing still, and what its throw moves is the **lit patch travelling along
 * the strip** rather than the strip itself.
 */

/** How far a band's own throw carries the lit patch round the body, in radians
 * per unit of `shift`. Short of a right angle at full throw, so the patch
 * crawls to the limb and stops there — a strip sliding round a stationary body
 * has nowhere else to go, and a patch that reappeared at the other side would
 * be a body that had turned. */
const THROW = 1.25;

/** What a patch keeps of its light where it has travelled furthest from the
 * key. Well above nothing: a band that reached zero would read as a hole in
 * the body rather than as a piece of its surface (`surfaceDim`). */
const DIM = 0.45;

/** The strip itself, away from its lit patch: how much of it is there at rest
 * and how much its temper adds. This is the number that protects a lane call —
 * every band is present across the whole body at every moment, so the mass of
 * the camouflage never leaves the middle however hard a band is thrown. */
const STRIP = 0.12;
const STRIP_RAGE = 0.2;

/** The lit patch: its floor, what the throw adds, and how far it reaches along
 * the strip as a share of the body's width. Narrow enough to be a patch and
 * wide enough that at 26 px it is not a scratch. */
const PATCH = 0.26;
const PATCH_RAGE = 0.6;
const PATCH_W = 0.38;

/** A gradient's stops, pushed in order and never backwards. `p` may sit at
 * either end of the strip once a band is fully thrown, and a stop behind the
 * one before it is a gradient nobody can predict. */
function stops(g: CanvasGradient, at: number, hex: string, base: number, peak: number): void {
  let last = -1;
  const put = (offset: number, alpha: number): void => {
    const o = Math.max(0, Math.min(1, offset));
    if (o < last) return;
    last = o;
    g.addColorStop(o, rgba(hex, alpha));
  };
  put(0, base);
  put(at - PATCH_W, base);
  put(at, peak);
  put(at + PATCH_W, base);
  put(1, base);
}

export function slide(d: TearsDraw): void {
  const { ctx, body, id, time, rage, hex } = d;

  ctx.save();
  ctx.clip(body);
  ctx.globalCompositeOperation = "lighter";
  for (const s of slabs(id, time, rage)) {
    // The band's own circle of latitude, exactly as the candidate next door
    // reads it: `top` is -1 at the crown and 1 at the hem, which is the sine
    // of a latitude on a ball of this height.
    const mid = s.top + s.height / 2;
    const lat = Math.asin(Math.max(-1, Math.min(1, mid)));
    // Its throw is a longitude — but the body it is a longitude *on* never
    // turns, so `theta` is nought and the only thing that moves is where along
    // its own strip this band is catching the light.
    const f = facet(pin(s.shift * THROW, lat, 1), 0);

    const y = f.y * GHOST.ry;
    const h = s.height * GHOST.ry * 0.6;
    const throwAt = Math.abs(s.shift);
    // The strip spans the whole body at every moment. That is the claim: the
    // silhouette does not move, the band does not move, and a column read off
    // the weight of this creature is read off the same place it was last
    // frame.
    const g = ctx.createLinearGradient(-GHOST.rx, y, GHOST.rx, y);
    stops(
      g,
      (f.x + 1) / 2,
      hex,
      STRIP + throwAt * STRIP_RAGE,
      surfaceDim(DIM, f.lit) * (PATCH + throwAt * PATCH_RAGE),
    );
    ctx.fillStyle = g;
    ctx.fillRect(-GHOST.rx, y - h / 2, GHOST.rx * 2, h);
  }
  ctx.restore();
}
