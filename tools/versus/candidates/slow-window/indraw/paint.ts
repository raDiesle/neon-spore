import { sinHash } from "../../../../../packages/render/src/hash.js";
import { rgba } from "../../../../../packages/render/src/hex.js";
import { PALETTE } from "../../../../../packages/render/src/palette.js";
import type { SlowLook } from "../../../../../packages/render/src/slow-look.js";
import { aim, ramp } from "./aim.js";

/**
 * **The light in the field runs inward, in streams.**
 *
 * `gather` spends the owner's suction as grain — eighteen separate motes, each
 * on its own ray. This spends it as *flow*: half a dozen soft streams that
 * bend in toward the thing being answered, each one a chain of overlapping
 * bokeh laid along a curve, fattest and faintest out at the field's rim and
 * thinning as it nears. What an eye reads is not particles, it is the room
 * draining toward one point.
 *
 * **No line is ever drawn.** A stream is a run of borderless radial gradients
 * on a bent path, which is the only way to get a stroke's continuity with none
 * of a stroke's edge. The curve is a quadratic through one offset control
 * point, sampled rather than stroked, so a stream leans the way water does
 * going down a drain instead of arriving along a spoke.
 *
 * **There is no vignette and that is the difference from `hush`.** The streams
 * are thickest at the rim and carry a veil of the ground's own colour under
 * their light there, so the edge of the screen goes quiet because something is
 * leaving it rather than because a gradient was laid over it. If that reads,
 * it is the more honest picture of a suction; if it does not, `hush` does the
 * same job in two gradients and this one is thirty-five.
 *
 * **It ends.** Four tenths of a second of fade at each end, spent inside the
 * window, so it arrives from nothing and leaves to nothing rather than being
 * at its loudest on the frame before the shut (`aim.ts`).
 *
 * **How it can lose.** A stream is very close to a streak, and a streak is the
 * one shape the brief rules out — this stands or falls on whether six chains
 * of bokeh read as flow or as six smudged lines pointing at the boss. It is
 * also the heaviest of the three soft answers, and the streams pass over the
 * field's outer columns, which is exactly where a creature crossing is drawn.
 */

/** How many streams run at once. Six, not four: a field with four has an
 * obvious gap between them, and one with eight is a starburst. */
const STREAMS = 6;

/** Bokeh strung along each stream, from its head at the field's rim to its
 * tail near the target. Eighteen and not nine: at nine the beads stand apart
 * near the tail and the stream reads as a dotted line, which is the one shape
 * the brief refuses. They have to overlap for the run to be a run. */
const BEADS = 18;

/** Trips a stream makes across the window, so light keeps arriving rather than
 * all of it landing at once and the field going still for the second beat. */
const TRIPS = 1.5;

/** Where a stream's head starts and where its tail stops, as a share of the
 * run from the target out to the field's edge. It never reaches the target: a
 * stream that landed would end in a dot, and a dot has an edge. */
const FAR = 1.05;
const NEAR = 0.12;

/** How far the ring of starting places reaches, as a share of the field's
 * width and of its height. Two numbers and not one: a circle on a portrait
 * field leaves the corners empty and crowds the sides. */
const SPREAD_X = 0.66;
const SPREAD_Y = 0.55;

/** How far a stream bends off the straight run to the target, as a share of
 * its own length, and how much of that bend a stream can differ by. */
const BEND = 0.2;
const BEND_VARY = 0.3;

/** A bead at its brightest, and its radius at the stream's head and at its
 * tail, in tiles. It thins as it nears: the same light in a narrower run. */
const BEAD_LIT = 0.1;
const BEAD_HEAD = 0.95;
const BEAD_TAIL = 0.45;

/** The ground's own colour carried under the head of each stream, so the rim
 * of the screen goes quiet without a vignette being laid over it. */
const DRAG = 0.36;

