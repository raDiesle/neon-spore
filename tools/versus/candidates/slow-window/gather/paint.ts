import { sinHash } from "../../../../../packages/render/src/hash.js";
import { rgba } from "../../../../../packages/render/src/hex.js";
import { PALETTE } from "../../../../../packages/render/src/palette.js";
import type { SlowLook } from "../../../../../packages/render/src/slow-look.js";
import { aim, ramp } from "./aim.js";

/**
 * **Light falls toward the thing being answered, and the screen's corners go
 * quiet.** The softest answer in the slot, and the only one with nothing in it
 * that has an edge.
 *
 * The owner's brief, 22 September 2026: understated enough that the field stays
 * crystal clear, very soft diffuse motes drifting inward toward one almost
 * stationary target, no hard shapes at all — borderless volumetric gradients
 * and bokeh only, no lines, no streaks, no shockwave — a gentle vignette at a
 * fifth to a third, and every parameter interpolated over four tenths of a
 * second when the window opens and again when it shuts.
 *
 * Three layers, in the order an eye reads them: the corners sink, motes drift
 * in along their own rays, and the target keeps a wide diffuse bloom that
 * tightens as they arrive. Every one of them is a radial gradient — there is
 * no `stroke`, no `rect` with a visible edge and no path in this file, which is
 * what makes it the answer that cannot draw furniture.
 *
 * **It is the only candidate in the slot that ends.** `frame`, `drain`,
 * `gutter` and `wash` are all at their loudest on the frame before the window
 * shuts and gone on the frame after it, because `paint` stops being called at
 * all the instant `slowing` goes false (`slow-look.ts`). `ramp` spends the
 * owner's four tenths of a second *inside* the window at both ends, so the
 * look arrives from nothing and leaves to nothing without asking `Effects` to
 * remember anything (`aim.ts`).
 *
 * **Against the other soft answers.** `hush` is this one with the motes taken
 * out — nothing moves, and the whole message is carried by a gradient.
 * `indraw` is this one with the motes joined up into streams, so the suction
 * reads as flow rather than as grain. The three are one brief drawn three
 * ways, and what they differ by is what carries it.
 *
 * **How it can lose.** It is the quietest thing anybody has proposed for this
 * slot, and the state the game is in today is *nothing at all* — a picture the
 * pair do not notice is not a smaller version of the answer, it is the
 * question still open. Motes near the target are also motes over the marks the
 * pair have to read at the one moment reading them is hardest, which is
 * `wash`'s risk arriving by a different road. And it costs about twenty
 * gradients a frame, all of them on the field, where `wash` costs two.
 */

/** How many motes are on the field at once. */
const MOTES = 18;

/** Trips a mote makes across the window, so light keeps arriving rather than
 * all of it landing at once and the field going still for the second beat. */
const TRIPS = 1.7;

/** Where a mote starts and ends its fall, as a share of the run from the
 * target to the field's own edge. It never reaches: a mote that landed would
 * be a dot on the target, and a dot has an edge. */
const FAR = 1;
const NEAR = 0.09;

/** How far the ring of starting places reaches, as a share of the field's
 * width and of its height. Two numbers and not one: a circle on a portrait
 * field leaves the corners empty and crowds the sides. */
const SPREAD_X = 0.62;
const SPREAD_Y = 0.52;

/** A mote at its brightest, and the size of the smallest and largest, in tiles. */
const MOTE_LIT = 0.16;
const MOTE_SMALL = 0.22;
const MOTE_LARGE = 0.52;

/** The vignette at the corners on the beat the window opens and on the beat it
 * shuts — the owner's fifth to a third. */
const VIGNETTE_OPEN = 0.2;
const VIGNETTE_SHUT = 0.3;

/** Where the vignette starts to bite, as a share of the run to the far corner.
 * Well past the middle: a vignette that begins at the centre is a spotlight. */
const VIGNETTE_ONSET = 0.46;

/** The bloom on the target at the open and at the shut, in target radii, and
 * how bright it stands. */
const BLOOM_WIDE = 5.2;
const BLOOM_TIGHT = 3.4;
const BLOOM_LIT = 0.2;

