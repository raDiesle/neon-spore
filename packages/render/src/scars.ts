import type { Point } from "@neon-spore/content";
import type { Scar } from "@neon-spore/sim";
import { type Layout, tileCX } from "./layout.js";
import { PALETTE } from "./palette.js";

/**
 * A breach stays, and it stays *in the skin*. The prototype scattered round
 * craters with `Math.random` at a fixed height above the band; both were wrong.
 * A hole is a hole in something, so it hangs where the membrane is at that
 * moment — the surface breathes and the lobes lift it, and the damage rides
 * along — and a torn membrane tears, so it is a crack rather than a pellet.
 *
 * The jitter comes from the column and the beat it happened on, so the same
 * damage looks the same on both screens without the simulation storing it.
 */

/** How deep into the hull a crack reaches, in tiles. */
const DEPTH_MIN = 0.34;
const DEPTH_MAX = 0.62;
/** Kinks along the crack. Few enough to stay a line, enough to look torn. */
const KINKS = 5;

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

export function drawScars(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  scars: readonly Scar[],
  time: number,
  surfaceAt: (x: number) => Point,
): void {
  ctx.save();
  for (const s of scars) {
    const seed = Math.imul(s.col + 1, 73856093) ^ Math.imul(s.beat + 1, 19349663);
    const rnd = stream(seed);
    const x = tileCX(l, s.col) + (rnd() - 0.5) * l.tile * 0.44;
    const top = surfaceAt(x);
    const lean = rnd() < 0.5 ? -1 : 1;
    const main = crackPoints(l.tile, top, rnd, lean);

    // The split itself, dark, starting a hair above the surface so the crack
    // breaks the outline rather than beginning under it.
    ctx.strokeStyle = "#150E28";
    strokeCrack(ctx, [{ x: top.x, y: top.y - 1.5 }, ...main.slice(1)], 3.2);

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
