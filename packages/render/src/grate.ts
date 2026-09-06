import { grateIsOpen, type World } from "@neon-spore/sim";
import { drawnRow } from "./depth.js";
import { strokeGlow } from "./glow.js";
import { drawGrateGate } from "./grate-gate.js";
import { type Layout, tileCX, tileCY } from "./layout.js";
import { PALETTE, STROKE } from "./palette.js";

/**
 * THE GRATE: a live line the width of the field, and the two different
 * pictures of it the two screens carry.
 *
 * **Player 1 sees where it is broken and player 2 sees a wall.** That is the
 * whole creature and it is the whole of this file: the filament is drawn tile
 * by tile, and on the pilot's screen the tiles the wall is open in are simply
 * not drawn — the line stops, the two ends spark, and the way through is a
 * hole you can see the field's own grid through. On the navigator's screen the
 * same filament runs from wall to wall without a break in it, and the
 * navigator is the only seat that can move the dome (`comms.ts`).
 *
 * **The wobble is the same on both screens, deliberately.** It is a function
 * of the column, the row and the wall clock and of nothing else — no term in
 * it knows where a gap is — so a navigator watching the line hard cannot read
 * the answer out of how it is shaking. That is `ghost-row.ts`'s rule about a
 * sweep said about a filament: anything drawn here that varies across the
 * width of the field *with the gaps* is the answer, given away.
 *
 * **It is drawn flat, outside the per-body perspective transform.** A wall is
 * not a body standing on a tile — it has no centre to scale about and it
 * covers every column at once — so `drawCreatures` skips it in the pass that
 * places bodies and calls this instead, the way it already does for a worm and
 * for a wheel's armature.
 */

/** Points of filament per tile. Enough for a line that reads as jagged rather
 * than as a wire with a kink in it, and few enough that eleven columns of it
 * is a path of forty-odd points rather than three hundred. */
const PER_TILE = 4;

/** How far the filament strays from its row, as a share of a tile. Small: the
 * wall has to say *this row, right across* before it says anything else, and a
 * line that wandered half a tile would be a line whose row is a guess. */
const WOBBLE = 0.09;

/** Turns of the crackle a second. Fast enough to read as current and not as
 * something swinging. */
const CRACKLE_HZ = 11;

/**
 * How far the filament strays at one point. A hash of the column and the row
 * rather than a random: two devices draw the same wall, and the pair are
 * looking at one field from two seats.
 *
 * `Math.sin` is fine here and would not be in `packages/sim` — this is a
 * fraction of a pixel on a canvas, not a number rounded into a stored integer
 * (`purity.test.ts` carries that asymmetry as a rule).
 */
function strayAt(l: Layout, at: number, row: number, time: number): number {
  const phase = at * 2.3 + row * 1.7 + time * CRACKLE_HZ;
  return Math.sin(phase) * Math.sin(phase * 0.37 + 1.1) * l.tile * WOBBLE;
}

/** Whether this screen is shown where the wall is open. The pilot's read, the
 * same half as every other rock (docs/spec/roles.md) — and the sharpest one
 * there is, because the seat that can act on it is the other one. */
export function showsGrateGaps(l: Layout): boolean {
  return l.role !== "p2";
}

/** Every wall on the field, drawn. Called once per frame from
 * `drawCreatures`, before the pass that places bodies on tiles. */
export function drawGrates(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  beatPhase: number,
  time: number,
): void {
  const shown = showsGrateGaps(l);
  for (const c of world.creatures) {
    if (c.kind !== "grate") continue;
    const row = drawnRow(c, beatPhase);
    const y = tileCY(l, row);
    // The runs of unbroken filament, in columns. One run on the navigator's
    // screen, always; one per stretch of solid wall on the pilot's.
    let from = 0;
    for (let col = 0; col <= l.cols; col++) {
      const open = col < l.cols && shown && grateIsOpen(c, col);
      if (!open) continue;
      if (col > from) drawRun(ctx, l, from, col, row, y, time);
      drawGrateGate(ctx, l, col, y, time);
      from = col + 1;
    }
    if (from < l.cols) drawRun(ctx, l, from, l.cols, row, y, time);
  }
}

/**
 * One unbroken stretch of wall, from the left edge of column `from` to the
 * left edge of column `to`. Its two ends are drawn hot: an end is either the
 * side of the field the current is coming out of or the lip of a gap, and both
 * are the place the eye needs to land on.
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
  const steps = Math.max(2, Math.round((to - from) * PER_TILE));
  const path = new Path2D();
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const x = x0 + (x1 - x0) * t;
    // Pinned at both ends: a filament that jittered where it meets the wall or
    // the lip of a gap would read as a line that has come loose, and what the
    // pair is looking at is a thing anchored at both ends and humming.
    const edge = Math.min(t, 1 - t) * 2;
    const stray = i === 0 || i === steps ? 0 : strayAt(l, from + (to - from) * t, row, time) * edge;
    if (i === 0) path.moveTo(x, y + stray);
    else path.lineTo(x, y + stray);
  }
  strokeGlow(ctx, path, PALETTE.arc, STROKE.outline, 1.4);
  // The white core, thin and over the top: the glow above is the field the
  // line sits in and this is the line itself.
  ctx.save();
  ctx.strokeStyle = PALETTE.arcRim;
  ctx.lineWidth = STROKE.inner;
  ctx.stroke(path);
  ctx.restore();
  drawTerminal(ctx, l, x0, y, time);
  drawTerminal(ctx, l, x1, y, time);
}

/**
 * The bead of light where a run of filament ends. Sized off the tile so it
 * grows with the field rather than with the screen, and pulsed on the same
 * clock as the crackle so the whole wall reads as one circuit.
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
  ctx.arc(x, y, Math.max(1.2, l.tile * 0.055 * pulse), 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}
