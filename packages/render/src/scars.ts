import type { Point } from "@neon-spore/content";
import type { Scar } from "@neon-spore/sim";
import { type Crater, mouth } from "./craters.js";
import { type Layout, tileCX } from "./layout.js";
import { PALETTE } from "./palette.js";

/**
 * A breach stays, and it stays *in the skin*. The prototype scattered round
 * craters with `Math.random` at a fixed height above the band; both were wrong.
 * A hole is a hole in something, so it hangs where the membrane is at that
 * moment — the surface breathes and the lobes lift it, and the damage rides
 * along — and a torn membrane tears, so it is a crack rather than a pellet.
 *
 * It rides two different heights, though, and that is the whole of `skinAt`.
 * The body of the tear hangs from the membrane *without* the cannon lobe: the
 * cannon is narrow and travels fast, so a crack that rode it was flicked half a
 * tile upwards and back within a fifth of a second, and half a tile in a fifth
 * of a second is a twitch, not a swelling passing underneath. Only the topmost
 * point follows the true outline, so the tear stays attached and its mouth
 * stretches as the cannon goes by. The shield keeps pushing the whole crack up,
 * because a wide, flat, slow lobe lifting a tear is exactly what it looks like.
 *
 * The jitter comes from the column and the beat it happened on, so the same
 * damage looks the same on both screens without the simulation storing it.
 */

/** How deep into the hull a crack reaches, in tiles. */
const DEPTH_MIN = 0.34;
const DEPTH_MAX = 0.62;
/** Kinks along the crack. Few enough to stay a line, enough to look torn. */
const KINKS = 5;
/**
 * How many points from the mouth down share the pull of the cannon lobe. Only
 * the mouth follows it fully; the share tapers to nothing by the third kink, so
 * the tear opens instead of being dragged, and never grows one long straight
 * spike between a raised outline and a crack that stayed behind.
 */
const FOLLOW = 3;

/** A tiny deterministic stream of 0..1 values from one integer. */
function stream(seed: number): () => number {
  let n = seed | 0;
  return () => {
    n = (Math.imul(n, 1664525) + 1013904223) | 0;
    return ((n >>> 8) % 10000) / 10000;
  };
}

function crackPoints(tile: number, top: Point, rnd: () => number, lean: number): Point[] {
  const depth = tile * (DEPTH_MIN + rnd() * (DEPTH_MAX - DEPTH_MIN));
  const pts: Point[] = [top];
  for (let i = 1; i <= KINKS; i++) {
    const u = i / KINKS;
    // The tear narrows as it runs out of energy: the zigzag shrinks with depth.
    const jitter = (rnd() - 0.5) * tile * 0.26 * (1 - u * 0.7);
    pts.push({ x: top.x + lean * u * tile * 0.18 + jitter, y: top.y + depth * u });
  }
  return pts;
}

function strokeCrack(ctx: CanvasRenderingContext2D, pts: Point[], width: number): void {
  ctx.lineWidth = width;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.beginPath();
  ctx.moveTo(pts[0]!.x, pts[0]!.y);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i]!.x, pts[i]!.y);
  ctx.stroke();
}

/**
 * A crack never starts *inside* the hole its own rock left — a jagged line
 * with its mouth painted over by the crater's opaque fill used to read as
 * damage cut short, not damage that runs past the hole. When this scar's
 * column belongs to a crater that has appeared (`craters`, from `hull.ts` —
 * empty or not-yet-visible ones simply have no entry to find), the crack's
 * mouth starts just past that crater's own measured edge (`mouth`) instead
 * of at the impact column itself, on the side away from the hole, so it
 * reads as tearing outward from the rim rather than climbing out of the pit.
 */
function crackOrigin(
  l: Layout,
  s: Scar,
  rnd: () => number,
  lean: number,
  craters: readonly Crater[],
): { x: number; side: number } {
  const crater = craters.find((c) => c.cols.includes(s.col));
  if (!crater) return { x: tileCX(l, s.col) + (rnd() - 0.5) * l.tile * 0.44, side: lean };
  // A torch's two columns each own one side of the shared crater; a single
  // column has no such geometry to read, so it falls back to the same random
  // lean the zigzag itself uses, rather than a side that's always the same.
  const side = crater.cols.length > 1 ? (s.col === Math.min(...crater.cols) ? -1 : 1) : lean;
  const m = mouth(crater);
  const edge = side < 0 ? m.left : m.right;
  return { x: edge + side * l.tile * (0.12 + rnd() * 0.2), side };
}

export function drawScars(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  scars: readonly Scar[],
  time: number,
  surfaceAt: (x: number) => Point,
  skinAt: (x: number) => Point,
  craters: readonly Crater[] = [],
): void {
  ctx.save();
  for (const s of scars) {
    const seed = Math.imul(s.col + 1, 73856093) ^ Math.imul(s.beat + 1, 19349663);
    const rnd = stream(seed);
    const { x, side: lean } = crackOrigin(l, s, rnd, rnd() < 0.5 ? -1 : 1, craters);
    const top = surfaceAt(x);
    const main = crackPoints(l.tile, skinAt(x), rnd, lean);
    // The mouth sits a hair above the outline, so the crack breaks it rather
    // than beginning under it; the pull tapers away below.
    const pull = main[0]!.y - (top.y - 1.5);
    for (let i = 0; i < FOLLOW && i < main.length; i++) {
      main[i] = { x: main[i]!.x, y: main[i]!.y - pull * (1 - i / FOLLOW) };
    }

    ctx.strokeStyle = "#150E28";
    strokeCrack(ctx, main, 3.2);

    // One fork off the middle. Two would read as a spider, none as a scratch.
    const at = 1 + Math.floor(rnd() * 2);
    const branch = crackPoints(l.tile * 0.5, main[at]!, rnd, -lean).slice(0, KINKS - 1);
    ctx.strokeStyle = "#150E28";
    strokeCrack(ctx, branch, 2);

    // Something still burns in the break, along the whole length of it.
    ctx.globalAlpha = 0.32 + Math.sin(time * 5 + s.col * 1.3) * 0.16;
    ctx.strokeStyle = PALETTE.red;
    strokeCrack(ctx, main, 1.1);
    ctx.strokeStyle = PALETTE.redRim;
    strokeCrack(ctx, main.slice(0, 2), 0.8);
    ctx.globalAlpha = 1;
  }
  ctx.restore();
}
