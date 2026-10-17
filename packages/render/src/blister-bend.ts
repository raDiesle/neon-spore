/**
 * A bend about a point: moved by `dx, dy`, turned by `turn` radians and
 * scaled by `sx, sy`, all about `(x, y)` — the one transform nearly every
 * blister death lays on a body (`blister-death.ts`), so none of them spells it
 * out.
 */
export function bendAbout(
  x: number,
  y: number,
  b: { sx?: number; sy?: number; turn?: number; dx?: number; dy?: number },
): (ctx: CanvasRenderingContext2D) => void {
  return (ctx) => {
    ctx.translate(x + (b.dx ?? 0), y + (b.dy ?? 0));
    if (b.turn) ctx.rotate(b.turn);
    ctx.scale(b.sx ?? 1, b.sy ?? 1);
    ctx.translate(-x, -y);
  };
}

/** How much of the window `from..to` a death at `at` has covered, 0..1. */
export function during(at: number, from: number, to: number): number {
  return Math.max(0, Math.min(1, (at - from) / (to - from)));
}
