import { KEY, LIGHT_HALF } from "@neon-spore/content";
import { litRound } from "./key-light.js";
import { PALETTE, STROKE } from "./palette.js";

/**
 * WHAT A ROCK IS MADE OF, as a record rather than as the body of one function.
 *
 * `drawMeteor` used to hold the fill, the light, the outline, the pits and the
 * halo inline, which made the rock's *material* unarguable: there was nowhere
 * for a second answer to it to sit. `docs/versus.md` names the meteor as the
 * case the mechanism should be tested against, and this is the seam that makes
 * that possible — the layers a look is made of, named, with the shipped ones
 * filled in below.
 *
 * Nothing here changes a pixel. `drawMeteor` calls these in the order it used
 * to run them, in the same transform, and `METEOR_LOOK` holds exactly the
 * arithmetic that was inline. It is the same rock; it is now a rock somebody
 * can offer another answer to.
 */
export interface MeteorLook {
  /**
   * The stone, in the rock's own rotated frame, centred on the origin.
   * `turn` is the rotation the frame already carries, so the key light can be
   * asked for the direction it is coming from rather than one glued to the
   * rock.
   */
  body(ctx: CanvasRenderingContext2D, path: Path2D, r: number, turn: number, time: number): void;
  /**
   * One shot's hole, in the same frame. `dx`/`dy` is the key axis with the
   * rock's own rotation already taken back out — handed in rather than
   * recomputed per pit, because it is one axis for the whole rock.
   */
  pit(
    ctx: CanvasRenderingContext2D,
    hx: number,
    hy: number,
    pr: number,
    dx: number,
    dy: number,
  ): void;
  /**
   * Anything drawn *around* the rock and not turning with it — a field, a
   * shell, a shockwave. The shipped rock has none, and `null` is the honest
   * spelling of that rather than a function that draws nothing.
   */
  shell: ((ctx: CanvasRenderingContext2D, r: number, time: number) => void) | null;
  /** The soft light around it, in screen space: radius multiple, colour, alpha. */
  haloMul: number;
  haloColor: string;
  haloAlpha: number;
}

/**
 * The key axis, taken back out of the rock's own rotation — the same
 * correction `litRound` applies to the whole body, repeated here so a pit can
 * be lit by the fixed key light rather than by one glued to the facet it sits
 * on. `key-light.ts` keeps its own copy of this private; this is the one
 * other call site, small enough not to be worth exporting a rotation helper
 * for.
 */
export function keyAxis(spin: number): { dx: number; dy: number } {
  const c = Math.cos(-spin);
  const s = Math.sin(-spin);
  return { dx: KEY.x * c - KEY.y * s, dy: KEY.x * s + KEY.y * c };
}

/** `#rrggbb` plus an alpha, as a canvas can take directly in a gradient stop. */
export function rgba(hex: string, alpha: number): string {
  const n = Number.parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${alpha.toFixed(3)})`;
}

/** The floor: dark on the side facing the light, the same reasoning
 * `crater.ts`'s `bowlPaint` states — the wall a light can reach inside a pit
 * is the far one, so the near wall reads darker than the body around it. Each
 * stop's alpha is well under 1, so the rock's own already-lit surface shows
 * through rather than a flat disc sitting on top of it — which is how a pit
 * near the rock's bright shoulder still reads as bright at its rim. */
const PIT_FLOOR: readonly (readonly [number, string, number])[] = [
  [0, "#0B0C11", 0.88],
  [0.55, "#0B0C11", 0.5],
  [1, "#4A4E5C", 0.3],
];

/** The raised lip: bright where it tilts toward the light, gone by the far
 * side — opposite the floor, which is the opposition that reads as depth. */
const PIT_LIP: readonly (readonly [number, string, number])[] = [
  [0, PALETTE.rock, 0.85],
  [0.3, PALETTE.rock, 0.25],
  [1, PALETTE.rock, 0],
];

/** A gradient across one pit's own bounding box, along the key axis —
 * `crater.ts`'s `keyRamp`, for a canvas rather than an SVG `<linearGradient>`. */
export function pitGradient(
  ctx: CanvasRenderingContext2D,
  hx: number,
  hy: number,
  pr: number,
  dx: number,
  dy: number,
  list: readonly (readonly [number, string, number])[],
): CanvasGradient {
  const grad = ctx.createLinearGradient(hx + dx * pr, hy + dy * pr, hx - dx * pr, hy - dy * pr);
  for (const [u, hex, alpha] of list) grad.addColorStop(u, rgba(hex, alpha));
  return grad;
}

/**
 * The shipped rock: stone. The base is the unlit mid-tone between
 * `PALETTE.rock` and `rockDark` — the key light supplies the ends, so nothing
 * paints a second set.
 *
 * The volume used to come from a linear gradient built in the rotated frame,
 * which meant its light turned with the rock: a stone whose bright side is
 * glued to the stone is a painted stone. It comes from the key light now and
 * `turn` is handed back to it, so the light stays where it is while the rock
 * rolls under it.
 */
export const METEOR_LOOK: MeteorLook = {
  body(ctx, path, r, turn) {
    ctx.fillStyle = "#8A8F9C";
    ctx.fill(path);
    ctx.save();
    ctx.clip(path);
    litRound(ctx, 0, 0, r, LIGHT_HALF.rock, turn);
    ctx.restore();
    ctx.strokeStyle = PALETTE.rock;
    ctx.lineWidth = STROKE.outline;
    ctx.stroke(path);
  },
  pit(ctx, hx, hy, pr, dx, dy) {
    ctx.beginPath();
    ctx.arc(hx, hy, pr, 0, Math.PI * 2);
    ctx.fillStyle = pitGradient(ctx, hx, hy, pr, dx, dy, PIT_FLOOR);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(hx, hy, pr * 1.05, 0, Math.PI * 2);
    ctx.strokeStyle = pitGradient(ctx, hx, hy, pr * 1.05, dx, dy, PIT_LIP);
    ctx.lineWidth = 0.8;
    ctx.stroke();
  },
  shell: null,
  haloMul: 1.6,
  haloColor: PALETTE.rock,
  haloAlpha: 0.1,
};
