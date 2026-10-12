import type { Point } from "@neon-spore/content";
import { bodyPath } from "../../../../packages/render/src/goo-body.js";
import type { GooStyle } from "../../../../packages/render/src/goo-style.js";

/**
 * **What calls the thumb to a hold no hand has yet**: a breathing halo and
 * ripples out of the drop, two at a time — the pull's call until the owner
 * took WHITE RINGS · FLASH for it on 12 October 2026 (`goo-call.ts`). That
 * one flashes on the beat of the path's dots, and a hold has no path, so the
 * hold keeps this.
 */
export function holdCall(
  ctx: CanvasRenderingContext2D,
  at: Point,
  r: number,
  style: GooStyle,
  time: number,
): void {
  const breathe = 0.5 + 0.5 * Math.sin(time * 4);
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  const halo = ctx.createRadialGradient(at.x, at.y, r * 0.7, at.x, at.y, r * 2.5);
  halo.addColorStop(0, style.neon);
  halo.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = halo;
  ctx.globalAlpha = 0.16 + 0.18 * breathe;
  ctx.beginPath();
  ctx.arc(at.x, at.y, r * 2.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  ctx.save();
  ctx.strokeStyle = style.neon;
  for (const lag of [0, 0.5]) {
    const u = (time * 0.85 + lag) % 1;
    ctx.globalAlpha = 0.7 * (1 - u);
    ctx.lineWidth = r * 0.08 * (1 - u) + 0.3;
    ctx.stroke(bodyPath({ at, r: r * (1.12 + 0.9 * u), seed: 29 }, style, time));
  }
  ctx.restore();
}
