import type { Color } from "@neon-spore/sim";
import { strokeGlow } from "./glow.js";
import { grindstoneAxleR, grindstonePadAt, grindstonePadR } from "./grindstone-shape.js";
import { rgba } from "./hex.js";
import type { Layout } from "./layout.js";
import { PALETTE, STROKE } from "./palette.js";
import { seamColour } from "./seam-marks.js";

/**
 * **THE GRINDSTONE's marks**: the things that say what a step asks — a flat's
 * face glowing, which is *grind here*; the pads lit on a jaw, which are *hold
 * these*; and the lit axle, which is *shoot here, in this colour*. The glow
 * and the pads are the white of the hull's rim, the one light on a stone that
 * is otherwise dull (§33, *Colour*); the axle is the only part of the wheel in
 * a cannon's colour, THE SEAM's (`seamColour`), called rather than copied.
 */

/** A lit flat's face, glowing on its beat: *grind this one*. */
export function drawGrindstoneFaceGlow(
  ctx: CanvasRenderingContext2D,
  face: Path2D,
  beatPhase: number,
): void {
  const pulse = 0.7 + 0.3 * Math.cos(beatPhase * Math.PI * 2);
  strokeGlow(ctx, face, PALETTE.hullRim, STROKE.outline, pulse, 0.9);
}

/**
 * Jaw `side`'s pads, in the jaw's own frame: dark in the caliper while no
 * clamp asks, lit and breathing while one does, a pad held down drawn pressed
 * and solid.
 */
export function drawGrindstonePads(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  side: 0 | 1,
  pads: number,
  lit: boolean,
  down: number,
  shut: number,
  beatPhase: number,
): void {
  const r = grindstonePadR(l);
  const pulse = 0.75 + 0.25 * Math.cos(beatPhase * Math.PI * 2);
  for (let k = 0; k < pads; k++) {
    const at = grindstonePadAt(l, side, k, shut);
    const pressed = (down & (1 << k)) !== 0;
    const pad = new Path2D();
    pad.arc(at.x, at.y, pressed ? r * 0.78 : r, 0, Math.PI * 2);
    if (!lit) {
      ctx.fillStyle = rgba(PALETTE.rockDark, 0.95);
      ctx.fill(pad);
      ctx.lineWidth = STROKE.inner;
      ctx.strokeStyle = rgba(PALETTE.rock, 0.7);
      ctx.stroke(pad);
      continue;
    }
    ctx.fillStyle = rgba(PALETTE.hullRim, pressed ? 1 : 0.5 * pulse);
    ctx.fill(pad);
    strokeGlow(ctx, pad, PALETTE.hullRim, STROKE.inner, pressed ? 1 : pulse, 0.8);
  }
}

/**
 * The axle's face: dark while the caliper is slack, bare stone catching the
 * light once it has bitten, and lit in the step's colour while a shot is owed
 * — `size` of its fullest and `bright`, a core's hurt per hit, with a ring
 * round it closing as the step's beats run out.
 */
export function drawGrindstoneAxle(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  size: number,
  bright: number,
  locked: boolean,
  lit: { color: Color | "either"; left: number } | null,
  beatPhase: number,
): void {
  const r = grindstoneAxleR(l);
  const face = new Path2D();
  face.arc(0, 0, r * size, 0, Math.PI * 2);
  if (lit === null) {
    ctx.fillStyle = rgba(locked ? PALETTE.rock : PALETTE.grindstoneStoneDark, locked ? 0.6 : 0.95);
    ctx.fill(face);
    ctx.lineWidth = STROKE.inner;
    ctx.strokeStyle = rgba(locked ? PALETTE.hullRim : PALETTE.rock, locked ? 0.6 : 0.5);
    ctx.stroke(face);
    return;
  }
  const { body, rim } = seamColour(lit.color);
  ctx.fillStyle = rgba(body, bright * (0.75 + 0.25 * Math.cos(beatPhase * Math.PI * 2)));
  ctx.fill(face);
  strokeGlow(ctx, face, rim, STROKE.inner, 0.8 + bright);
  const ring = new Path2D();
  ring.arc(0, 0, r * 1.5, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * lit.left);
  strokeGlow(ctx, ring, body, STROKE.outline, 1);
}
