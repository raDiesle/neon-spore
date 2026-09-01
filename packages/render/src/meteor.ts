import { crystalPath, KEY, LIGHT_HALF, METEOR } from "@neon-spore/content";
import { type Creature, spanOf } from "@neon-spore/sim";
import { halo } from "./glow.js";
import { litRound } from "./key-light.js";
import type { Layout } from "./layout.js";
import { PALETTE, STROKE } from "./palette.js";
import { rockRadius } from "./torch.js";

/**
 * The rock. Angular facets rather than a contour, because it does not live —
 * that is the fiction the indestructibility rests on (docs/spec/graphics.md). Craters from
 * shots are placed from the creature id, so both screens agree without the
 * simulation having to store an angle per hole.
 */

/**
 * The key axis, taken back out of the rock's own rotation — the same
 * correction `litRound` applies to the whole body, repeated here so a pit can
 * be lit by the fixed key light rather than by one glued to the facet it sits
 * on. `key-light.ts` keeps its own copy of this private; this is the one
 * other call site, small enough not to be worth exporting a rotation helper
 * for.
 */
function keyAxis(spin: number): { dx: number; dy: number } {
  const c = Math.cos(-spin);
  const s = Math.sin(-spin);
  return { dx: KEY.x * c - KEY.y * s, dy: KEY.x * s + KEY.y * c };
}

/** `#rrggbb` plus an alpha, as a canvas can take directly in a gradient stop. */
function rgba(hex: string, alpha: number): string {
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
function pitGradient(
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
export function drawMeteor(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  c: Creature,
  x: number,
  y: number,
  time: number,
): void {
  const r = rockRadius(l, spanOf(c));
  const spin = (c.id % 13) * 0.48;
  const wobble = Math.sin(time * 1.1 + spin) * l.tile * 0.06;
  const d = crystalPath(
    0,
    0,
    r,
    r,
    METEOR.sides,
    METEOR.depth,
    METEOR.wobble,
    time * 0.15,
    METEOR.seed,
  );
  const path = new Path2D(d);

  const turn = spin + time * 0.12;
  ctx.save();
  ctx.translate(x + wobble, y);
  ctx.rotate(turn);

  // The rock's volume used to come from a linear gradient built in this
  // rotated frame, which meant its light turned with the rock: a stone whose
  // bright side is glued to the stone is a painted stone. The value range is
  // the same range; what changed is that it now comes from the key light and
  // `turn` is handed back to it, so the light stays where it is while the rock
  // rolls under it. The base is the unlit mid-tone between `PALETTE.rock` and
  // `rockDark` — the light supplies the ends, so nothing paints a second set.
  ctx.fillStyle = "#8A8F9C";
  ctx.fill(path);
  ctx.save();
  ctx.clip(path);
  litRound(ctx, 0, 0, r, LIGHT_HALF.rock, turn);
  ctx.restore();
  ctx.strokeStyle = PALETTE.rock;
  ctx.lineWidth = STROKE.outline;
  ctx.stroke(path);

  const { dx, dy } = keyAxis(turn);
  for (let k = 0; k < c.holes; k++) {
    const a = ((k * 2.399) % (Math.PI * 2)) + (c.id % 5) * 0.4;
    const dist = 0.3 + ((k * 7 + c.id) % 10) / 28;
    const hx = Math.cos(a) * r * dist;
    const hy = Math.sin(a) * r * dist;
    const pr = r * 0.16;
    ctx.beginPath();
    ctx.arc(hx, hy, pr, 0, Math.PI * 2);
    ctx.fillStyle = pitGradient(ctx, hx, hy, pr, dx, dy, PIT_FLOOR);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(hx, hy, pr * 1.05, 0, Math.PI * 2);
    ctx.strokeStyle = pitGradient(ctx, hx, hy, pr * 1.05, dx, dy, PIT_LIP);
    ctx.lineWidth = 0.8;
    ctx.stroke();
  }
  ctx.restore();
  halo(ctx, x + wobble, y, r * 1.6, PALETTE.rock, 0.1);
}
