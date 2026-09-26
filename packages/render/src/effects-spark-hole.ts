import { isWardable, type SimEvent } from "@neon-spore/sim";
import type { Burst } from "./effects-spark.js";
import type { SurfaceY } from "./hull-frame.js";
import { bodyX, type Layout, tileCY } from "./layout.js";
import { PALETTE } from "./palette.js";
import { rockFallY } from "./rock-fall.js";
import { rockRadius } from "./rock-size.js";

type Hole = Extract<SimEvent, { type: "hole" }>;

/**
 * **A crater's puffs, thrown from the rock rather than from its row.**
 *
 * A rock's last six rows are drawn higher than its row, by the bend that puts
 * it on the skin at the end of its landing beat (`rock-fall.ts`), so a burst
 * at `tileCY(row)` came out up to about a tile under the rock the pair was
 * looking at. A warded kind is placed by the same `rockFallY` the field pass
 * draws it by, touching at `skin - rockRadius` as `landingY` has it; anything
 * else that leaves a hole — a moult's shell, a cairn, a ring — is not bent and
 * keeps its row.
 *
 * `skinY` is the plating the last field frame was drawn on (`render-state.ts`);
 * a host that has not drawn one yet gets the flat hull line, which is within a
 * lobe's height of it.
 */
export function holeBurst(e: Hole, l: Layout, skinY: SurfaceY | undefined): Burst {
  const x = bodyX(l, e.col, e.row);
  const flat = tileCY(l, e.row);
  const y = isWardable(e.kind)
    ? rockFallY(l, e.row, flat, (skinY ? skinY(x) : l.hullY) - rockRadius(l, e.span))
    : flat;
  return { x, y, n: 5, hex: PALETTE.rock };
}
