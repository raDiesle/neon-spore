import { midCol, type SimConfig } from "./config.js";
import type { MimicState, MimicStep } from "./mimic.js";
import { mimicShapeAt, mimicShapeSize } from "./mimic-shapes.js";
import type { World } from "./world.js";

/**
 * **THE MIMIC's frame**: the square of the board a seat's picture stands in,
 * held by the mantle on both screens (`render/mimic-crane.ts`).
 *
 * The owner, 5 October 2026: *center the area of tiles to build (show it more
 * on the bottom)*, and the frame *the max area of tiles … for the current
 * level*. So it is **the same place every time**, worked out from the step
 * and never picked by the `Rng`: centred on the middle column, or on the
 * middle of its own half in a split, and its middle on `mimicFrameRow`, low on
 * the field. And it is **as big as every picture of its step** — each one
 * fills it (`mimic-shapes.ts`) — so where a tile is is said against the frame,
 * which both screens see, and never against the field.
 *
 * A tap outside the painter's own frame paints nothing (`mimic-hand.ts`).
 */

/** Seat `seat`'s frame for `step`: the column and row of its top left, and its side in tiles. */
export function mimicFrame(
  cfg: SimConfig,
  step: MimicStep,
  seat: 1 | 2,
): { col: number; row: number; size: number } {
  const size = step.size;
  const mid = midCol(cfg);
  // A split's halves leave the middle column between them, each frame
  // centred in its own.
  const centre =
    step.ask !== "split"
      ? mid
      : seat === 1
        ? Math.floor((mid - 1) / 2)
        : mid + 1 + Math.floor((cfg.cols - mid - 2) / 2);
  const half = Math.floor(size / 2);
  return { col: centre - half, row: cfg.mimicFrameRow - half, size };
}

/** Whether `col`, `row` is inside seat `seat`'s picture, which is its frame, while it has one. */
export function mimicInFrame(
  world: World,
  s: MimicState,
  seat: 1 | 2,
  col: number,
  row: number,
): boolean {
  const shape = s.signs[seat - 1] ?? -1;
  if (shape < 0) return false;
  const origin = s.origins[seat - 1] ?? 0;
  const cols = world.cfg.cols;
  const { w, h } = mimicShapeSize(shape);
  const [c0, r0] = [origin % cols, Math.floor(origin / cols)];
  return col >= c0 && col < c0 + w && row >= r0 && row < r0 + h;
}

/**
 * Whether seat `seat`'s picture wants the tile at `col`, `row` painted, 1,
 * or bare, 0 — and 0 everywhere while it has none.
 */
export function mimicWants(
  world: World,
  s: MimicState,
  seat: 1 | 2,
  col: number,
  row: number,
): number {
  const i = seat - 1;
  const shape = s.signs[i] ?? -1;
  if (shape < 0) return 0;
  const origin = s.origins[i] ?? 0;
  const cols = world.cfg.cols;
  return mimicShapeAt(shape, col - (origin % cols), row - Math.floor(origin / cols));
}

/** Whether every tile under seat `seat`'s picture is painted exactly as it wants. */
export function mimicPainted(world: World, s: MimicState, seat: 1 | 2): boolean {
  const i = seat - 1;
  const shape = s.signs[i] ?? -1;
  if (shape < 0) return false;
  const cols = world.cfg.cols;
  const origin = s.origins[i] ?? 0;
  const [c0, r0] = [origin % cols, Math.floor(origin / cols)];
  const { w, h } = mimicShapeSize(shape);
  for (let dr = 0; dr < h; dr++) {
    for (let dc = 0; dc < w; dc++) {
      const at = c0 + dc + (r0 + dr) * cols;
      if ((s.paint[at] ?? 0) !== mimicWants(world, s, seat, c0 + dc, r0 + dr)) return false;
    }
  }
  return true;
}
