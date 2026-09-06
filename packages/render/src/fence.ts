import { fenceGapSeen, type World } from "@neon-spore/sim";
import { drawnRow } from "./depth.js";
import { drawFenceGate } from "./fence-gate.js";
import { strokeGlow } from "./glow.js";
import { type Layout, tileCX, tileCY } from "./layout.js";
import { PALETTE, STROKE } from "./palette.js";

/**
 * THE FENCE: a live line the width of the field, and the two different
 * pictures of it the two screens carry.
 *
 * **Player 1 sees where it is broken and player 2 sees a wall.** That is the
 * whole creature and it is the whole of this file: the wire is drawn tile by
 * tile, and on the pilot's screen the tiles it is open in are simply not
 * drawn — the line stops, the two ends spark, and the way through is a hole
 * you can see the field's own grid through. On the navigator's screen the same
 * wire runs from wall to wall, and the navigator is the only seat that can move
 * the dome (`comms.ts`).
 *
 * **Except where the cannon cut it.** A burnt column is on **both** screens:
 * the bolt went up in front of the two of them, so there is nothing left to
 * withhold. `fenceGapSeen` is the one place that split is decided and it lives
 * in the simulation, because *which of these holes is a secret* is a fact about
 * the creature rather than about a canvas.
 *
 * **The wobble is the same on both screens, deliberately.** It is a function
 * of the column, the row and the wall clock and of nothing else — no term in
 * it knows where a gap is — so a navigator watching the line hard cannot read
 * the answer out of how it is shaking. That is `ghost-row.ts`'s rule about a
 * sweep said about a wire: anything drawn here that varies across the width of
 * the field *with the gaps* is the answer, given away.
 *
 * **It is drawn flat, outside the per-body perspective transform.** A fence is
 * not a body standing on a tile — it has no centre to scale about and it
 * covers every column at once — so `frame-field.ts` calls this before the pass
 * that places bodies, the way it already does for a worm and a wheel.
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
const GAUGE = 0.34;

/** How wide the wires are drawn, as a share of a tile, and the floor in CSS
 * pixels below which a phone stops showing one at all. A share rather than
 * `STROKE.outline` flat: the fence is the width of the field, so its weight
 * has to grow with the field the way a body's does. */
const WIRE = 0.055;
const WIRE_MIN = 2.2;

/** Turns of the crackle a second. Fast enough to read as current and not as
 * something swinging. */
const CRACKLE_HZ = 11;

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

/** Whether this screen is shown where the wave opened the fence. The pilot's
 * read, the same half as every other thing the shield answers
 * (docs/spec/roles.md) — and the sharpest one there is, because the seat that
 * can act on it is the other one. A column the *cannon* cut is on both screens
 * either way, which is `fenceGapSeen`'s business and not this predicate's. */
export function showsFenceGaps(l: Layout): boolean {
  return l.role !== "p2";
}

/** Every fence on the field, drawn. Called once per frame from
 * `frame-field.ts`, before the pass that places bodies on tiles. */
export function drawFences(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  beatPhase: number,
  time: number,
): void {
  const secret = showsFenceGaps(l);
  for (const c of world.creatures) {
    if (c.kind !== "fence") continue;
    const row = drawnRow(c, beatPhase);
    const y = tileCY(l, row);
    // The runs of unbroken wire, in columns. One run on the navigator's screen
    // unless the cannon has cut one; one per stretch of solid fence on the
    // pilot's.
    let from = 0;
    for (let col = 0; col <= l.cols; col++) {
      if (col < l.cols && !fenceGapSeen(c, col, secret)) continue;
      if (col > from) drawRun(ctx, l, from, col, row, y, time);
      if (col < l.cols) drawFenceGate(ctx, l, col, y, time);
      from = col + 1;
    }
    if (from < l.cols) drawRun(ctx, l, from, l.cols, row, y, time);
  }
}

/**
 * One unbroken stretch of fence, from the left edge of column `from` to the
 * left edge of column `to`: two wires with a rail of light between them, and a
 * hot bead at each end of each. An end is either the side of the field the
 * current comes out of or the lip of a gap, and both are where the eye lands.
 */
function drawRun(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  from: number,
  to: number,
  row: number,
  y: number,
  time: number,
): void {
  const x0 = tileCX(l, from) - l.tile / 2;
  const x1 = tileCX(l, to) - l.tile / 2;
  const gauge = l.tile * GAUGE;
  // The rail: everything between the two wires, filled faintly, so the fence
  // reads as a band with a charge in it rather than as two unrelated lines.
  // Under them, because a fill over a wire would take the glow's edge off it.
  ctx.save();
  ctx.fillStyle = PALETTE.arc;
  ctx.globalAlpha = 0.16;
  ctx.fillRect(x0, y - gauge / 2, x1 - x0, gauge);
  ctx.restore();
  for (const wire of [-1, 1]) {
    drawWire(ctx, l, from, to, row, y + (wire * gauge) / 2, time, wire);
  }
}

/** One of the two wires of a run, and the beads at its ends. */
function drawWire(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  from: number,
  to: number,
  row: number,
  y: number,
  time: number,
  wire: number,
): void {
  const x0 = tileCX(l, from) - l.tile / 2;
  const x1 = tileCX(l, to) - l.tile / 2;
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
    if (i === 0) path.moveTo(x, y + stray);
    else path.lineTo(x, y + stray);
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
  drawTerminal(ctx, l, x0, y, time);
  drawTerminal(ctx, l, x1, y, time);
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
