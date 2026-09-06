import { fenceGapSeen, type World } from "@neon-spore/sim";
import { drawnRow } from "./depth.js";
import { drawFenceGate } from "./fence-gate.js";
import { drawFenceSweep } from "./fence-sweep.js";
import { drawRun } from "./fence-wire.js";
import type { SurfaceY } from "./hull-frame.js";
import type { Layout } from "./layout.js";

/**
 * THE FENCE: a live line the width of the field, and the two different
 * pictures of it the two screens carry.
 *
 * **Player 1 sees where it is broken and player 2 sees a wall.** That is the
 * whole creature and it is the whole of this file: the wire is drawn tile by
 * tile, and on the pilot's screen the tiles it is open in are simply not
 * drawn — the line stops, the two ends spark, and the way through is a hole
 * you can see the field's own grid through. On the navigator's screen the same
 * wire runs from wall to wall, and the navigator is the only seat that can move
 * the dome (`comms.ts`).
 *
 * **Except where the cannon cut it.** A burnt column is on **both** screens:
 * the bolt went up in front of the two of them, so there is nothing left to
 * withhold. `fenceGapSeen` is the one place that split is decided and it lives
 * in the simulation, because *which of these holes is a secret* is a fact about
 * the creature rather than about a canvas.
 *
 * **And player 2 gets a sweep where the pilot gets the doorways.** A screen
 * shown an unbroken wire has nothing to look at and no reason to ask, so a
 * pulse runs the width of it, over and over, saying *there is a way through
 * this somewhere and it is not yours to find* (`fence-sweep.ts`). It carries
 * no information at all, which is exactly the point and is the property the
 * file is written to keep.
 *
 * **What the four files around this one hold.** The material the line is drawn
 * out of, and how far it hangs above the ship, is `fence-wire.ts`; the doorway
 * over an open column is `fence-gate.ts`; the navigator's sweep is
 * `fence-sweep.ts`; and the current jumping between the wall and the dome once
 * the two are within reach of each other is `fence-arc.ts`, drawn in the
 * *ship's* pass rather than this one because it lands on the ship.
 *
 * **It is drawn flat, outside the per-body perspective transform.** A fence is
 * not a body standing on a tile — it has no centre to scale about and it
 * covers every column at once — so `frame-field.ts` calls this before the pass
 * that places bodies, the way it already does for a worm and a wheel.
 */

/** Whether this screen is shown where the wave opened the fence. The pilot's
 * read, the same half as every other thing the shield answers
 * (docs/spec/roles.md) — and the sharpest one there is, because the seat that
 * can act on it is the other one. A column the *cannon* cut is on both screens
 * either way, which is `fenceGapSeen`'s business and not this predicate's. */
export function showsFenceGaps(l: Layout): boolean {
  return l.role !== "p2";
}

/** Every fence on the field, drawn. Called once per frame from
 * `frame-field.ts`, before the pass that places bodies on tiles. */
export function drawFences(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  beatPhase: number,
  time: number,
  /** The ship's drawn surface, so the wall comes to rest on it rather than
   * sinking through it (`fenceLineY`). Absent leaves every wall flat on its own
   * row, which is where they all were. */
  surfaceY?: SurfaceY,
): void {
  const secret = showsFenceGaps(l);
  for (const c of world.creatures) {
    if (c.kind !== "fence") continue;
    const row = drawnRow(c, beatPhase);
    // The runs of unbroken wire, in columns. One run on the navigator's screen
    // unless the cannon has cut one; one per stretch of solid fence on the
    // pilot's.
    let from = 0;
    for (let col = 0; col <= l.cols; col++) {
      if (col < l.cols && !fenceGapSeen(c, col, secret)) continue;
      if (col > from) drawRun(ctx, l, from, col, row, time, surfaceY);
      if (col < l.cols) drawFenceGate(ctx, l, col, row, time, surfaceY);
      from = col + 1;
    }
    if (from < l.cols) drawRun(ctx, l, from, l.cols, row, time, surfaceY);
    // And, on the one screen shown no gaps at all, the sweep that says there is
    // something to be told. Over the wire and across the whole width, so there
    // is no way for it to carry *where*.
    if (!secret) drawFenceSweep(ctx, l, row, time, surfaceY);
  }
}
