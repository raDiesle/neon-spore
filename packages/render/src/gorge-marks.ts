import {
  type GorgeState,
  gorgeAsks,
  gorgeColOf,
  gorgeOffers,
  gorgeTapSeat,
  type SimConfig,
} from "@neon-spore/sim";
import { gorgeGripCircle } from "./gorge-grip.js";
import { drawVerdictRing, type GripVerdicts } from "./grip-verdict.js";
import type { Layout } from "./layout.js";
import { drawMarkHalo } from "./mark-feedback.js";
import { showsGorgeTap } from "./view-role-clocks-b.js";

/**
 * **THE GORGE's tap answering a touch the way every mark does**
 * (`mark-feedback.ts`, `grip-verdict.ts`; the owner, 27 September 2026: *the
 * consistent visual across all waves*).
 *
 * Which bubble asks is the simulation's (`sim/gorge-hand.ts` `gorgeAsks`):
 * the ring's bottom bubble, while it is shut and due, asks the pilot. On the
 * screen that shows it, the ring asked wears the halo under it.
 *
 * The verdicts come last, over the ring, keyed by the bubble's column: the
 * green of a tap (`gorgeTap`), and the red of a shot the bubble refused
 * (`gorgeSpit`) — shut, or out of turn. Held in `GorgeFx`, the sack's own fx
 * class.
 */
export function drawGorgeAsked(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  cfg: SimConfig,
  g: GorgeState,
  beat: number,
  beatPhase: number,
  time: number,
): void {
  for (const seat of seatsShown(l)) {
    for (const i of gorgeAsks(g, cfg, seat)) {
      const c = gorgeGripCircle(l, cfg, g, i, beat, beatPhase);
      drawMarkHalo(ctx, c.x, c.y, c.r, time);
    }
  }
}

/**
 * The verdict round each ring this screen shows, last of all, on the rings
 * on offer rather than those asking, so a tap on a bubble no longer due
 * still has its green on a ring still drawn.
 */
export function drawGorgeVerdicts(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  cfg: SimConfig,
  g: GorgeState,
  beat: number,
  beatPhase: number,
  verdicts: GripVerdicts,
): void {
  for (const seat of seatsShown(l)) {
    for (const i of gorgeOffers(g, cfg, seat)) {
      const v = verdicts.at(gorgeColOf(cfg, g, i));
      if (v === null) continue;
      const c = gorgeGripCircle(l, cfg, g, i, beat, beatPhase);
      drawVerdictRing(ctx, c.x, c.y, c.r, v);
    }
  }
}

function seatsShown(l: Layout): (1 | 2)[] {
  const out: (1 | 2)[] = [];
  if (showsGorgeTap(l.role)) out.push(gorgeTapSeat);
  return out;
}
