import type { Color } from "@neon-spore/sim";
import { heartLight } from "./heartbeat.js";
import { rgba } from "./hex.js";
import { STROKE } from "./palette.js";
import { lightWithin } from "./part-light.js";
import { stepColour } from "./step-colour.js";

/**
 * **A part the cannon must hit, lit for its step**: every boss whose step
 * asks for a shot at one part draws it this way, over the part's own unlit
 * drawing — the hub, the kernel, the core, the stud, the hook, the cup.
 *
 * The light is the step's colour inside the part's contour, beating like a
 * heart (`heartLight`) and brighter the more hits the part has taken
 * (`bright`, `coreHurt`'s), never past its edge (`lightWithin`). The
 * countdown is a plain ring round it, `left` of the way round, in the same
 * colour. The part's border is the caller's, stroked in its unlit colour.
 *
 * One function since 2 October 2026, when the owner's rule — *only let the
 * part of body shape glow … no glowing outside. and the borders should not be
 * red* — reached the thirteenth boss that had carried its own copy of the
 * fill, the rim's glow and the ring.
 */
export function drawLitCore(
  ctx: CanvasRenderingContext2D,
  part: Path2D,
  lit: { color: Color | "either"; left: number },
  beatPhase: number,
  /** The part's middle and reach, where its light is brightest and fades. */
  at: { x: number; y: number; r: number },
  /** The countdown ring's radius, round `at`. */
  ringR: number,
  /** How bright the hurt has made it, 0..1; a part with no hurt passes 1. */
  bright = 1,
): void {
  const body = lightCore(ctx, part, lit.color, beatPhase, at, bright);
  if (lit.left <= 0) return;
  const ring = new Path2D();
  ring.arc(at.x, at.y, ringR, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * lit.left);
  ctx.lineWidth = STROKE.inner;
  ctx.strokeStyle = rgba(body, 0.75);
  ctx.stroke(ring);
}

/**
 * The light alone, for a part whose countdown is not a circle round it —
 * THE GOVERNOR's ring is squashed with its dial. Hands back the step's colour
 * the light was, for the ring the caller draws.
 */
export function lightCore(
  ctx: CanvasRenderingContext2D,
  part: Path2D,
  color: Color | "either",
  beatPhase: number,
  at: { x: number; y: number; r: number },
  bright = 1,
): string {
  const { body } = stepColour(color);
  lightWithin(ctx, part, body, heartLight(beatPhase) * (0.6 + 0.4 * bright), at);
  return body;
}
