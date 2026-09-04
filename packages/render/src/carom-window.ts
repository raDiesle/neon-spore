import { STROKE } from "./palette.js";

/**
 * THE CAROM's window: a hole punched clean through the rock, a bezel round it,
 * the glass across it and the hatch over the top of that.
 *
 * Split out of `carom.ts` when the two halves together went past the 250-line
 * limit, and along a seam that is a real one rather than a convenient cut.
 * Next door is a **rock** — a faceted crystal that tumbles, drawn with the
 * same path, the same fill and the same key light `meteor.ts` uses, so that
 * the meteor a cracked carom becomes is the identical drawing with this file's
 * work left out. This is the part that is *made*: a circle, a rim, a pane and
 * a door, none of which tumble and none of which a rock has. The two are drawn
 * in two frames for exactly that reason — the stone rolls and the window does
 * not, because a porthole that rolled would be one nobody could look through.
 *
 * It takes a radius and three colours rather than a `Creature`, so nothing
 * here can reach for the body's state: everything it draws is a fact about a
 * hole of a given size, and where that hole is and how big is next door's
 * question.
 */
/**
 * The porthole: a hole punched clean through the rock, a bezel round it, the
 * glass across it and the hatch over the top of that.
 *
 * Drawn in the *unturned* frame, so the highlight and the hatch stay where the
 * eye left them while the stone rolls underneath.
 */
export function drawWindow(
  ctx: CanvasRenderingContext2D,
  glass: number,
  metal: string,
  rim: string,
  glow: string,
): void {
  // Nothing is punched here. The hole is part of the rock's own path next door
  // and is filled `evenodd`, so it was never painted and the body under it is
  // already showing — this file only ever puts *glass* over that. It used to
  // cut the hole with `destination-out`, which takes away whatever is beneath
  // it and therefore took the body as well: a rock with a grey disc in it and
  // no colour for the pair to call.
  //
  // The tint. Thin enough that the colour behind it is still the colour the
  // pair says out loud, and cool enough that it reads as a pane rather than as
  // the body being dimmer than it is.
  ctx.save();
  ctx.beginPath();
  ctx.arc(0, 0, glass, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(120,190,215,0.16)";
  ctx.fill();
  ctx.restore();

  // The specular crescent, up the top-left shoulder, where every other lit
  // body in this game takes its highlight from. Two arcs sharing their ends:
  // the outer one runs along the glass and the inner one cuts back across it,
  // which is the shape a curved pane makes and a straight streak does not.
  ctx.save();
  ctx.beginPath();
  ctx.arc(0, 0, glass * 0.86, Math.PI * 1.05, Math.PI * 1.62);
  ctx.arc(glass * 0.22, glass * 0.2, glass * 0.86, Math.PI * 1.62, Math.PI * 1.05, true);
  ctx.closePath();
  ctx.fillStyle = "rgba(255,255,255,0.3)";
  ctx.fill();
  ctx.restore();

  // The bezel: a bright ring set into the rock, with a thinner inner line just
  // off it. Two lines rather than one thick one, because a single stroke reads
  // as an outline drawn round a hole and a pair reads as a rim with a lip.
  ctx.beginPath();
  ctx.arc(0, 0, glass, 0, Math.PI * 2);
  ctx.strokeStyle = metal;
  ctx.lineWidth = STROKE.outline * 1.4;
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(0, 0, glass * 0.88, 0, Math.PI * 2);
  ctx.strokeStyle = rim;
  ctx.globalAlpha = 0.45;
  ctx.lineWidth = STROKE.inner;
  ctx.stroke();
  ctx.globalAlpha = 1;

  drawHatch(ctx, glass, metal, glow);
}

/**
 * The hatch across the top of the window: a seam and two rivets, shut.
 *
 * It is the one part of this drawing that is about what has not happened yet.
 * A carom is a sealed thing and the pair's shot is what opens it, so the seal
 * has to be visible before the shot — otherwise the body flying out of the top
 * (`chute.ts`) comes from nowhere, and the second half of the creature reads
 * as a surprise rather than as the thing they just did.
 */
function drawHatch(
  ctx: CanvasRenderingContext2D,
  glass: number,
  metal: string,
  glow: string,
): void {
  const y = -glass * 0.62;
  const half = glass * 0.62;
  ctx.beginPath();
  ctx.moveTo(-half, y);
  ctx.lineTo(half, y);
  ctx.strokeStyle = metal;
  ctx.lineWidth = STROKE.inner;
  ctx.globalAlpha = 0.8;
  ctx.stroke();
  ctx.globalAlpha = 1;
  for (const side of [-1, 1]) {
    ctx.beginPath();
    ctx.arc(side * half, y, Math.max(1, glass * 0.09), 0, Math.PI * 2);
    ctx.fillStyle = metal;
    ctx.fill();
  }
  // A thread of the body's own light along the underside of the seam: it is
  // what is *behind* the hatch, pressing at it.
  ctx.beginPath();
  ctx.moveTo(-half * 0.8, y + STROKE.inner * 1.6);
  ctx.lineTo(half * 0.8, y + STROKE.inner * 1.6);
  ctx.strokeStyle = glow;
  ctx.globalAlpha = 0.5;
  ctx.lineWidth = STROKE.inner;
  ctx.stroke();
  ctx.globalAlpha = 1;
}
