import { speck } from "./solid-tube-screen.js";

/**
 * The light a bright body throws round itself, **following its own contour**:
 * every lobe of a bulb, every club of a throb, the pod's bean, each with a
 * soft rim of its own colour standing off the line rather than one round halo
 * that knows nothing of the shape. The owner asked for it by name on 16
 * October 2026 — "whenever enemies or objects use bright colours … some subtle
 * cool glowing, and it should follow the shape".
 *
 * It is the body's own path stroked wide, a few times, widest and faintest
 * first, additively — `strokeGlow`'s recipe, with two differences that are the
 * whole point:
 *
 *  - **It is drawn before the body is filled.** The fill covers the inner half
 *    of every pass, so the light is outside the contour only and the flesh, the
 *    key light and the interior marks are not washed in their own colour. A
 *    glow over the top of the body reaching this far would have been half a
 *    body of tint (`docs/alive.md` on why the interior is guarded).
 *  - **Its reach is a share of the body's radius on screen**, not
 *    `STROKE.glowSpread` in the body's own units: that is what kept the old
 *    edge at a pixel and a half, and what made `body:glow` on VERSUS — five
 *    pixels, still in the line's own weight — a difference the owner could not
 *    see at phone size (`tools/versus/DECIDED.md`, 25 September 2026).
 *
 * No `shadowBlur`, no gradient, no sprite: strokes of a `Path2D` the caller
 * already built, so it costs the passes and nothing per frame besides.
 *
 * **Glow is state** (`docs/shipped-looks.md`): a body shot in the wrong colour
 * is a grey outline and its caller never reaches this. A caller that fades a
 * whole body by `ctx.globalAlpha` has the aura faded with it, and finds that
 * alpha as it left it.
 */
export interface BodyAuraLook {
  /** How far past the contour the outermost pass reaches, as a share of the
   * body's radius on screen. */
  reach: number;
  /** The narrowest pass's alpha; pass `i` of `passes` is `strength / i`. */
  strength: number;
  passes: number;
  /** How far the light breathes, as a share of itself, and how fast, in
   * radians a second on the body's own contour clock — so two bodies side by
   * side breathe out of step, as their wobble already is. */
  breathe: number;
  breatheRate: number;
}

export const BODY_AURA: BodyAuraLook = {
  reach: 0.75,
  strength: 0.2,
  passes: 3,
  breathe: 0.22,
  breatheRate: 1.9,
};

/**
 * Stroke `path`'s aura in `color`, for a body of screen radius `r` drawn under
 * `scale`. Call it **before** the body's fill. `intensity` scales the light
 * (a pod's pulse, a ghost's temper); `t` is the body's own clock, for the
 * breath.
 */
export function bodyAura(
  ctx: CanvasRenderingContext2D,
  path: Path2D,
  color: string,
  r: number,
  scale: number,
  t: number,
  intensity = 1,
): void {
  const fade = ctx.globalAlpha;
  const look = BODY_AURA;
  const breath = 1 - look.breathe * (0.5 + 0.5 * Math.sin(t * look.breatheRate));
  const a = look.strength * intensity * breath * fade;
  if (a <= 0) return;
  // Full width is both sides of the line; only the outer half is ever seen.
  const reach = (2 * r * look.reach) / scale;
  const prev = ctx.globalCompositeOperation;
  const width = ctx.lineWidth;
  const join = ctx.lineJoin;
  ctx.globalCompositeOperation = "lighter";
  ctx.strokeStyle = color;
  ctx.lineJoin = "round";
  if (speck()) {
    // Under a pixel between passes: one at their middle carries their light.
    ctx.lineWidth = reach * 0.6;
    ctx.globalAlpha = Math.min(1, a * SUM);
    ctx.stroke(path);
  } else {
    for (let i = look.passes; i >= 1; i--) {
      ctx.lineWidth = (reach * i) / look.passes;
      ctx.globalAlpha = a / i;
      ctx.stroke(path);
    }
  }
  ctx.globalCompositeOperation = prev;
  ctx.lineWidth = width;
  ctx.lineJoin = join;
  ctx.globalAlpha = fade;
}

/** What the passes' alphas add up to, over `strength`. */
const SUM = Array.from({ length: BODY_AURA.passes }, (_, i) => 1 / (i + 1)).reduce(
  (s, v) => s + v,
  0,
);

/**
 * How far a boss's aura reaches past its contour, in tiles. A boss is a body
 * several tiles across, and a reach that grew with it as a creature's does
 * would stand a whole tile of light off the slab: the light is the same soft
 * rim a body wears, whatever the size of what wears it.
 */
export const BOSS_AURA_TILES = 0.32;

/**
 * `bodyAura` for a boss's body, drawn in screen pixels: one path, or every
 * piece of a body that is several, stroked together as one so the cost stays
 * the passes and two pieces that meet do not double their light where they do.
 * Before the body's fill, as `bodyAura` is.
 */
export function bossAura(
  ctx: CanvasRenderingContext2D,
  body: Path2D | readonly Path2D[],
  color: string,
  tile: number,
  t: number,
  intensity = 1,
): void {
  let path: Path2D;
  if (body instanceof Path2D) path = body;
  else {
    path = new Path2D();
    for (const p of body) path.addPath(p);
  }
  bodyAura(ctx, path, color, (tile * BOSS_AURA_TILES) / BODY_AURA.reach, 1, t, intensity);
}
