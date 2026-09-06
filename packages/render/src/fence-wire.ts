import { strokeGlow } from "./glow.js";
import type { SurfaceY } from "./hull-frame.js";
import { type Layout, tileCX, tileCY } from "./layout.js";
import { PALETTE, STROKE } from "./palette.js";

/**
 * **What a stretch of live wire looks like, and where it hangs.**
 *
 * Cut out of `fence.ts` when the wall was given a ship to come to rest on and
 * that file went past its 250-line limit. The seam is a real one: next door is
 * *the creature* — which columns each screen is shown the wall broken in, and
 * therefore what either seat can say about it — and everything here is the
 * material it is drawn out of. A reader asking what the two of them are
 * looking at opens that file; a reader asking why the line is drawn heavy, or
 * how far it strays, opens this one.
 *
 * **The wobble is the same on both screens, deliberately.** It is a function
 * of the column, the row and the wall clock and of nothing else — no term in
 * it knows where a gap is — so a navigator watching the line hard cannot read
 * the answer out of how it is shaking. That is `ghost-row.ts`'s rule about a
 * sweep said about a wire: anything drawn here that varies across the width of
 * the field *with the gaps* is the answer, given away.
 *
 * **It is drawn heavy, and the owner asked for that by name.** Two wires a
 * third of a tile apart with a rail of light between them, not one hairline:
 * the thing coming down is a barrier the ship has to be threaded through, and
 * at one stroke's width it read as a scratch on the grid.
 */

/** Points of wire per tile. Enough for a line that reads as jagged rather than
 * as something with a kink in it, and few enough that eleven columns of it is a
 * path of forty-odd points rather than three hundred. */
const PER_TILE = 4;

/** How far a wire strays from its own line, as a share of a tile. It has to say
 * *this row, right across* before it says anything else, so the stray stays
 * well inside the gap between the two wires — a line that wandered further
 * would be a line whose row is a guess. */
const WOBBLE = 0.055;

/** How far apart the two wires run, as a share of a tile. A third: enough that
 * the fence has a *height* on a phone and reads as a thing with a top and a
 * bottom edge, and not so much that which row it is on stops being one row. */
export const GAUGE = 0.34;

/** How wide the wires are drawn, as a share of a tile, and the floor in CSS
 * pixels below which a phone stops showing one at all. A share rather than
 * `STROKE.outline` flat: the fence is the width of the field, so its weight
 * has to grow with the field the way a body's does. */
const WIRE = 0.055;
const WIRE_MIN = 2.2;

/** Turns of the crackle a second. Fast enough to read as current and not as
 * something swinging. */
export const CRACKLE_HZ = 11;

/** How far above the ship's skin the lower wire is stopped, as a share of a
 * tile. Not zero: a wire drawn *on* the membrane is a wire the ship has already
 * conducted, and the gap it leaves is what `fence-arc.ts` fills with the arcs
 * that say the two are fighting each other. */
const CLEAR = 0.2;

/**
 * **Where the wire is, at one x.** Its row's own centre, except that it never
 * goes below the ship: the membrane holds the wall up, so a wall on the hull
 * row is drawn draped along the ship's own outline, lifted where the dome and
 * the cannon stand and lying close everywhere else.
 *
 * The wall used to be drawn at its row's centre and nothing else, and the last
 * frame of one was two tiles clear of the hull — the owner reported it as the
 * fence disappearing before it had touched anything. The simulation's half of
 * that repair is in `resolveFence` (sim/hull.ts); this is the picture's.
 *
 * Nothing about it varies with where the wall is open, so it says nothing to
 * the seat that is not shown the gaps. `surfaceY` absent leaves the wire on
 * its row, which is every frame before the wall is near the ship and every
 * caller that has no ship to stand it on.
 */
export function fenceLineY(l: Layout, row: number, x: number, surfaceY?: SurfaceY): number {
  const y = tileCY(l, row);
  if (!surfaceY) return y;
  return Math.min(y, surfaceY(x) - l.tile * (GAUGE / 2 + CLEAR));
}

/** The screen x of a column's left edge, fractional columns and all. */
export function edgeX(l: Layout, col: number): number {
  return tileCX(l, col) - l.tile / 2;
}

/**
 * How far a wire strays at one point. A hash of the column, the row and which
 * of the two wires it is, rather than a random: two devices draw the same
 * fence, and the pair are looking at one field from two seats.
 *
 * `Math.sin` is fine here and would not be in `packages/sim` — this is a
 * fraction of a pixel on a canvas, not a number rounded into a stored integer
 * (`purity.test.ts` carries that asymmetry as a rule).
 */
