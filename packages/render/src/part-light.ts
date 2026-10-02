import { rgba } from "./hex.js";

/**
 * **A part of a body lit from inside**: the one way a boss says *this part
 * is the one to act on*, whether the action is a thumb on it or a shot.
 *
 * The owner, 2 October 2026, on the red light round every asked mark: *only
 * let the part of body shape glow red, but not so heavy and no glowing
 * outside. and the borders should not be red … only when player needs to
 * shoot a specific part of body it can glow and pulse some more. the
 * graphics around red light or below should still be good visible.* So:
 *
 * - **Inside the part's own contour and nowhere else.** The light is a fill
 *   of `path` — brightest at its middle and faint at its reach where the
 *   caller knows them, even where it does not — so nothing reaches past the
 *   shape. No glow passes, no halo.
 * - **Blended, not laid over.** It is `hard-light` and a little `lighter`,
 *   so the part's own drawing under it — its plating, its crack, its iris —
 *   is still there to read, only redder: a yellow eye turns orange where
 *   light added to it would only have gone white. A fill that covers is how
 *   the old halo hid what it named.
 * - **The border is not drawn here.** A caller strokes its part's edge in
 *   the edge colour it has unlit; the light never outlines anything.
 *
 * How strong is the caller's: `MARK_LIGHT` for any asked mark
 * (`mark-feedback.ts`), `heartLight` for a part the cannon must hit
 * (`heartbeat.ts`), which is brighter and beats.
 */
export function lightWithin(
  ctx: CanvasRenderingContext2D,
  path: Path2D,
  colour: string,
  alpha: number,
  /** The part's middle and reach, for a light brightest there; left off, the
   * part is lit evenly — an outline with no one middle, THE INSTAR's eggs. */
  at?: { x: number; y: number; r: number },
): void {
  if (alpha <= 0) return;
  let fill: string | CanvasGradient = rgba(colour, alpha * 0.7);
  if (at !== undefined) {
    const light = ctx.createRadialGradient(at.x, at.y, 0, at.x, at.y, Math.max(1, at.r));
    light.addColorStop(0, rgba(colour, alpha));
    light.addColorStop(0.6, rgba(colour, alpha * 0.7));
    light.addColorStop(1, rgba(colour, alpha * 0.15));
    fill = light;
  }
  ctx.save();
  ctx.fillStyle = fill;
  // The colour: dark under it lifts, bright under it turns, its marks kept.
  ctx.globalCompositeOperation = "hard-light";
  ctx.fill(path);
  // The glow, a little of the same light added, so a dark part shines.
  ctx.globalCompositeOperation = "lighter";
  ctx.globalAlpha *= GLOW;
  ctx.fill(path);
  ctx.restore();
}

/** How much of the light is added again as glow, over the colour. */
const GLOW = 0.4;
