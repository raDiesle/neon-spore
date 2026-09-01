/**
 * The three marks the whole game says "one of you can see this" with: an eye
 * on the strip, a speech bubble over the seat that has to talk, an ear over
 * the seat that has to listen.
 *
 * **All three are drawn, none of them is typed.** `lure-alarm.ts` made this
 * argument first and it holds harder here: these sit at nine to fourteen
 * pixels on a phone, and a glyph in a font at that size is a smear. Drawn
 * paths keep their weight when the tile shrinks, and they carry no font
 * dependency — the game is played on two devices nobody chose.
 *
 * **Why a bubble and an ear rather than a mouth and an ear.** A mouth and an
 * ear are the obvious pair and they are the wrong one: both are a rounded
 * outline with something inside it, and at this size they collapse into the
 * same fourteen grey pixels. A rectangle with a tail and a hooked C share no
 * silhouette at all, which is the only property that matters when the answer
 * has to be read in the half second before the beat turns.
 */

/** An open eye: two arcs meeting at the corners, with a pupil. The strip's
 * half of the siren — *this blip is the one you have to talk about.* */
export function drawEyeGlyph(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  hex: string,
  alpha = 1,
): void {
  const h = w * 0.62;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = hex;
  ctx.fillStyle = hex;
  ctx.lineWidth = Math.max(1, w * 0.16);
  ctx.lineJoin = "round";

  ctx.beginPath();
  ctx.moveTo(x - w, y);
  ctx.quadraticCurveTo(x, y - h * 1.7, x + w, y);
  ctx.quadraticCurveTo(x, y + h * 1.7, x - w, y);
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(x, y, h * 0.52, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

/** A speech bubble with a tail out of its bottom left: *you are the one who
 * has to say it.* */
export function drawSpeechGlyph(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  s: number,
  hex: string,
  alpha = 1,
): void {
  const w = s;
  const h = s * 0.72;
  const r = s * 0.28;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = hex;
  ctx.beginPath();
  ctx.moveTo(x - w + r, y - h);
  ctx.arcTo(x + w, y - h, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x - w, y + h, r);
  ctx.arcTo(x - w, y + h, x - w, y - h, r);
  ctx.arcTo(x - w, y - h, x + w, y - h, r);
  ctx.closePath();
  ctx.fill();

  // The tail, as its own triangle out of the bottom left corner. Drawn
  // separately rather than folded into the rounded outline: an `arcTo` chain
  // with a spike in it is a shape nobody can adjust afterwards.
  ctx.beginPath();
  ctx.moveTo(x - w * 0.55, y + h * 0.6);
  ctx.lineTo(x - w * 0.75, y + h * 1.85);
  ctx.lineTo(x - w * 0.05, y + h * 0.8);
  ctx.closePath();
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
