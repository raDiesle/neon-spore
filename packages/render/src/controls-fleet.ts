import { halo } from "./glow.js";
import { paintLobe } from "./lobe-shell.js";
import { PALETTE, STROKE } from "./palette.js";
import { P1_SKIN } from "./seat-skin.js";

/**
 * THE FLEET's own two controls, and the crosshair only they still wear.
 *
 * Split out of `controls.ts` when the fire buttons were rebuilt around the
 * creature inside them and took that file past its 250-line limit. The seam is
 * the one already in it: next door are the controls every panel in the game is
 * built from — the two fire lobes, the two actions, the mark on a strip — and
 * this is the pair a single boss invented, plus the instrument that survives on
 * exactly one of them. Nothing outside THE FLEET's panel draws either.
 */

/**
 * Scope-style crosshair. THE FLEET's salvo alone wears one now.
 *
 * The two fire buttons wore it too, and it came off them at the owner's word —
 * *remove crosshairs*. It stays here because the salvo is the one shooting
 * control with nothing inside it: it carries no colour to be loaded with, so
 * the crosshair is not lying over anything, and it is what says *this is the
 * one that goes off* on a panel of four arrows that do not.
 */
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
  dead: string = P1_SKIN.dead[1],
): void {
  ctx.save();
  ctx.fillStyle = dead;
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
 * It is the one control left wearing a crosshair, and it is the one that can:
 * unlike a fire lobe it carries no colour and no creature, so there is nothing
 * under the instrument for it to cage. That is what says "this is the one that
 * goes off" on a panel whose other four buttons are arrows. What it is aimed
 * at is on the chart above, where the sights are.
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
  dead: string = P1_SKIN.dead[0],
): void {
  const ready = rest <= 0;
  ctx.save();
  if (ready) halo(ctx, x, y, r * 1.7, PALETTE.pod, 0.5);
  ctx.fillStyle = ready ? PALETTE.pod : dead;
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
