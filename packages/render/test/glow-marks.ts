import { stubCanvas } from "./frame-harness.js";

/**
 * The alpha of every mark a draw makes, and the alpha it leaves — shared by
 * `glow-faded.test.ts` and `glow-faded-arrival.test.ts`, which ask whether a
 * body fading by `ctx.globalAlpha` draws anything brighter than its fade.
 */
export function marks(draw: (c: CanvasRenderingContext2D) => void, start = 1) {
  const { ctx } = stubCanvas();
  const c = ctx as unknown as CanvasRenderingContext2D;
  const at: number[] = [];
  for (const name of ["stroke", "fill", "fillRect", "drawImage", "fillText"] as const) {
    const was = (c[name] as (...a: unknown[]) => void).bind(c);
    (c as unknown as Record<string, unknown>)[name] = (...a: unknown[]) => {
      at.push(c.globalAlpha);
      was(...a);
    };
  }
  c.globalAlpha = start;
  draw(c);
  return { at, after: c.globalAlpha };
}
