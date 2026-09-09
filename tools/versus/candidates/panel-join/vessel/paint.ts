import { openSmoothPath, type Point } from "../../../../../packages/content/src/index.js";
import { hash01 } from "../../../../../packages/render/src/backdrop.js";
import type { BandAttach } from "../../../../../packages/render/src/band-join.js";
import { rgba } from "../../../../../packages/render/src/hex.js";
import type { Circle, Layout } from "../../../../../packages/render/src/layout.js";
import { sky, wash } from "../fused/tissue.js";
import { curve, groups, sprays, tube } from "./vein.js";

/**
 * The paint VESSEL is made of.
 *
 * The owner's own sentence, and this card is the literal reading of it: *maybe
 * more veins, big and small ones which hold the buttons cannon and so on,
 * controlling it*. So the chamber is a **circulatory tree** — two or three
 * aortas leaving the ship, forking, forking again, and ending in the controls —
 * with a transverse vessel running the width to tie the whole thing into one
 * network and a spray of capillaries too fine to follow.
 *
 * What makes it a different answer from FUSED rather than a busier one is where
 * the branching happens. FUSED gives every control its own stalk from the roof,
 * so the panel is five organs on one ceiling. Here two controls **share** a
 * trunk and part company halfway down, which is the one thing that says the two
 * buttons are parts of a single body rather than neighbours on one.
 */

/** Where a trunk forks, as a share of the way from the roof to the buttons. */
const FORK = 0.26;
/** Where the transverse vessel runs, on the same share. */
const ARCH = 0.72;

/** Half-widths, in button radii: the aorta at the roof, at the fork, a branch
 * where it leaves the fork, and where it enters the button. */
const AORTA = 1.7;
const NECK = 0.62;
const BRANCH = 0.42;
const ENTRY = 0.8;

/** Samples along a centreline. A vessel is read along its length, so it wants
 * enough that the spline never runs straight and no more. */
const STEPS = 16;

/** Everything the tree is made of at one moment, as three path strings: the
 * vessels themselves, the collars where one enters a control, and the
 * capillaries. */
function tree(l: Layout, lobes: readonly Circle[], time: number): [string, string, string, string] {
  const top = sky(l);
  let big = "";
  let collars = "";
  let fine = "";
  let cores = "";

  for (const [g, pair] of groups(lobes).entries()) {
    const first = pair[0] as Circle;
    const r = first.r;
    // Not the midpoint. A root exactly between two buttons draws a wishbone —
    // two mirrored diagonals meeting at a point — and a wishbone is a piece of
    // engineering. It is biased a fifth of the way toward one of them, which
    // side depending on the group, so the two branches leave at different
    // angles and the thing reads as having grown rather than been laid out.
    const span = pair.reduce((sum, c) => sum + c.x, 0) / pair.length;
    const lean = pair.length > 1 ? ((pair[1] as Circle).x - (pair[0] as Circle).x) * 0.2 : 0;
    const rootX = span + (hash01(g * 23 + 5) < 0.5 ? -lean : lean);
    const forkY = top + (first.y - top) * FORK;
    const archY = top + (first.y - top) * ARCH;
    const drift = Math.sin(time * 0.42 + g * 2.1) * r * 0.12;

    // The aorta: out of the ship, thickening as it comes away from the roof and
    // narrowing into the fork. It starts above the membrane, so the chamber's
    // own clip is what joins it to the ship (`tissue.ts`).
    const stem = curve(
      { x: rootX, y: top },
      { x: rootX + drift, y: forkY },
      { x: rootX, y: top + (forkY - top) * 0.4 },
      { x: rootX + drift, y: top + (forkY - top) * 0.8 },
      STEPS,
    );
    big += tube(stem, (p) => r * (AORTA - (AORTA - NECK) * p ** 0.7));
    cores += openSmoothPath(stem.slice(2, -1));

    for (const c of pair) {
      // A branch leaves the fork going **down** and arrives at the button going
      // down, and does all of its travelling sideways in between: both control
      // points sit on a vertical, so the centreline is an S with no straight
      // run in it anywhere. The first pass put them on the diagonal instead and
      // drew two long ruled lines meeting in a tent — a vein does not have a
      // corner in it, and neither does anything else on this ship.
      const mid = curve(
        { x: rootX + drift, y: forkY },
        { x: c.x, y: c.y },
        { x: rootX + drift, y: forkY + (c.y - forkY) * (0.36 + hash01(Math.round(c.x)) * 0.3) },
        { x: c.x, y: forkY + (c.y - forkY) * 0.58 },
        STEPS,
      );
      big += tube(mid, (p) => r * (NECK + (BRANCH - NECK) * p + (ENTRY - BRANCH) * p ** 5));
      cores += openSmoothPath(mid.slice(1, -2));
      collars += `M ${(c.x + r * 1.24).toFixed(2)} ${c.y.toFixed(2)} A ${(r * 1.24).toFixed(2)} ${(
        r * 1.24
      ).toFixed(2)} 0 1 1 ${(c.x - r * 1.24).toFixed(2)} ${c.y.toFixed(2)} `;
      fine += sprays(c, mid, r, g);
    }

    // The transverse vessel: one long, thin, undulating line across the whole
    // panel, passing behind every branch. It is what turns a set of trees into
    // a network — and it is the only part of this that has to exist whether or
    // not there is a rail under it, because `attach` is told which controls the
    // screen carries and never which strips it draws.
    if (g === 0) {
      const span: Point[] = [];
      for (let i = 0; i <= 26; i++) {
        const u = i / 26;
        const x = l.gridLeft + l.gridWidth * u;
        span.push({
          x,
          y:
            archY +
            Math.sin(u * 5.1 + time * 0.24) * r * 0.34 +
            Math.sin(u * 11.7 + 1.3) * r * 0.16,
        });
      }
      big += tube(span, (p) => r * (0.07 + 0.17 * Math.sin(p * Math.PI)));
    }
  }
  return [big, collars, fine, cores];
}

