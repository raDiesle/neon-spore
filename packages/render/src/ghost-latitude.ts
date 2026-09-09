import { facet, GHOST, pin, surfaceDim } from "@neon-spore/content";
import { slabs } from "./ghost-glitch.js";
import type { TearsDraw } from "./ghost-look.js";

/**
 * THE GHOST's camouflage, coming apart on a **surface** rather than on a flat
 * plane.
 *
 * `slabs` is called, not rewritten: how many bands there are, where each sits
 * and how far its temper has thrown it are three rules about *this creature*
 * and the shipped look owns all of them (`ghost-glitch.ts`). What this file
 * changes is only what a band's `shift` **means** — a translation across a flat
 * picture, or a longitude on a body that is turning.
 *
 * The projection is `surface.ts`'s, called and never spelled out.
 *
 * ## How it was decided, which was not by a vote
 *
 * It was `ghost:tears` / `latitude` on the ALTERNATIVES page, against
 * `ghost:tears` / `slide`. The owner looked at the pair on 9 September 2026 and
 * said he could not see any difference between them — which is a real answer
 * and not a failure to give one: a slot nobody can read is a slot that has to
 * be settled and cleared rather than shown again.
 *
 * It was settled on the two things that separate them where the eye could not.
 * **This one keeps the hard edge.** A ghost's whole job is to look like a
 * signal coming apart, and the tearing is in the edge; SLIDE spent that on a
 * gradient per band, and gentler is simply wrong for this body. And **this one
 * costs nothing extra** — seven `fillRect`s, as the shipped look drew — where
 * SLIDE built seven gradients a frame on a body that can be several to a wave,
 * which its own card named as the thing to watch.
 *
 * What it takes on is the risk LATITUDE's card named and SLIDE's answered:
 * player 2 has under a second to say which lane this body is in and is the only
 * seat that can see it at all, so a camouflage whose brightest patch wanders
 * from side to side can pull a column call off centre. If a lane starts being
 * called wrong on this creature, that is this look and `PATCH` is the first
 * number to try.
 */

/** How far a band's own throw carries it round the body, in radians per unit
 * of `shift`. A little over a right angle at full throw, so a badly torn band
 * goes past the limb and comes back at the other side — which is the whole
 * picture and is a thing no sideways slide can do. */
const THROW = 1.8;

/**
 * Turns of the body per second, and it is **not** read off `rage`.
 *
 * This matters more than its size. `ghostRage` already drives how far a band
 * is thrown, and a turn taken off the same number would be a second reading of
 * one input dressed as a second cue — the pair would see one thing getting
 * worse and believe they were seeing two. So the turn is its own slow clock and
 * a ghost at rest turns exactly as fast as a furious one: what the temper
 * changes is how far the camouflage has slipped round it, which is what the
 * temper changes today.
 */
const SPIN = 0.11;

/** What a band keeps of its light where it faces furthest from the key. Well
 * above nothing: a band that reached zero would read as a hole in the body
 * rather than as a piece of its surface (`surfaceDim`). */
const DIM = 0.45;

/** What a band on the **far** side keeps. It is drawn rather than clipped away,
 * behind the interior gradient's own value, because a surface coming apart
 * should show the pieces that have gone round the back — that is the one cue
 * `docs/dimensional.md` calls a difference in kind rather than of degree. */
const BEHIND = 0.3;

/** How wide a band's lit patch is at the middle of the body, as a share of the
 * half-width it would have had. Under one, because a patch that spanned the
 * whole body would be the shipped rectangle again with a curve on it. */
const PATCH = 0.78;

export function latitude(d: TearsDraw): void {
  const { ctx, body, id, time, rage, hex } = d;
  const theta = time * SPIN * Math.PI * 2;

  ctx.save();
  ctx.clip(body);
  ctx.globalCompositeOperation = "lighter";
  ctx.fillStyle = hex;
  for (const s of slabs(id, time, rage)) {
    // The band's own circle of latitude. `top` is -1 at the crown and 1 at the
    // hem, which is the sine of a latitude on a ball of this height, so the
    // latitude is its arcsine and `pin` does the rest — `k` comes back as the
    // radius of that circle and `cy` as the height the turn never touches.
    const mid = s.top + s.height / 2;
    const lat = Math.asin(Math.max(-1, Math.min(1, mid)));
    // Its throw is a longitude now. A band still is a band facing us; a band
    // thrown hard has gone round the side, and at the extreme it is behind.
    const home = pin(s.shift * THROW, lat, 1);
    const f = facet(home, theta);

    const halfW = GHOST.rx * f.sy * PATCH;
    if (halfW <= 0) continue;
    const x = f.x * GHOST.rx;
    const y = f.y * GHOST.ry;
    // `sx` is the tangent plane's own map across, so a patch near the limb is a
    // sliver and one facing us is full width. Its absolute value, because a far
    // band is drawn too and its normal points away.
    const w = halfW * Math.abs(f.sx);
    const h = s.height * GHOST.ry * 0.6;
    ctx.globalAlpha = (f.near ? surfaceDim(DIM, f.lit) : BEHIND) * (0.35 + Math.abs(s.shift) * 0.5);
    ctx.fillRect(x - w, y - h / 2, w * 2, h);
  }
  ctx.restore();
}
