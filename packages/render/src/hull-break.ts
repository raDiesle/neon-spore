import type { Point } from "@neon-spore/content";
import type { Crater } from "./crater-geom.js";
import { HULL_BREAK_LOOK, type HullBreakLook } from "./hull-break-look.js";
import type { Layout } from "./layout.js";

/**
 * **What the ship wears where something went through it.**
 *
 * One call per open hole, drawn straight after the pits themselves so a break
 * is over the hole it belongs to rather than under it. What it draws is
 * `HULL_BREAK_LOOK`'s and the shipped record draws nothing — this function is
 * the seam a VERSUS candidate reaches through, on `Debris`'s terms and for
 * `hull-break-look.ts`'s reasons.
 *
 * **Open craters and not every scar.** A rock lies in its own hole for a beat
 * after it lands and the pit is not drawn until it has climbed back out
 * (`craterVisible`), so plating torn open around a hole nobody can see yet
 * would be damage arriving before the thing that caused it — the gate
 * `arrivals.ts` exists for, reached here by taking the list the hull has
 * already filtered rather than by asking a second time.
 *
 * It has no state of its own. A scar is in the world and stays there for the
 * rest of the run, so there is nothing here to clear on a restart and nothing
 * to age: this is a picture of the hull as it stands, redrawn every frame.
 */
export function drawHullBreaks(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  craters: readonly Crater[],
  time: number,
  skinAt: (x: number) => Point,
  rim: string,
): void {
  const look: HullBreakLook = HULL_BREAK_LOOK;
  if (look.open <= 0) return;
  ctx.save();
  for (const c of craters) {
    look.paint(ctx, {
      x: c.x,
      y: c.top.y,
      r: c.r,
      left: c.left,
      right: c.right,
      tile: l.tile,
      time,
      // The column and the angle the rock came to rest at: a hole's own two
      // facts, and neither of them changes once it is cut.
      seed: (c.cols[0] ?? 0) * 31 + Math.round(c.rotation * 100),
      skinY: (x) => skinAt(x).y,
      rim,
    });
  }
  ctx.restore();
}
