import type { Chart } from "./fleet-chart.js";
import { PALETTE } from "./palette.js";

/**
 * **A chart's lattice**: the lines between the squares, a mark on every
 * crossing pulsing on the beat, and a frame round the whole — THE FLEET's
 * chart without its letters, its numbers, its water or its clock.
 *
 * Cut out of `fleet-chart.ts` on 3 October 2026 for THE MIMIC's board, the
 * owner's *chess tiles like in THE FLEET, but without the alphabets*: one
 * drawing of the squares rather than two, so the two boards a pair meets
 * read alike. `frame` is the colour round the outside, the shield's on THE
 * FLEET and the brush's on THE MIMIC.
 */
export function drawChartLattice(
  ctx: CanvasRenderingContext2D,
  c: Chart,
  flash: number,
  frame: string = PALETTE.shield,
): void {
  const w = c.cols * c.tile;
  const h = c.rows * c.tile;
  ctx.strokeStyle = `rgba(47,224,240,${0.1 + 0.16 * flash})`;
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let col = 0; col <= c.cols; col++) {
    const x = c.left + col * c.tile;
    ctx.moveTo(x, c.top);
    ctx.lineTo(x, c.top + h);
  }
  for (let row = 0; row <= c.rows; row++) {
    const y = c.top + row * c.tile;
    ctx.moveTo(c.left, y);
    ctx.lineTo(c.left + w, y);
  }
  ctx.stroke();

  // The crossings carry the pulse more strongly than the lines, the same way
  // the field's lattice was written to.
  //
  // **One path, not one call each.** Twelve by eleven of them is 132
  // `fillRect` every frame for the whole length of the fight, which was
  // seventy per cent of every rectangle the game drew during it. They are
  // never anywhere near each other — a crossing is `tile` apart and the square
  // is at most 2.6 px — so a single `fill` of all of them is the same picture
  // to the pixel, with no overlap for the alpha to double.
  //
  // Rebuilt every frame rather than cached, and that is the honest answer
  // rather than a missed saving: the square's size is the pulse, and a path
  // kept across frames would have to quantise `s` — which is a change to what
  // the pair sees, and this is a speed fix.
  ctx.fillStyle = `rgba(47,224,240,${0.16 + 0.44 * flash})`;
  const s = crossingSize(flash);
  const marks = new Path2D();
  for (let col = 0; col <= c.cols; col++) {
    for (let row = 0; row <= c.rows; row++) {
      marks.rect(c.left + col * c.tile - s / 2, c.top + row * c.tile - s / 2, s, s);
    }
  }
  ctx.fill(marks);

  ctx.strokeStyle = frame;
  ctx.globalAlpha = 0.55;
  ctx.lineWidth = 1.5;
  ctx.strokeRect(c.left + 0.75, c.top + 0.75, w - 1.5, h - 1.5);
  ctx.globalAlpha = 1;
}

/**
 * How wide the mark on a crossing is, at this much pulse.
 *
 * Exported because it is the condition the single fill rests on rather than a
 * number inside a loop: one `fill` of every mark is the picture 132 `fillRect`
 * calls made **only while no two marks touch**, since overlapping rects blend
 * twice under separate fills and once under one, and the mark carries alpha.
 * `test/fleet-frame.test.ts` holds the widest of them against the gap between
 * two crossings.
 */
export function crossingSize(flash: number): number {
  return 1.2 + 1.4 * flash;
}