export const gatheringLight: SlowLook["paint"] = (ctx, l, world, view, win) => {
  const up = ramp(win, world.cfg);
  if (up <= 0) return;
  const t = win.through;
  const at = aim(world, l, view.beatPhase);
  const top = l.gridTop;
  // To the hull and no further, the way every answer in this slot ends: below
  // it is the ship's own tissue, drawn over this pass, and a vignette has
  // nothing to say about a hand (`slow-look.ts`).
  const floor = l.hullY;
  if (floor <= top) return;

  ctx.save();
  ctx.beginPath();
  ctx.rect(0, top, l.width, floor - top);
  ctx.clip();

  // The corners sink. Centred on the play area rather than on the target, so
  // that a step of marks low on the field does not tip the whole screen.
  const cx = l.width / 2;
  const cy = (top + floor) / 2;
  const far = Math.hypot(l.width / 2, (floor - top) / 2);
  const dark = (VIGNETTE_OPEN + (VIGNETTE_SHUT - VIGNETTE_OPEN) * t) * up;
  const edge = ctx.createRadialGradient(cx, cy, far * VIGNETTE_ONSET, cx, cy, far);
  edge.addColorStop(0, rgba(PALETTE.background, 0));
  edge.addColorStop(1, rgba(PALETTE.background, dark));
  ctx.fillStyle = edge;
  ctx.fillRect(0, top, l.width, floor - top);

  // Everything below is light, so it adds rather than covers: a mote over a
  // mark has to leave the mark readable, which is the whole brief.
  ctx.globalCompositeOperation = "lighter";

  const spanX = l.width * SPREAD_X;
  const spanY = (floor - top) * SPREAD_Y;
  for (let i = 0; i < MOTES; i++) {
    // Each mote's ray, its own head start and its own size, looked up rather
    // than rolled: `sinHash` is render's one repeatable 0..1, and a mote that
    // moved somewhere else every frame would flicker rather than drift.
    const angle = sinHash(i) * Math.PI * 2;
    const travel = (t * TRIPS + sinHash(i, 1)) % 1;
    const size = sinHash(i, 2);
    // Eased, so a mote slows as it nears — light falling into a well, not a
    // dot on a rail.
    const reach = FAR - (FAR - NEAR) * travel * travel;
    const x = at.x + Math.cos(angle) * spanX * reach;
    const y = at.y + Math.sin(angle) * spanY * reach;
    // Up out of nothing and back into it across its own fall, so no mote ever
    // appears or vanishes where an eye can catch it doing either.
    const lit = Math.sin(Math.PI * travel) ** 2 * MOTE_LIT * up;
    const rad = l.tile * (MOTE_SMALL + (MOTE_LARGE - MOTE_SMALL) * size);
    const mote = ctx.createRadialGradient(x, y, 0, x, y, rad);
    mote.addColorStop(0, rgba(PALETTE.hullRim, lit));
    mote.addColorStop(0.4, rgba(PALETTE.hull, lit * 0.45));
    mote.addColorStop(1, rgba(PALETTE.hull, 0));
    ctx.fillStyle = mote;
    ctx.fillRect(x - rad, y - rad, rad * 2, rad * 2);
  }

  // And what they are falling into: a bloom that tightens and brightens as the
  // window is spent, so the target reads as the place the light is going.
  const halo = at.r * (BLOOM_WIDE + (BLOOM_TIGHT - BLOOM_WIDE) * t);
  const lit = BLOOM_LIT * up * (0.45 + 0.55 * t);
  const bloom = ctx.createRadialGradient(at.x, at.y, 0, at.x, at.y, halo);
  bloom.addColorStop(0, rgba(PALETTE.hullRim, lit));
  bloom.addColorStop(0.35, rgba(PALETTE.hull, lit * 0.5));
  bloom.addColorStop(1, rgba(PALETTE.hull, 0));
  ctx.fillStyle = bloom;
  ctx.fillRect(at.x - halo, at.y - halo, halo * 2, halo * 2);
  ctx.restore();
};
