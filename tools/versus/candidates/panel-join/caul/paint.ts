import { openSmoothPath, type Point } from "../../../../../packages/content/src/index.js";
import { hash01 } from "../../../../../packages/render/src/backdrop.js";
import type { BandAttach } from "../../../../../packages/render/src/band-join.js";
import { seamBottom } from "../../../../../packages/render/src/band-seam.js";
import { rgba } from "../../../../../packages/render/src/hex.js";
import type { Circle, Layout } from "../../../../../packages/render/src/layout.js";
import { belly, sameLight, sky } from "../fused/tissue.js";

/**
 * The paint CAUL is made of.
 *
 * Every other answer in this slot grows *things* out of the ship: stalks,
 * vessels, sacs. This one grows **nothing**, and that is its claim. The ship
 * simply keeps going: one continuous sheet of tissue hanging out of the hull,
 * across the whole width, with a hem that comes down around every control and
 * rises between them the way webbing rises between fingers.
 *
 * It is the answer to take if what is wrong with the shipped panel is that
 * anything at all is drawn *between* the ship and the buttons. A stalk, however
 * well grown, is still a second object with two ends; a caul has one edge and
 * no ends, so there is no join anywhere on it to look at.
 */

/** How far down the hem hangs between controls, as a share of the way from the
 * membrane to the buttons — and how far past a control it reaches, in radii. */
const WEB = 0.34;
const WRAP = 1.15;
/** How wide the pull of one control is on the hem, in radii. */
const REACH = 2.5;

/** Samples across the width. The hem is the only line in this candidate a
 * player will actually look at, so it is sampled finely. */
const STEPS = 54;

/** Where the hem hangs at one x. */
function hemY(l: Layout, lobes: readonly Circle[], x: number, time: number, share: number): number {
  const floor = lobes.length > 0 ? (lobes[0] as Circle).y : l.bandTop + l.bandHeight * 0.6;
  const from = seamBottom(l);
  const high = from + (floor - from) * WEB * share;
  // A **smooth** union of the pulls, not `Math.max` of them. Two bells taken
  // pairwise by `max` have a corner where they cross, and between two controls
  // that corner is a spike pointing up out of the hem — a fang in the middle of
  // a shape whose whole argument is that it has no corners in it. Multiplying
  // the complements is the same union with no crossing point to have a corner
  // at, and it costs one line.
  let away = 1;
  let deepest = high;
  for (const c of lobes) {
    const k = (x - c.x) / Math.max(1, c.r * REACH);
    away *= 1 - Math.exp(-k * k);
    deepest = Math.max(deepest, c.y + c.r * WRAP * share);
  }
  const low = high + (deepest - high) * (1 - away);
  // The web between two controls is not a straight catenary: it breathes, and
  // out past the last control it keeps drifting rather than running flat to the
  // edge of the screen.
  const u = x / Math.max(1, l.width);
  return (
    low +
    Math.sin(u * 5.7 + time * 0.21) * l.tile * 0.14 * share +
    Math.sin(u * 12.1 + 1.7 - time * 0.13) * l.tile * 0.07 * share
  );
}

/** One sheet, from above the membrane down to its own hem. */
function sheet(
  l: Layout,
  lobes: readonly Circle[],
  time: number,
  share: number,
): { path: string; edge: string; deepest: number } {
  const top = sky(l);
  const hem: Point[] = [];
  let deepest = top;
  for (let i = 0; i <= STEPS; i++) {
    const x = (l.width * i) / STEPS;
    const y = hemY(l, lobes, x, time, share);
    hem.push({ x, y });
    if (y > deepest) deepest = y;
  }
  const edge = openSmoothPath(hem);
  const first = hem[0] as Point;
  const last = hem[STEPS] as Point;
  // Up the right-hand side, across the top above the membrane, and down the
  // left: the top edge is never seen, because the chamber's own clip cuts this
  // sheet to the contour of the ship it hangs from.
  const path = `${edge} L ${last.x.toFixed(2)} ${top.toFixed(2)} L ${first.x.toFixed(2)} ${top.toFixed(2)} Z`;
  return { path, edge, deepest };
}

