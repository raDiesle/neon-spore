import { mixHex, rgba } from "./hex.js";
import type { Skin } from "./solid-tube-draw.js";

/**
 * DEPTH ACROSS A RIG: what makes the far wing read as further than the near
 * one when both are the same size on the screen.
 *
 * Two cues, both cheap. **Haze**: a part further from the viewer is mixed
 * toward the field's deep colour, in six steps rather than continuously —
 * `depth.ts`'s quantisation, for the same reason, and because a skin that
 * changes every frame would be a new baked ball every frame
 * (`solid-ball.ts`). **Contact**: where one part bears on another — a head on
 * its neck, a wing at its root, a nest on a back — a soft cool dark on the
 * part underneath, clipped to it, so the one sits *on* the other rather than
 * pasted over it. Neither is a cast shadow; nothing casts one onto anything
 * else (`docs/spec/graphics.md`).
 */

const SHADOW = "#0B1024";
const HAZE_STEPS = 6;

/**
 * How far back a part is, 0 at the rig's nearest and 1 at its furthest, for
 * a part at depth `z` in a rig whose depths run `near` to `far`.
 */
export function backness(z: number, near: number, far: number): number {
  if (near - far < 1e-6) return 0;
  return Math.max(0, Math.min(1, (near - z) / (near - far)));
}

/** A skin hazed toward `deep` by `back` (0..1), at most `most` of the way, in six steps. */
export function hazeSkin(skin: Skin, back: number, deep: string, most = 0.55): Skin {
  const step = Math.round(back * HAZE_STEPS) / HAZE_STEPS;
  if (step <= 0) return skin;
  const k = step * most;
  return {
    base: mixHex(skin.base, deep, k),
    lift: mixHex(skin.lift, deep, k),
    sheen: mixHex(skin.sheen, deep, k * 0.6),
  };
}

/** A contact shadow of radius `r` at `(x, y)`, clipped to `under`. */
export function drawContact(
  ctx: CanvasRenderingContext2D,
  under: Path2D,
  x: number,
  y: number,
  r: number,
  alpha = 1,
): void {
  if (alpha <= 0 || r < 1) return;
  ctx.save();
  ctx.clip(under);
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, rgba(SHADOW, 0.6 * alpha));
  g.addColorStop(0.5, rgba(SHADOW, 0.25 * alpha));
  g.addColorStop(1, rgba(SHADOW, 0));
  ctx.fillStyle = g;
  ctx.fillRect(x - r, y - r, r * 2, r * 2);
  ctx.restore();
}