export const indrawnStreams: SlowLook["paint"] = (ctx, l, world, view, win) => {
  const up = ramp(win, world.cfg);
  if (up <= 0) return;
  const t = win.through;
  const at = aim(world, l, view.beatPhase);
  const top = l.gridTop;
  // To the hull and no further: below it is the ship's own tissue, drawn over
  // this pass, and a stream has nothing to say about a hand (`slow-look.ts`).
  const floor = l.hullY;
  if (floor <= top) return;

  ctx.save();
  ctx.beginPath();
  ctx.rect(0, top, l.width, floor - top);
  ctx.clip();

  const spanX = l.width * SPREAD_X;
  const spanY = (floor - top) * SPREAD_Y;
  for (let s = 0; s < STREAMS; s++) {
    // Each stream's ray, its head start and its own lean, looked up rather
    // than rolled: `sinHash` is render's one repeatable 0..1, and a stream
    // that moved somewhere else every frame would flicker rather than flow.
    const angle = (s / STREAMS) * Math.PI * 2 + sinHash(s) * 0.6;
    const flow = (t * TRIPS + sinHash(s, 1)) % 1;
    const lean = BEND * (1 + (sinHash(s, 2) * 2 - 1) * BEND_VARY) * (sinHash(s, 3) < 0.5 ? -1 : 1);
    // Up out of nothing and back into it across the stream's own run, so no
    // stream ever appears or vanishes where an eye can catch it doing either.
    const alive = Math.sin(Math.PI * flow) ** 0.8 * up;
    if (alive <= 0) continue;
    // Where the far end of this stream stands, and the point it bends through.
    const head = FAR - (FAR - NEAR) * flow * flow;
    const hx = at.x + Math.cos(angle) * spanX * head;
    const hy = at.y + Math.sin(angle) * spanY * head;
    // The control point, off the straight run by the stream's own lean: a
    // quadratic through it is the whole of the curve.
    const mx = (at.x + hx) / 2 - (hy - at.y) * lean;
    const my = (at.y + hy) / 2 + (hx - at.x) * lean;
    for (let b = 0; b < BEADS; b++) {
      // 0 at the head, 1 at the tail nearest the target.
      const along = b / (BEADS - 1);
      const u = 1 - along;
      // The quadratic, sampled: at u = 1 this is the head and at u = 0 the
      // target, and the beads stop short of the target by `NEAR`.
      const w = u * u;
      const v = 2 * u * (1 - u);
      const k = (1 - u) * (1 - u);
      const x = hx * w + mx * v + at.x * k;
      const y = hy * w + my * v + at.y * k;
      const rad = l.tile * (BEAD_HEAD + (BEAD_TAIL - BEAD_HEAD) * along);
      // Brightest in the middle of the run: a head that lit at full strength
      // would be a dot appearing at the screen's edge every trip.
      const lit = BEAD_LIT * alive * Math.sin(Math.PI * along) ** 0.7;
      if (lit <= 0) continue;
      // The ground the head carries with it, laid first so the light sits on
      // top of it. Only the outer half of the stream drags: a veil that
      // reached the target would be the one thing the brief refuses.
      const drag = DRAG * alive * Math.max(0, 1 - along * 2);
      if (drag > 0) {
        const under = ctx.createRadialGradient(x, y, 0, x, y, rad);
        under.addColorStop(0, rgba(PALETTE.background, drag));
        under.addColorStop(1, rgba(PALETTE.background, 0));
        ctx.fillStyle = under;
        ctx.fillRect(x - rad, y - rad, rad * 2, rad * 2);
      }
      const bead = ctx.createRadialGradient(x, y, 0, x, y, rad);
      bead.addColorStop(0, rgba(PALETTE.hullRim, lit));
      bead.addColorStop(0.4, rgba(PALETTE.hull, lit * 0.5));
      bead.addColorStop(1, rgba(PALETTE.hull, 0));
      ctx.fillStyle = bead;
      // Added rather than laid over: a stream crossing a mark has to leave the
      // mark readable, which is the first line of the brief.
      ctx.globalCompositeOperation = "lighter";
      ctx.fillRect(x - rad, y - rad, rad * 2, rad * 2);
      ctx.globalCompositeOperation = "source-over";
    }
  }
  ctx.restore();
};
