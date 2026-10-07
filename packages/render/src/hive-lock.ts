import { type HiveState, hiveHoldable, type SimConfig } from "@neon-spore/sim";
import { drawGripRing } from "./grip-rings.js";
import { hiveLobeCircle } from "./hive-grip.js";
import { hitCircle, type Layout } from "./layout.js";
import { drawMarkHalo } from "./mark-feedback.js";
import type { Field, Touch } from "./touch.js";
import { bossOf } from "./touch-field.js";
import { showsHiveColor } from "./view-role-clocks-b.js";

/**
 * **The pilot's thumb on a wall's cocoon** (`sim/hive-wall.ts`): a ring on
 * every open breach up a wall that a bolt fired straight up the wall cannot
 * reach, because the lowest cocoon on it is in the way. Held, it steers every
 * shot he fires into that cocoon round the corner, so the ring is the promise
 * of a hit and stands only where the hold buys one — never on the lowest
 * cocoon, which the cannon reaches by itself, and never on a shut one or a
 * scar.
 *
 * His and nobody else's: the pilot is the seat holding the cannon, as he is
 * the seat THE LOCK gives a held body to (`sim/lock.ts`), and the breach's
 * colour is his to say while her thumbs fire it.
 */

/** A press of the pilot's on one of those: a `drag` on `hiveLobe` carrying the cocoon, held until the lift. */
export function hiveLockUnder(l: Layout, x: number, y: number, field: Field): Touch | null {
  const s = bossOf(field, "hive");
  if (s === null || field.seat !== 1) return null;
  const { cfg, beat, beatPhase } = field;
  for (const i of hiveHoldable(s)) {
    if (!hitCircle(hiveLobeCircle(l, cfg, s, i, beat, beatPhase), x, y)) continue;
    return {
      player: 1,
      command: { kind: "drag", target: "hiveLobe", on: true, fromMilli: 0, fromYMilli: 0, id: i },
      hold: { kind: "drag", target: "hiveLobe", player: 1, originX: x, originY: y, id: i },
    };
  }
  return null;
}

/** The rings, on the pilot's screen: a halo under every one that asks, and the held one drawn held. */
export function drawHiveLocks(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  cfg: SimConfig,
  s: HiveState,
  beat: number,
  beatPhase: number,
  time: number,
): void {
  if (!showsHiveColor(l.role)) return;
  for (const i of hiveHoldable(s)) {
    const c = hiveLobeCircle(l, cfg, s, i, beat, beatPhase);
    const held = s.aim === i;
    if (!held) drawMarkHalo(ctx, c.x, c.y, c.r, time);
    drawGripRing(ctx, c.x, c.y, c.r, held, time);
  }
}