function strayAt(l: Layout, at: number, row: number, time: number, wire: number): number {
  const phase = at * 2.3 + row * 1.7 + wire * 2.9 + time * CRACKLE_HZ;
  return Math.sin(phase) * Math.sin(phase * 0.37 + 1.1) * l.tile * WOBBLE;
}

/** How wide a wire is drawn on this field. */
function wireWidth(l: Layout): number {
  return Math.max(WIRE_MIN, l.tile * WIRE);
}

/**
 * One unbroken stretch of fence, from the left edge of column `from` to the
 * left edge of column `to`: two wires with a rail of light between them, and a
 * hot bead at each end of each. An end is either the side of the field the
 * current comes out of or the lip of a gap, and both are where the eye lands.
 */
export function drawRun(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  from: number,
  to: number,
  row: number,
  time: number,
  surfaceY?: SurfaceY,
): void {
  const gauge = l.tile * GAUGE;
  const steps = Math.max(2, Math.round((to - from) * PER_TILE));
  const xs: number[] = [];
  for (let i = 0; i <= steps; i++) xs.push(edgeX(l, from + ((to - from) * i) / steps));
  // The rail: everything between the two wires, filled faintly, so the fence
  // reads as a band with a charge in it rather than as two unrelated lines.
  // Under them, because a fill over a wire would take the glow's edge off it.
  // A sampled band rather than the one rectangle it used to be: the line it
  // fills between is not flat once the ship is holding it up.
  const rail = new Path2D();
  for (let i = 0; i <= steps; i++) {
    const y = fenceLineY(l, row, xs[i]!, surfaceY) - gauge / 2;
    if (i === 0) rail.moveTo(xs[i]!, y);
    else rail.lineTo(xs[i]!, y);
  }
  for (let i = steps; i >= 0; i--) {
    rail.lineTo(xs[i]!, fenceLineY(l, row, xs[i]!, surfaceY) + gauge / 2);
  }
  rail.closePath();
  ctx.save();
  ctx.fillStyle = PALETTE.arc;
  ctx.globalAlpha = 0.16;
  ctx.fill(rail);
  ctx.restore();
  for (const wire of [-1, 1]) {
    drawWire(ctx, l, from, to, row, (wire * gauge) / 2, time, wire, surfaceY);
  }
}

/** One of the two wires of a run, and the beads at its ends. `offset` is how far
 * it runs from the line the pair reads as the fence's own row. */
function drawWire(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  from: number,
  to: number,
  row: number,
  offset: number,
  time: number,
  wire: number,
  surfaceY?: SurfaceY,
): void {
  const x0 = edgeX(l, from);
  const x1 = edgeX(l, to);
  const steps = Math.max(2, Math.round((to - from) * PER_TILE));
  const path = new Path2D();
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const x = x0 + (x1 - x0) * t;
    // Pinned at both ends: a wire that jittered where it meets the field's edge
    // or the lip of a gap would read as one that has come loose, and what the
    // pair is looking at is a thing anchored at both ends and humming.
    const edge = Math.min(t, 1 - t) * 2;
    const stray =
      i === 0 || i === steps ? 0 : strayAt(l, from + (to - from) * t, row, time, wire) * edge;
    const y = fenceLineY(l, row, x, surfaceY) + offset + stray;
    if (i === 0) path.moveTo(x, y);
    else path.lineTo(x, y);
  }
  const width = wireWidth(l);
  strokeGlow(ctx, path, PALETTE.arc, width, 1.8);
  // The white core, thinner and over the top: the glow above is the field the
  // line sits in and this is the line itself.
  ctx.save();
  ctx.strokeStyle = PALETTE.arcRim;
  ctx.lineWidth = Math.max(STROKE.inner, width * 0.45);
  ctx.stroke(path);
  ctx.restore();
  for (const x of [x0, x1]) {
    drawTerminal(ctx, l, x, fenceLineY(l, row, x, surfaceY) + offset, time);
  }
}

/**
 * The bead of light where a wire ends. Sized off the tile so it grows with the
 * field rather than with the screen, and pulsed on the same clock as the
 * crackle so the whole fence reads as one circuit.
 */
function drawTerminal(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  x: number,
  y: number,
  time: number,
): void {
  const pulse = 0.75 + 0.25 * Math.sin(time * CRACKLE_HZ * 0.5 + x * 0.05);
  ctx.save();
  ctx.fillStyle = PALETTE.arcRim;
  ctx.globalAlpha = 0.9;
  ctx.beginPath();
  ctx.arc(x, y, Math.max(1.8, l.tile * 0.085 * pulse), 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}
