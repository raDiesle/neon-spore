import type { ControlSet } from "@neon-spore/content";
import type { PulseLane } from "@neon-spore/sim";
import { halo, strokeGlow } from "./glow.js";
import type { Layout, ViewRole } from "./layout.js";
import { PALETTE } from "./palette.js";
import { pulseLaneColor } from "./pulse-arrow.js";
import { slabPanel } from "./slabs.js";

/**
 * THE PULSE's four buttons, drawn as sockets rather than as plates.
 *
 * **The rule this file exists to obey**: a button in this game is a grown
 * contour with a wet socket in it, a gloss on the swell and slime at the rim —
 * never a flat rectangle with a line round it. The owner has said so about
 * every control added since the band was drawn, and the round panels that
 * shipped before this one are the standing exception rather than the
 * precedent. So a lane's button here is the lane's own colour sunk into the
 * ground, lit from inside when it is pressed and lit from the *chart* when an
 * arrow is arriving in it.
 *
 * **It is lit by what is coming, and that is the design.** A rhythm game's
 * buttons are dead until a thumb lands; these swell as their arrow approaches,
 * so a player glancing down at their hands still knows what is about to
 * happen. It costs nothing — the number is already on the screen above — and
 * it is what makes the panel part of the picture instead of furniture under
 * it.
 */

export interface PulseSlabLook {
  /**
   * Which lane's button this is, or null for a slab that is not one of THE
   * PULSE's at all.
   *
   * Null happens whenever the panel handed in is a *different* control set —
   * the director editing a draft wave, a frame test — and it is drawn rather
   * than skipped, because the picture and the hit test read the same
   * `slabPanel` call and a button answered but not drawn is the same defect
   * as a button drawn but not answered (`slabs.ts`).
   */
  lane: PulseLane | null;
  /** 0 nothing coming, 1 an arrow is on the line. */
  near: number;
  /** 1 the instant this seat pressed it, fading over a beat. */
  press: number;
}

/**
 * Draw this seat's four, in the places `slabPanel` puts them.
 *
 * Everything is read off the same call the hit test makes, which is the rule
 * `slabs.ts` was written to hold: a button is never drawn where it is not
 * answered.
 */
export function drawPulsePanel(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  set: ControlSet,
  role: ViewRole,
  look: (id: string) => PulseSlabLook,
  time: number,
): void {
  for (const slab of slabPanel(l, set, role)) {
    const it = look(slab.control.id);
    drawSocket(ctx, slab.x, slab.y, slab.w, slab.h, it, time);
    ctx.fillStyle = PALETTE.text;
    ctx.globalAlpha = 0.7 + 0.3 * it.press;
    ctx.font = `600 ${Math.round(Math.min(slab.h * 0.5, slab.w * 0.42))}px "Courier New",monospace`;
    ctx.textAlign = "center";
    ctx.fillText(slab.control.label, slab.x + slab.w / 2, slab.y + slab.h / 2 + slab.h * 0.18);
    ctx.globalAlpha = 1;
  }
}

/**
 * One socket: a swell out of the ground with a wet hollow in it.
 *
 * Three passes and no rectangle anywhere. The contour is a rounded lozenge
 * whose corners breathe, the hollow is a gradient that darkens away from the
 * top left so the surface reads as curved, and the gloss is a single arc high
 * on the swell — the same three the band's lobes are made of.
 */
function drawSocket(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  it: PulseSlabLook,
  time: number,
): void {
  const color = it.lane === null ? PALETTE.hull : pulseLaneColor(it.lane);
  const breath = 0.5 + 0.5 * Math.sin(time * 1.4 + x * 0.02);
  const swell = Math.max(it.near, it.press);
  const r = Math.min(w, h) * (0.34 + 0.03 * breath);
  const cx = x + w / 2;
  const cy = y + h / 2;

  const shell = new Path2D();
  shell.roundRect(x, y, w, h, r);

  // The ground the socket is sunk into: darker than the page, so the button is
  // a hole in a surface rather than a tile on top of one.
  const bed = ctx.createLinearGradient(x, y, x, y + h);
  bed.addColorStop(0, PALETTE.grid);
  bed.addColorStop(1, PALETTE.background);
  ctx.fillStyle = bed;
  ctx.fill(shell);

  // The wet hollow, lit from inside by whatever is coming.
  const wet = ctx.createRadialGradient(
    cx - w * 0.16,
    cy - h * 0.3,
    r * 0.2,
    cx,
    cy,
    Math.max(w, h) * 0.7,
  );
  wet.addColorStop(0, `${color}${alphaHex(0.34 + 0.5 * swell)}`);
  wet.addColorStop(0.6, `${color}${alphaHex(0.12 + 0.28 * swell)}`);
  wet.addColorStop(1, `${color}00`);
  ctx.fillStyle = wet;
  ctx.fill(shell);

  strokeGlow(ctx, shell, color, 1.4, 0.4 + 0.9 * swell);

  // The gloss: one arc high on the swell, off centre, never a full outline.
  ctx.save();
  ctx.clip(shell);
  ctx.globalAlpha = 0.16 + 0.2 * swell;
  ctx.strokeStyle = PALETTE.text;
  ctx.lineWidth = Math.max(1.5, h * 0.06);
  ctx.beginPath();
  ctx.ellipse(cx, y + h * 0.34, w * 0.34, h * 0.24, 0, Math.PI * 1.08, Math.PI * 1.86);
  ctx.stroke();
  ctx.globalAlpha = 1;
  ctx.restore();

  if (swell > 0.02) halo(ctx, cx, cy, Math.max(w, h) * 0.62, color, 0.22 * swell);
}

/** A 0..1 alpha as the two hex digits a `#rrggbb` takes on the end. */
function alphaHex(a: number): string {
  const v = Math.max(0, Math.min(255, Math.round(a * 255)));
  return v.toString(16).padStart(2, "0");
}
