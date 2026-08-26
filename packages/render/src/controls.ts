import { blobPath, livingSilhouette } from "@neon-spore/content";
import { type Color, livingKindForColor } from "@neon-spore/sim";
import { halo } from "./glow.js";
import { PALETTE, STROKE } from "./palette.js";

/**
 * The band's controls, drawn at whatever size is asked for.
 *
 * Their own file because they are drawn in two places now: on the band itself,
 * where a thumb presses them, and in THE MIRROR's sequence, where the pair has
 * to recognise one at a glance. Those two pictures have to be the *same*
 * picture — a sequence that invents its own vocabulary for a control makes the
 * player translate before they can act, which is the one thing a boss about
 * memory under a clock cannot afford.
 */

/** Scope-style crosshair on a fire button, so it reads as a target. */
export function reticle(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  hex: string,
): void {
  const inner = r * 0.55;
  const outer = r * 0.78;
  ctx.save();
  ctx.globalAlpha = 0.85;
  ctx.strokeStyle = hex;
  ctx.lineWidth = STROKE.outline;
  ctx.beginPath();
  ctx.arc(x, y, outer, 0, Math.PI * 2);
  ctx.stroke();
  // Four ticks, leaving the centre clear for the silhouette.
  ctx.beginPath();
  ctx.moveTo(x, y - outer);
  ctx.lineTo(x, y - inner);
  ctx.moveTo(x, y + inner);
  ctx.lineTo(x, y + outer);
  ctx.moveTo(x - outer, y);
  ctx.lineTo(x - inner, y);
  ctx.moveTo(x + inner, y);
  ctx.lineTo(x + outer, y);
  ctx.stroke();
  ctx.restore();
}

/**
 * One of player 2's fire buttons: the colour, filled, with the silhouette that
 * colour resonates sitting dark inside it, and the reticle round the outside.
 * The silhouette is the point — the button shows what the colour is *for*.
 */
export function drawFireButton(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  color: Color,
): void {
  const hex = color === "red" ? PALETTE.red : PALETTE.cyan;
  const dark = color === "red" ? PALETTE.redDark : PALETTE.cyanDark;
  // The button wears the creature its ammunition answers — through the
  // one mapping that owns it, never a second copy of the pairing.
  const shape = livingSilhouette(livingKindForColor(color));

  halo(ctx, x, y, r * 1.6, hex, 0.45);
  ctx.fillStyle = hex;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();

  const s = (r * 0.62) / Math.max(shape.rx, shape.ry);
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  ctx.fillStyle = dark;
  ctx.fill(
    new Path2D(
      blobPath(0, 0, shape.rx, shape.ry, shape.lobes, shape.depth, shape.wobble, 0, shape.seed),
    ),
  );
  ctx.restore();
  reticle(ctx, x, y, r, color === "red" ? PALETTE.redRim : PALETTE.cyanRim);
}

/**
 * One of player 1's two actions — the trigger or the maw. The same button,
 * different colour and word; `label` is dropped when the button is too small
 * to carry text, which is what happens in a sequence glyph.
 */
export function drawActionButton(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  lit: boolean,
  hex: string,
  litText: string,
  label: string | null,
): void {
  ctx.fillStyle = lit ? hex : "#2A1F4E";
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
  if (lit) halo(ctx, x, y, r * 1.8, hex, 0.5);
  ctx.strokeStyle = hex;
  ctx.lineWidth = 2;
  ctx.stroke();
  if (label === null) return;
  ctx.fillStyle = lit ? litText : hex;
  ctx.fillText(label, x, y + 3);
}

/**
 * The block that marks a lobe's column on its strip. Drawn as a short length
 * of strip with the block on it, so a cannon step reads as the cannon control
 * rather than as a bare arrow: `w` is how much strip to show either side.
 */
export function drawStripMark(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  hex: string,
): void {
  ctx.fillStyle = "rgba(36,27,79,.55)";
  ctx.fillRect(x - w, y - h / 2, w * 2, h);
  halo(ctx, x, y, h * 1.1, hex, 0.5);
  ctx.fillStyle = hex;
  ctx.fillRect(x - w * 0.28, y - h / 2 + 2, w * 0.56, h - 4);
}
