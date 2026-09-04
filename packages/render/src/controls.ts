import { blobPath, livingSilhouette } from "@neon-spore/content";
import { type Color, livingKindForColor } from "@neon-spore/sim";
import { bakedCache } from "./baked.js";
import { halo } from "./glow.js";
import { paintLobe } from "./lobe-shell.js";
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
 *
 * **None of them is a circle.** Every body of every button is `lobe-shell.ts`'s
 * one contour, which is the same kind of shape as everything else on screen —
 * a closed contour with lobes, not an arc. The reticle stays a circle on
 * purpose: it is an instrument laid over the button, and it is the one thing
 * on this panel that is meant to read as made rather than grown.
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
 * The silhouette inside a fire button, kept rather than rebuilt.
 *
 * Every argument is a constant of the colour — the shape comes from
 * `livingSilhouette(livingKindForColor(color))` and the path is drawn at the
 * origin, scaled by the transform — so the string and the `Path2D` were the
 * same two objects rebuilt twice a frame on player 2's seat, for as long as
 * the game has run. Keyed on the colour, of which there are two.
 */
const FIRE_BLOBS = bakedCache<Color, Path2D>();

function fireBlob(color: Color, shape: ReturnType<typeof livingSilhouette>): Path2D {
  const held = FIRE_BLOBS.get(color);
  if (held !== undefined) return held;
  const made = new Path2D(
    blobPath(0, 0, shape.rx, shape.ry, shape.lobes, shape.depth, shape.wobble, 0, shape.seed),
  );
  FIRE_BLOBS.set(color, made);
  return made;
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
  paintLobe(ctx, x, y, r, "fill");

  const s = (r * 0.62) / Math.max(shape.rx, shape.ry);
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  ctx.fillStyle = dark;
  ctx.fill(fireBlob(color, shape));
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
  // The glow goes down first, the way every other lit button in this file
  // lays one — under the body rather than over the outline.
  if (lit) halo(ctx, x, y, r * 1.8, hex, 0.5);
  ctx.fillStyle = lit ? hex : "#2A1F4E";
  ctx.strokeStyle = hex;
  ctx.lineWidth = 2;
  paintLobe(ctx, x, y, r, "both");
  if (label === null) return;
  ctx.fillStyle = lit ? litText : hex;
  ctx.fillText(label, x, y + 3);
}

/**
 * Player 2's four arrows, and the whole of what they say is *which way*.
 *
 * A triangle in a ring, turned. Deliberately the plainest button on any panel
 * in this game: it carries no colour of its own, no fill and no silhouette,
 * because the seat pressing it is not being told anything and a button that
 * looked like it knew something would be a lie. `dx`/`dy` is the direction it
 * points, one of them zero.
 */
export function drawAimButton(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  dx: number,
  dy: number,
): void {
  ctx.save();
  ctx.fillStyle = "#1A1338";
  ctx.strokeStyle = PALETTE.shield;
  ctx.lineWidth = STROKE.outline;
  paintLobe(ctx, x, y, r, "both");

  ctx.translate(x, y);
  ctx.rotate(Math.atan2(dy, dx));
  const tip = r * 0.52;
  const back = r * 0.26;
  ctx.beginPath();
  ctx.moveTo(tip, 0);
  ctx.lineTo(-back, -r * 0.4);
  ctx.lineTo(-back, r * 0.4);
  ctx.closePath();
  ctx.fillStyle = PALETTE.shieldRim;
  ctx.fill();
  ctx.restore();
}

/**
 * Player 1's one button on THE FLEET's panel: the salvo.
 *
 * It wears the same crosshair every fire button in this game wears, so the
 * pilot's thumb is on something they already recognise as "this is the one
 * that goes off" — and nothing inside it, because unlike a fire lobe it has
 * no colour to be loaded with. What it is aimed at is on the chart above,
 * where the sights are.
 *
 * `rest` is 0 while it is ready and rises to 1 straight after a salvo, so the
 * beat the round makes the pair wait is a thing they can see rather than a
 * press that quietly did nothing.
 */
export function drawSalvoButton(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  rest: number,
  label: string | null,
): void {
  const ready = rest <= 0;
  ctx.save();
  if (ready) halo(ctx, x, y, r * 1.7, PALETTE.pod, 0.5);
  ctx.fillStyle = ready ? PALETTE.pod : "#2A1F4E";
  ctx.strokeStyle = PALETTE.pod;
  ctx.lineWidth = STROKE.outline;
  paintLobe(ctx, x, y, r, "both");
  reticle(ctx, x, y, r, ready ? PALETTE.podDark : PALETTE.podRim);
  if (label !== null) {
    ctx.fillStyle = ready ? PALETTE.podDark : PALETTE.pod;
    ctx.fillText(label, x, y + r + 10);
  }
  ctx.restore();
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
