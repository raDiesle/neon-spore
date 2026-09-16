import type { StrikePaint } from "../../../../../packages/render/src/breach-look.js";
import { strokeGlow } from "../../../../../packages/render/src/glow.js";
import { stream } from "../../../../../packages/render/src/hash.js";

/**
 * The plating giving way. The skin around the point chars first — a dark patch
 * with no light in it, which is the one thing on this field nothing else does
 * — and then forks of light tear out of it along the membrane, growing while
 * the char spreads under them.
 *
 * **What it argues** is that a breach should read as *material failing*
 * rather than as energy arriving. The other two answers in this slot are both
 * light at a point; this one takes light away first, and the eye goes to the
 * hole because it is the only dark thing on a lit ship.
 */

/** Seconds. The slowest of the three: a tear is a thing that spreads. */
export const SECONDS = 1.2;

/** How many forks tear out of the point. Odd, so none of them is straight down. */
const FORKS = 7;

/** How far the longest fork reaches, in tiles. */
const REACH_TILES = 3.4;

/** Kinks along one fork. */
const KINKS = 4;

/** How wide the char gets, in tiles, and how dark. */
const CHAR_TILES = 2.6;
const CHAR_ALPHA = 0.85;

function ease(t: number): number {
  return 1 - (1 - t) ** 2;
}

export function rend(ctx: CanvasRenderingContext2D, s: StrikePaint): void {
  const grow = ease(Math.min(1, s.t / 0.55));
  // The char stays to the end and the forks die before it: what is left on the
  // last frame is a burnt patch, which is what the crack in the skin
  // (`scars.ts`) then hangs in.
  const lit = Math.max(0, 1 - Math.max(0, s.t - 0.35) / 0.65);
  const wide = Math.sqrt(s.span);
  const rnd = stream(s.seed + 1);

  ctx.save();
  const char = s.tile * CHAR_TILES * wide * grow;
  const burn = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, char);
  burn.addColorStop(0, `rgba(6,4,10,${CHAR_ALPHA})`);
  burn.addColorStop(0.6, "rgba(6,4,10,.45)");
  burn.addColorStop(1, "rgba(6,4,10,0)");
  ctx.fillStyle = burn;
  ctx.beginPath();
  ctx.arc(s.x, s.y, char, 0, Math.PI * 2);
  ctx.fill();

  for (let f = 0; f < FORKS; f++) {
    // Thrown across the skin rather than into the sky: the angles are taken
    // off the horizon both ways, so a fork never leaves the ship.
    const away = (f / (FORKS - 1)) * 2 - 1;
    const reach = s.tile * REACH_TILES * wide * grow * (0.55 + 0.45 * rnd());
    const path = new Path2D();
    path.moveTo(s.x, s.y);
    for (let i = 1; i <= KINKS; i++) {
      const u = i / KINKS;
      const x = s.x + away * reach * u;
      // Riding the membrane, kinked off it: a tear runs along the plating.
      const y = s.surfaceY(x) + (rnd() - 0.5) * s.tile * 0.3 * (1 - u * 0.6);
      path.lineTo(x, y);
    }
    strokeGlow(ctx, path, s.hex, Math.max(1.2, s.tile * 0.05), 0.4 + 1.6 * lit);
  }
  ctx.restore();
}
