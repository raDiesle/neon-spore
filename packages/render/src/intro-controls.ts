import { blobPoints } from "@neon-spore/content";
import { halo, strokeGlow } from "./glow.js";
import { mixHex } from "./hex.js";
import type { FigureBox } from "./intro-parts.js";
import { PALETTE } from "./palette.js";
import { P2_SKIN } from "./seat-skin.js";
import { splinePath } from "./spline.js";

/**
 * THE TWO CONTROLS A SHOUT ASKS FOR, and the thumb landing on them.
 *
 * They are the only lit things on the listening seat's panel, and they are the
 * half of the intro's argument that is *answered* — the other phone can see
 * what is coming and cannot touch it, and these are what it cannot touch.
 *
 * Nothing here knows when. `shot` and `shielded` come in as 0 before the word
 * has landed and 1 once the control has been moved (`intro-shout.ts`), so what
 * a frame shows and what the pair were told cannot come apart.
 *
 * Their own file beside the two screens, which would be over the 250-line
 * limit with them in it. The seam is where the panel is: next door draws what
 * a phone in this game looks like, and this draws the two parts of it a player
 * puts a thumb on.
 */

/** The button that ends a body, with the press landing on it. */
export function fireButton(
  ctx: CanvasRenderingContext2D,
  inner: FigureBox,
  age: number,
  shot: number,
): void {
  const cx = inner.x + inner.w * 0.26;
  const cy = inner.y + inner.h * 0.89;
  const r = inner.w * 0.17;
  const press = Math.sin(Math.min(1, shot * 1.6) * Math.PI);
  halo(ctx, cx, cy, r * 2.4, PALETTE.red, 0.35 + 0.5 * press);
  const face = splinePath(
    blobPoints(
      cx,
      cy,
      r * (1 - 0.1 * press),
      r * 0.94 * (1 - 0.1 * press),
      3,
      0.06,
      0.04,
      age,
      1109,
      26,
    ),
    true,
  );
  ctx.fillStyle = mixHex(PALETTE.red, "#0B0718", 0.68 - 0.4 * press);
  ctx.fill(face);
  strokeGlow(ctx, face, PALETTE.red, Math.max(1.2, r * 0.2), 1);
  // The ring a press throws off, which is how a phone says a finger landed.
  if (press > 0.02) {
    ctx.beginPath();
    ctx.ellipse(cx, cy, r * (1 + 1.5 * press), r * (1 + 1.5 * press), 0, 0, Math.PI * 2);
    ctx.strokeStyle = PALETTE.redRim;
    ctx.globalAlpha = 0.7 * (1 - press);
    ctx.lineWidth = Math.max(1, r * 0.1);
    ctx.stroke();
    ctx.globalAlpha = 1;
  }
}

/** The strip the shield rides, and the shield riding it. */
export function shieldSlider(
  ctx: CanvasRenderingContext2D,
  inner: FigureBox,
  age: number,
  shielded: number,
): void {
  const y = inner.y + inner.h * 0.89;
  const from = inner.x + inner.w * 0.6;
  const to = inner.x + inner.w * 0.94;
  const h = inner.w * 0.17;
  ctx.beginPath();
  ctx.ellipse((from + to) / 2, y, (to - from) / 2 + h * 0.3, h * 0.5, 0, 0, Math.PI * 2);
  ctx.fillStyle = P2_SKIN.dead[1];
  ctx.fill();
  ctx.strokeStyle = P2_SKIN.lip[0];
  ctx.lineWidth = 1;
  ctx.stroke();

  const x = from + (to - from) * shielded;
  const r = h * 0.72;
  halo(ctx, x, y, r * 2.4, PALETTE.shield, 0.4 + 0.3 * Math.sin(age * 2));
  const knob = splinePath(blobPoints(x, y, r, r * 0.9, 3, 0.06, 0.03, age, 1301, 24), true);
  ctx.fillStyle = mixHex(PALETTE.shield, "#0B0718", 0.6);
  ctx.fill(knob);
  strokeGlow(ctx, knob, PALETTE.shield, Math.max(1.2, r * 0.22), 1);
  // A smear behind it while it is moving: the control slid, it did not jump.
  if (shielded > 0.02 && shielded < 1) {
    ctx.beginPath();
    ctx.ellipse((from + x) / 2, y, (x - from) / 2, r * 0.3, 0, 0, Math.PI * 2);
    ctx.fillStyle = PALETTE.shield;
    ctx.globalAlpha = 0.25;
    ctx.fill();
    ctx.globalAlpha = 1;
  }
}
