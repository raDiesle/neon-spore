import type { Pod } from "@neon-spore/sim";
import { strokeGlow } from "./glow.js";
import { type Layout, tileCX, tileCY } from "./layout.js";
import { PALETTE } from "./palette.js";

/**
 * THE ROE's thread: a glowing amber strand down a column, through every roe
 * pod still hanging in it, so the pair can see that one shot frees the string
 * before anybody has fired it (`PodEntry.roe`, `sim/pods.ts`).
 *
 * Drawn under the pods and only between moored ones. The moment the shot lands
 * the string is all loose, and a thread with nothing to hold would be a line
 * pointing at where a pod used to be.
 *
 * The strand sways a little on the clock, out of step down its length, so it
 * reads as a thread hanging rather than a rule drawn on the field. Nothing is
 * stored, so both phones draw the same frame of it.
 */
export function drawRoeThreads(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  pods: readonly Pod[],
  time: number,
): void {
  const byCol = new Map<number, Pod[]>();
  for (const p of pods) {
    if (!p.roe || p.loose) continue;
    byCol.set(p.colMilli, [...(byCol.get(p.colMilli) ?? []), p]);
  }
  for (const string of byCol.values()) {
    if (string.length < 2) continue;
    string.sort((a, b) => a.rowMilli - b.rowMilli);
    const x = tileCX(l, string[0]!.colMilli / 1000);
    const path = new Path2D();
    path.moveTo(x, tileCY(l, string[0]!.rowMilli / 1000));
    for (let i = 1; i < string.length; i++) {
      const y0 = tileCY(l, string[i - 1]!.rowMilli / 1000);
      const y1 = tileCY(l, string[i]!.rowMilli / 1000);
      const sway = Math.sin(time * 1.3 + i * 1.7) * l.tile * 0.18;
      path.quadraticCurveTo(x + sway, (y0 + y1) / 2, x, y1);
    }
    strokeGlow(ctx, path, PALETTE.pod, l.tile * 0.06, 1.2, 0.85);
  }
}
