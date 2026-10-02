import { circleSubpath } from "@neon-spore/content";
import {
  type SimConfig,
  type ThroatMode,
  type ThroatState,
  throatRadiusMilli,
} from "@neon-spore/sim";
import { emblem } from "./action-face.js";
import { strokeGlow } from "./glow.js";
import type { Layout } from "./layout.js";
import { PALETTE, STROKE } from "./palette.js";
import { mouthX, mouthY } from "./throat-shape.js";

/**
 * **Which colour the mouth is set to**, worn by the mouth itself: the lip,
 * its halo, its flare and the circle it pulls inside are all in it.
 *
 * The four are the panel's own four — the two shots, the shield, the maw's
 * amber — so a body's colour and the mouth's are compared without anything
 * being learned (`sim/throat-suck.ts`). **The shield and the cyan shot are one
 * hue in this game**, so a colour alone could not say which of the two is set;
 * the mouth carries the panel's button face for the shield and for the maw
 * inside its hole, the same emblem the band shows under the thumb
 * (`band-control.ts`, `action-face.ts`), and a shot's mouth carries none.
 */

export interface ThroatHue {
  readonly hex: string;
  readonly rim: string;
}

const HUES: Record<ThroatMode, ThroatHue> = {
  red: { hex: PALETTE.red, rim: PALETTE.redRim },
  cyan: { hex: PALETTE.cyan, rim: PALETTE.cyanRim },
  shield: { hex: PALETTE.shield, rim: PALETTE.shieldRim },
  suck: { hex: PALETTE.pod, rim: PALETTE.podRim },
};

export function throatHue(mode: ThroatMode): ThroatHue {
  return HUES[mode];
}

/** The panel's face inside the hole, for the two modes a colour cannot name. */
export function drawModeFace(
  ctx: CanvasRenderingContext2D,
  mode: ThroatMode,
  x: number,
  y: number,
  r: number,
): void {
  if (mode !== "shield" && mode !== "suck") return;
  ctx.save();
  ctx.lineWidth = STROKE.outline;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  emblem(ctx, x, y, r * FACE, HUES[mode].rim, mode === "shield" ? "guard" : "intake");
  ctx.restore();
}

/** How big the face is inside the lip, in lip radii. */
const FACE = 0.5;

/**
 * **How far round the mouth it pulls** — `throatRadiusMilli`, the pilot's
 * strokes made a circle on both screens, so the navigator can see whether a
 * body is inside before carrying the mouth any closer. Faint, and gone while
 * the pump is still: a still pump pulls nothing.
 */
export function drawPullCircle(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  cfg: SimConfig,
  b: ThroatState,
  time: number,
): void {
  const reach = throatRadiusMilli(cfg, b);
  if (reach <= 0) return;
  const x = mouthX(l, b);
  const y = mouthY(l, b);
  const r = (reach / 1000) * l.tile;
  const hue = HUES[b.mode];
  // Breathing inward, a hair: air drawn in, not a ring sent out.
  const drawIn = 1 - 0.03 * ((time * 1.6) % 1);
  const ring = new Path2D(circleSubpath(x, y, r * drawIn));
  strokeGlow(
    ctx,
    ring,
    hue.hex,
    STROKE.inner,
    0.7,
    0.35 + 0.25 * (reach / cfg.throatMaxRadiusMilli),
  );
}
