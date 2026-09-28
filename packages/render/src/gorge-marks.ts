import {
  type GorgeState,
  gorgeAsks,
  gorgeOffers,
  gorgePinchSeat,
  gorgePrySeat,
  type SimConfig,
} from "@neon-spore/sim";
import { gorgeGripCircle } from "./gorge-grip.js";
import { drawVerdictRing, type GripVerdicts } from "./grip-verdict.js";
import type { Layout } from "./layout.js";
import { drawMarkHalo } from "./mark-feedback.js";
import { showsGorgePinch, showsGorgePry } from "./view-role-clocks-b.js";

/**
 * **THE GORGE's pinch and pry answering a touch the way every mark does**
 * (`mark-feedback.ts`, `grip-verdict.ts`; the owner, 27 September 2026: *the
 * consistent visual across all waves*) — as far as two rings each drawn on
 * one screen let it.
 *
 * Which intakes ask is the simulation's (`sim/gorge-hand.ts` `gorgeAsks`):
 * every full intake that is not the mouth asks the pilot while none is
 * pinched, and the mouth asks the navigator until her thumb is on it. On the
 * screen that shows it, each ring asked wears the halo under it.
 *
 * **No partner's clock and no refusal**, for THE GAUGE's reason
 * (`gauge-marks.ts`): the pinch's rings are never drawn on the navigator's
 * screen and the pry's never on the pilot's, so a press from the other seat
 * finds no ring, and there is nothing a turning ring could show.
 *
 * The verdicts come last, over the rings, keyed by the intake's column: the
 * green of a pinch (`gorgePinch`) and of a pry (`gorgePry`), and the red of a
 * pry held past its window, which the mouth clenches on and throws off
 * (`gorgeClench`). Held in `GorgeFx`, the sack's own fx class.
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
 * on offer rather than those asking: a pinch and a pry both stop their ring
 * asking on the tick they land, and a clench leaves the mouth on offer with
 * the thumb thrown off, so every verdict stands on a ring still drawn.
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
      const v = verdicts.at(g.col + i);
      if (v === null) continue;
      const c = gorgeGripCircle(l, cfg, g, i, beat, beatPhase);
      drawVerdictRing(ctx, c.x, c.y, c.r, v);
    }
  }
}

function seatsShown(l: Layout): (1 | 2)[] {
  const out: (1 | 2)[] = [];
  if (showsGorgePinch(l.role)) out.push(gorgePinchSeat);
  if (showsGorgePry(l.role)) out.push(gorgePrySeat);
  return out;
}
