import type { Color } from "@neon-spore/sim";
import { strokeGlow } from "./glow.js";
import { halterCoreR, halterGripAt, halterGripR } from "./halter-shape.js";
import { rgba } from "./hex.js";
import type { Layout } from "./layout.js";
import { drawLitCore } from "./lit-core.js";
import { PALETTE, STROKE } from "./palette.js";

/**
 * **THE HALTER's marks**: what says what a step asks — a segment's stretch of
 * the seam glowing, which is *this one*; its two grips lit, which are *hold
 * both*; and the bared core lit, which is *shoot here, in this colour*. The
 * glow and the grips are the white of the hull's rim, the one light on a
 * plating that is otherwise dull; the core is the only part in a cannon's
 * colour, `stepColour`'s, called rather than copied.
 *
 * Nothing marks the seat that rests. What says it is resting is the plating
 * going still (`halterShake`), and a mark for it would be a thing to look at
 * where the whole point is to touch nothing.
 */

/** A lit segment's seam, glowing on its beat: *this one*. */
export function drawHalterSeamGlow(
  ctx: CanvasRenderingContext2D,
  seam: Path2D,
  beatPhase: number,
): void {
  const pulse = 0.7 + 0.3 * Math.cos(beatPhase * Math.PI * 2);
  strokeGlow(ctx, seam, PALETTE.hullRim, STROKE.outline, pulse, 0.9);
}

/**
 * Segment `k`'s two grips, on the seam by its ends: lit and breathing, and a
 * grip held down drawn pressed and solid. `down` is the grips' mask, one bit
 * the left and two the right.
 */
export function drawHalterGrips(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  k: 0 | 1 | 2,
  down: number,
  beatPhase: number,
): void {
  const r = halterGripR(l);
  const pulse = 0.75 + 0.25 * Math.cos(beatPhase * Math.PI * 2);
  for (const side of [0, 1] as const) {
    const at = halterGripAt(l, k, side);
    const pressed = (down & (1 << side)) !== 0;
    const grip = new Path2D();
    grip.arc(at.x, at.y, pressed ? r * 0.78 : r, 0, Math.PI * 2);
    ctx.fillStyle = rgba(PALETTE.hullRim, pressed ? 1 : 0.5 * pulse);
    ctx.fill(grip);
    strokeGlow(ctx, grip, PALETTE.hullRim, STROKE.inner, pressed ? 1 : pulse, 0.8);
  }
}

/**
 * The bared core: the soft body's knot, dull while no shot is owed and lit
 * in the step's colour while one is — `size` of its fullest and `bright`, a
 * core's hurt per hit, with a ring round it closing as the step's beats run
 * out.
 */
export function drawHalterCore(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  size: number,
  bright: number,
  lit: { color: Color | "either"; left: number } | null,
  beatPhase: number,
): void {
  const r = halterCoreR(l);
  const face = new Path2D();
  face.arc(0, 0, r * size, 0, Math.PI * 2);
  ctx.fillStyle = rgba(PALETTE.halterFleshDark, 0.9);
  ctx.fill(face);
  if (lit !== null) {
    // Lit for its step, from inside, and nothing past its edge (`lit-core.ts`).
    drawLitCore(ctx, face, lit, beatPhase, { x: 0, y: 0, r: r * size }, r * 1.6, bright);
  }
  ctx.lineWidth = STROKE.inner;
  ctx.strokeStyle = rgba(PALETTE.halterFlesh, 0.6);
  ctx.stroke(face);
}