/** How many creases run down the sheet. */
const FOLDS = 9;

/**
 * The folds. A sheet of anything that hangs has creases in it, and without them
 * this is a coloured rectangle with a wavy bottom — the fold is most of what
 * says *cloth* rather than *fill*.
 *
 * Each one runs from above the membrane down to a little short of the hem, and
 * each leans its own way, so nothing in the set repeats across the width.
 */
function folds(l: Layout, lobes: readonly Circle[], time: number): string {
  const top = sky(l);
  let d = "";
  for (let i = 0; i < FOLDS; i++) {
    const x = (l.width * ((i + 0.5) / FOLDS + (hash01(i * 31 + 7) - 0.5) * 0.5)) / 1;
    const end = hemY(l, lobes, x, time, 1) - l.tile * 0.2;
    const drop = Math.max(1, end - top);
    const lean = (hash01(i * 47 + 13) - 0.5) * l.tile * 0.9;
    const drift = Math.sin(time * 0.27 + i * 1.3) * l.tile * 0.08;
    const pts: Point[] = [];
    for (let s = 0; s <= 8; s++) {
      const p = s / 8;
      pts.push({ x: x + (lean + drift) * Math.sin(p * Math.PI), y: top + drop * p });
    }
    d += openSmoothPath(pts);
  }
  return d;
}

/**
 * CAUL: the ship does not stop at the membrane, it hangs.
 *
 * Two sheets, one behind the other at different depths so the thing has a
 * thickness; a lit hem along the front one, which is the only edge in the
 * picture and is where all the light in this chamber ends up; and nine creases.
 * Four fills and three strokes for the whole panel, whatever is on it.
 */
export function draped(d: BandAttach): void {
  const { ctx, l, lobes, time, skin } = d;

  const top = sky(l);
  const back = sheet(l, lobes, time + 3.4, 0.62);
  const front = sheet(l, lobes, time, 1);

  // The sheet behind, deeper in shadow and hanging shorter — it is what stops
  // the front hem reading as the edge of a cut-out.
  const far = ctx.createLinearGradient(0, top, 0, back.deepest);
  far.addColorStop(0, rgba(belly(skin), 0.22));
  far.addColorStop(0.6, rgba(skin.flesh[2], 0.3));
  far.addColorStop(1, rgba(skin.flesh[2], 0.42));
  ctx.fillStyle = far;
  ctx.fill(new Path2D(back.path));

  const near = ctx.createLinearGradient(0, top, 0, front.deepest);
  near.addColorStop(0, rgba(belly(skin), 0.4));
  near.addColorStop(0.35, rgba(skin.flesh[1], 0.24));
  near.addColorStop(0.86, rgba(skin.flesh[1], 0.28));
  near.addColorStop(1, rgba(skin.tint, 0.42));
  ctx.fillStyle = near;
  ctx.fill(new Path2D(front.path));

  ctx.lineCap = "round";
  ctx.strokeStyle = rgba(skin.flesh[2], 0.3);
  ctx.lineWidth = Math.max(0.8, l.tile * 0.045);
  ctx.stroke(new Path2D(folds(l, lobes, time)));

  // The hem, and it is the one lit line this candidate has. `band-seam.ts`
  // removed the lit rim that used to run along the join and said why: a lit
  // line *at* a join reads as a join. This one is nowhere near the join — it is
  // most of a panel's height below it — and what it is lighting is the bottom
  // edge of the ship's own skin, which is a thing rather than a boundary
  // between two.
  ctx.strokeStyle = rgba(skin.tint, 0.34);
  ctx.lineWidth = Math.max(1, l.tile * 0.05);
  ctx.stroke(new Path2D(front.edge));
  ctx.strokeStyle = rgba(skin.rim, 0.16);
  ctx.lineWidth = Math.max(0.6, l.tile * 0.02);
  ctx.stroke(new Path2D(front.edge));

  sameLight(d);
}