/**
 * VESSEL: the panel is one circulatory system and the controls are where it
 * ends.
 *
 * Three fills and four strokes for the whole panel, whatever is on it — the
 * bargain every pass on this band makes, and the reason a tree with sixty
 * capillaries in it costs about what the shipped five feeders cost.
 */
export function vascular(d: BandAttach): void {
  const { ctx, l, lobes, time, skin } = d;
  wash(d);
  if (lobes.length === 0) return;

  const [big, collars, fine, cores] = tree(l, lobes, time);
  const top = sky(l);
  const deepest = Math.max(...lobes.map((c) => c.y + c.r));

  const grad = ctx.createLinearGradient(0, top, 0, deepest);
  // **Dark at the top and bright at the bottom**, which is the way round a
  // vein goes and the opposite of the way a stalk does. The tissue this leaves
  // is washed pale by the light coming through the membrane, so a vessel
  // painted pale there disappears into it — a real one reads as a shadow under
  // a lit surface. Lower down, where the chamber has gone dark, the same vessel
  // is the brightest thing in it.
  grad.addColorStop(0, rgba(skin.ground[1], 0.6));
  grad.addColorStop(0.42, rgba(skin.flesh[1], 0.55));
  grad.addColorStop(1, rgba(skin.tint, 0.46));

  ctx.lineCap = "round";
  // The capillaries first and under everything: a hair crossing a vessel it
  // came out of is the one thing here that would read as drawn rather than
  // grown.
  ctx.strokeStyle = rgba(skin.flesh[1], 0.3);
  ctx.lineWidth = Math.max(0.7, l.tile * 0.03);
  ctx.stroke(new Path2D(fine));

  const vessels = new Path2D(big);
  ctx.fillStyle = grad;
  ctx.fill(vessels);
  ctx.strokeStyle = rgba(skin.tint, 0.3);
  ctx.lineWidth = Math.max(0.8, l.tile * 0.034);
  ctx.stroke(vessels);

  // The swelling where a vessel enters a control, drawn as a ring under the
  // socket so the button reads as the place the tissue opens rather than as a
  // lid laid over it.
  ctx.fillStyle = rgba(skin.flesh[0], 0.16);
  ctx.fill(new Path2D(collars));
  ctx.strokeStyle = rgba(skin.tint, 0.16);
  ctx.lineWidth = Math.max(0.8, l.tile * 0.03);
  ctx.stroke(new Path2D(collars));

  // The lumen: a soft thread of light down the middle of every vessel, which is
  // what says a tube is round. Without it the tree is a set of flat ribbons
  // however well its outline is drawn, and it is the one pass that costs
  // nothing to add because the centrelines were already sampled to build the
  // outlines from.
  ctx.strokeStyle = rgba(skin.rim, 0.1);
  ctx.lineWidth = Math.max(1, l.tile * 0.05);
  ctx.stroke(new Path2D(cores));
}
