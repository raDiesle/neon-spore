import { faded } from "./instar-plate.js";
import { PALETTE } from "./palette.js";

/**
 * **An egg nobody has taken yet, cracking as the window runs.**
 *
 * The eggs used to sit whole until the window closed and then hatch all at
 * once (`instar-strike.ts`), so the only clock on the nest was the shiver.
 * Now the shell says it too, on the egg and never as a bar: at a quarter of
 * the window a hairline runs down from its crown, and at three quarters it
 * has split, the gap dark, with the hatchling's eye moving in it. An egg
 * squashed or swiped is gone before it gets there, so what cracks is exactly
 * what is still to do.
 *
 * Drawn in the egg's own frame — centred, turned by its tilt — so the crack
 * shivers with the egg rather than beside it.
 */

/** Where the window has to be for each stage, as `instarThreat` counts it. */
export const HAIRLINE_AT = 0.25;
export const SPLIT_AT = 0.75;

/** The crack from the crown down, in half-widths and half-heights. */
const CRACK: readonly (readonly [number, number])[] = [
  [0, -0.96],
  [0.2, -0.62],
  [-0.12, -0.34],
  [0.18, -0.04],
  [-0.04, 0.22],
];

/** How far the two sides of a split stand apart, in half-widths. */
const GAP = 0.3;

/**
 * The crack on one egg, for the window at `threat`. `w`/`h` are the egg's
 * half-sizes; `turn` mirrors the crack on alternate eggs and sets the
 * hatchling's own rhythm, so a nest of them does not crack as one.
 */
export function drawEggCrack(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  tilt: number,
  threat: number,
  fade: number,
  time: number,
  turn: number,
): void {
  if (threat < HAIRLINE_AT) return;
  const side = turn % 2 === 0 ? 1 : -1;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(tilt);
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  if (threat >= SPLIT_AT) {
    // The split: the crack opened into a dark wedge, widest at the crown.
    const gap = new Path2D();
    CRACK.forEach(([cx, cy], i) => {
      const open = GAP * (1 - i / CRACK.length);
      const px = (side * cx - open) * w;
      if (i === 0) gap.moveTo(px, cy * h);
      else gap.lineTo(px, cy * h);
    });
    for (let i = CRACK.length - 1; i >= 0; i--) {
      const [cx, cy] = CRACK[i] ?? [0, 0];
      gap.lineTo((side * cx + GAP * (1 - i / CRACK.length)) * w, cy * h);
    }
    gap.closePath();
    ctx.fillStyle = faded(PALETTE.background, fade, 0.92);
    ctx.fill(gap);
    // Something inside, awake: an eye sliding up and down the dark.
    const along = 0.45 + 0.25 * Math.sin(time * 7 + turn * 1.7);
    const [ex, ey] = CRACK[1] ?? [0, 0];
    const eye = new Path2D();
    eye.arc(side * ex * w * 0.6, (ey + along * 0.5) * h, w * 0.2, 0, Math.PI * 2);
    ctx.fillStyle = faded(PALETTE.ember, fade);
    ctx.fill(eye);
  }
  // The hairline, over the split's edge as well as on its own.
  ctx.strokeStyle = faded(PALETTE.bileDeep, fade);
  ctx.lineWidth = Math.max(1, w * 0.16);
  ctx.beginPath();
  CRACK.forEach(([cx, cy], i) => {
    if (i === 0) ctx.moveTo(side * cx * w, cy * h);
    else ctx.lineTo(side * cx * w, cy * h);
  });
  ctx.stroke();
  ctx.restore();
}
