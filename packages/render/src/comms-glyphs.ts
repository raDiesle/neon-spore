import { PALETTE } from "./palette.js";

/**
 * The marks the whole game says "one of you can see this" with: an eye on
 * the strip, and an ear over the seat that has to listen. The talker's mark
 * was a speech bubble here until 19 October 2026, when the owner took VERSUS
 * MOUTH (`siren-voice-mouth.ts`), which draws the ear from this file.
 *
 * **All of them are drawn, none of them is typed.** `lure-alarm.ts` made this
 * argument first and it holds harder here: these sit at nine to fourteen
 * pixels on a phone, and a glyph in a font at that size is a smear. Drawn
 * paths keep their weight when the tile shrinks, and they carry no font
 * dependency — the game is played on two devices nobody chose.
 *
 * **A mouth and an ear were once the wrong pair**, because still and in one
 * ink both are a rounded outline with something inside it, and at this size
 * they collapse into the same fourteen grey pixels. What made MOUTH work is
 * what the still pair lacked: the mouth is a solid shape that moves, knocked
 * out of the lit block, and the ear is a stroke on the dark pill.
 */

/**
 * An open eye: a filled lens with a hole punched through it. The strip's half
 * of the siren — *this blip is the one you have to talk about.*
 *
 * **Filled, not outlined.** The first version drew the lid as two thin arcs
 * with a dot between them, and at ten pixels across that is four grey strokes
 * which read as a leaf. What makes an eye an eye at this size is the *pupil* —
 * a dark hole with light all round it — so the lens is solid and the pupil is
 * the field's own black cut out of it, with a smaller disc of the lens colour
 * back inside so the hole still has something in it at four pixels.
 */
export function drawEyeGlyph(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  hex: string,
  alpha = 1,
): void {
  const h = w * 0.66;
  ctx.save();
  ctx.globalAlpha = alpha;

  const lens = new Path2D();
  lens.moveTo(x - w, y);
  lens.quadraticCurveTo(x, y - h * 1.8, x + w, y);
  lens.quadraticCurveTo(x, y + h * 1.8, x - w, y);
  ctx.fillStyle = hex;
  ctx.fill(lens);

  ctx.fillStyle = PALETTE.background;
  ctx.beginPath();
  ctx.arc(x, y, h * 0.6, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = hex;
  ctx.beginPath();
  ctx.arc(x, y, h * 0.25, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

/** An ear: an open C round the outside with a hook curled inside it. *You are
 * the one who has to be quiet and take it.* */
export function drawEarGlyph(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  s: number,
  hex: string,
  alpha = 1,
): void {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = hex;
  ctx.lineWidth = Math.max(1.2, s * 0.26);
  ctx.lineCap = "round";

  // The helix, as one unbroken stroke: up the left, over the top, down the
  // right and round to the lobe, leaving the opening at the bottom left where
  // an ear meets a head. It has to be **one** path — the first version drew
  // the lobe as a separate stroke hanging off the bottom, and a ring with a
  // detached point under it is a map pin, which is what it read as.
  const cy = y - s * 0.08;
  ctx.beginPath();
  ctx.arc(x, cy, s * 0.88, Math.PI * 0.86, Math.PI * 2.42);
  ctx.lineTo(x - s * 0.34, cy + s * 1.05);
  ctx.stroke();

  // The inner hook — the one stroke that stops this being a letter C.
  ctx.lineWidth = Math.max(1, s * 0.2);
  ctx.beginPath();
  ctx.arc(x + s * 0.1, cy - s * 0.05, s * 0.34, Math.PI * 1.1, Math.PI * 0.45);
  ctx.stroke();
  ctx.restore();
}
