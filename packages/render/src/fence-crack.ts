import type { Color } from "@neon-spore/sim";
import { fenceLineY, GAUGE } from "./fence-wire.js";
import { halo, strokeGlow } from "./glow.js";
import { signedHash } from "./hash.js";
import type { SurfaceY } from "./hull-frame.js";
import { type Layout, tileCX } from "./layout.js";
import { PALETTE, STROKE } from "./palette.js";

/**
 * **The breaking point in a wall, on the screen that is shown it.**
 *
 * A gap is a hole the dome is steered into; a crack is a place the *cannon*
 * opens, and the owner asked for it in one sentence: *instead there is a
 * breaking point, in the colour of a slick or a bulb, immediately visible for
 * player 1 — related to colour, the cannon breaks the crack.* So it is drawn
 * where a gate is not: the wire still runs through this column, unbroken, and
 * what is on it is a fault in the material.
 *
 * **It carries a colour, and the colour is half the sentence.** The pilot can
 * see the crack and slide the cannon under it, and both triggers belong to the
 * navigator — so the pilot has to say a number *and* say red or cyan, and the
 * wall does not open until the navigator has loaded the one that was said.
 * That is why the mark is drawn in the ammunition's own hue rather than in the
 * wall's blue: the colour is not decoration here, it is the instruction.
 *
 * **A fracture, not a ring or a box.** Marks on this field are made of light
 * (docs/spec/graphics.md): the two wires are pulled apart into a lens of the
 * crack's colour, a jagged split runs across the band between them, and the
 * whole thing breathes on the wire's own clock. Nothing is drawn *around* the
 * column — a bracket over one column would read as *the shield goes here*,
 * which is exactly the wrong instruction.
 *
 * Its own file beside `fence-gate.ts` for that file's reason: the two are the
 * two things a wall can be open at, and a reader asking which of the two
 * pictures a column is wearing finds one short file per answer.
 */

/** How far the fracture spreads the wire apart, as a share of a tile: the two
 * lines bowing away from each other where the material has failed. */
const SPREAD = 0.22;

/** How many teeth the split across the band has. Odd, so the middle of it is a
 * point rather than a flat. */
const TEETH = 5;

/** How far a tooth strays along the column, as a share of a tile. */
const JAG = 0.13;

/** Turns a second the fault flickers at. Slower than the wire's crackle: this
 * is something failing rather than something running. */
const FLICKER_HZ = 5;

/** The pair of hues a crack is drawn in — the ammunition's own, so the mark
 * says which trigger without a word on the screen. */
function hues(color: Color): { hex: string; rim: string } {
  return color === "red"
    ? { hex: PALETTE.red, rim: PALETTE.redRim }
    : { hex: PALETTE.cyan, rim: PALETTE.cyanRim };
}

/**
 * One crack, at column `col`. The row rather than a screen y, for
 * `drawFenceGate`'s reason: the wall is draped over the ship on its last beat
 * and a fault has to sit on the line where the line actually is.
 */
export function drawFenceCrack(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  col: number,
  row: number,
  color: Color,
  time: number,
  surfaceY?: SurfaceY,
): void {
  const { hex, rim } = hues(color);
  const mid = tileCX(l, col);
  const left = mid - l.tile / 2;
  const gauge = l.tile * GAUGE;
  const spread = l.tile * SPREAD;
  const beat = 0.72 + 0.28 * Math.sin(time * FLICKER_HZ);

  ctx.save();
  // The lens: the two wires bowing away from each other across this one
  // column, so the fault has a *width* and reads as material coming apart
  // rather than as a lamp put on the line.
  for (const wire of [-1, 1]) {
    const path = new Path2D();
    for (let i = 0; i <= 8; i++) {
      const t = i / 8;
      const x = left + l.tile * t;
      const bow = Math.sin(t * Math.PI) * spread * wire;
      const y = fenceLineY(l, row, x, surfaceY) + (wire * gauge) / 2 + bow;
      if (i === 0) path.moveTo(x, y);
      else path.lineTo(x, y);
    }
    strokeGlow(ctx, path, hex, Math.max(2, l.tile * 0.055), 1.4 + 0.6 * beat);
  }

  // The split across the band: a run of teeth from the top wire to the bottom
  // one, straying along the column so it reads as a tear and not as a bar.
  const strike = Math.floor(time * FLICKER_HZ);
  const top = fenceLineY(l, row, mid, surfaceY) - gauge / 2 - spread * 0.6;
  const bottom = fenceLineY(l, row, mid, surfaceY) + gauge / 2 + spread * 0.6;
  const tear = new Path2D();
  for (let i = 0; i <= TEETH; i++) {
    const t = i / TEETH;
    const x = mid + signedHash(col, i, strike) * l.tile * JAG;
    const y = top + (bottom - top) * t;
    if (i === 0) tear.moveTo(x, y);
    else tear.lineTo(x, y);
  }
  strokeGlow(ctx, tear, hex, Math.max(1.6, l.tile * 0.045), 1.2 + beat);
  ctx.strokeStyle = rim;
  ctx.lineWidth = Math.max(STROKE.inner, l.tile * 0.022);
  ctx.globalAlpha = beat;
  ctx.stroke(tear);
  ctx.globalAlpha = 1;

  // And the light it sheds, which is what makes it findable at a glance on a
  // wall eleven columns wide.
  halo(ctx, mid, fenceLineY(l, row, mid, surfaceY), l.tile * 0.55 * beat, hex, 0.4);
  ctx.restore();
}
