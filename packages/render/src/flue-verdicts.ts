import {
  type FlueState,
  flueFiring,
  flueTapAsks,
  type SimEvent,
  type World,
} from "@neon-spore/sim";
import { flueEmberDrawn, flueSpent } from "./flue-pose.js";
import { FLUE_DAMPER, flueCoreR, flueEmberAt, flueEmberR, flueUnitAt } from "./flue-shape.js";
import { drawVerdictRing, GripVerdicts } from "./grip-verdict.js";
import { type Circle, type Layout, seatOf } from "./layout.js";
import { drawMarkHalo, drawMarkTheirs, drawMarkWait } from "./mark-feedback.js";

/**
 * **THE FLUE's marks answering a touch the way every mark does**
 * (`mark-feedback.ts`, `grip-verdict.ts`; the owner, 27 September 2026: *the
 * consistent visual across all waves*). Both screens draw the one flue
 * (`flue-draw.ts`), so this is THE HALTER's arrangement again: one seat keeps
 * still and the other works the thing the stillness holds.
 *
 * Two marks. **The ember** is the tap: it asks the lit vent's tapper once the
 * rester has steadied it (`flueTapAsks`), and wears the halo on the tapper's
 * screen and the partner's ring and clock on the rester's, so the still one
 * sees the taps are wanted of the other. **The core** asks for a shot on a
 * fire step with the core bared (`flueFiring`); that is either seat's, and
 * wears the halo on both screens and nobody's clock. **Keeping still is never
 * asked by a mark** — there is nothing to touch, and a damper step asks only
 * that — so the rester's screen waits on the tapper's mark and nothing else.
 *
 * The verdicts are the flue's own words: a tap landed or a vent spent greens
 * the ember, and a hit greens the core. A tap that skids, the taps thrown away
 * by a lapse, and a vent window run out redden the ember; a shot run out
 * reddens the core. A stir before any tap only loosens the ember, and a damper
 * held or shut is a stillness kept or broken, so none of them says anything
 * on a mark.
 *
 * The ember's circle follows the ember as it is drawn, steady or drifting, so
 * the verdict on the last tap is still round it after the vent has gone to
 * rest. Held in `FlueFx` (`flue-fx.ts`). Everything here is in canvas pixels.
 */
export const FLUE_TAP_MARK = 0;
export const FLUE_CORE_MARK = 1;

/** Each word of the flue's that answers or lapses: the marks it greens or reddens. */
const SAYS: Readonly<Record<string, { marks: readonly number[]; right: boolean }>> = {
  flueTick: { marks: [FLUE_TAP_MARK], right: true },
  flueVent: { marks: [FLUE_TAP_MARK], right: true },
  flueHit: { marks: [FLUE_CORE_MARK], right: true },
  flueSkid: { marks: [FLUE_TAP_MARK], right: false },
  flueLapse: { marks: [FLUE_TAP_MARK], right: false },
  flueChoke: { marks: [FLUE_TAP_MARK], right: false },
  flueMiss: { marks: [FLUE_CORE_MARK], right: false },
};

export class FlueVerdicts {
  /** Was the last touch on each mark right. */
  readonly verdicts = new GripVerdicts();

  ingest(events: readonly SimEvent[]): void {
    for (const e of events) {
      const said = SAYS[e.type];
      if (said === undefined) continue;
      for (const k of said.marks) this.verdicts.mark(k, said.right);
    }
  }

  update(dt: number): void {
    this.verdicts.update(dt);
  }

  clear(): void {
    this.verdicts.clear();
  }
}

/** What a mark asks of this screen: `own` for the halo, `theirs` for the partner's ring and clock. */
function asked(l: Layout, world: World, s: FlueState, mark: number): "own" | "theirs" | null {
  if (mark === FLUE_CORE_MARK) return flueFiring(s) ? "own" : null;
  const asks = (side: 0 | 1) => flueTapAsks(world, s, side);
  if (l.role === "test") return asks(0) || asks(1) ? "own" : null;
  const side = seatOf(l.role) === 1 ? 0 : 1;
  if (asks(side)) return "own";
  return asks(side === 0 ? 1 : 0) ? "theirs" : null;
}

/**
 * Over the flue, fading as it is spent: the halo on each mark that asks this screen, the
 * partner's ring and clock on each that asks only them, and every verdict
 * still showing.
 */
export function drawFlueMarkFeedback(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  s: FlueState,
  beat: number,
  beatPhase: number,
  time: number,
  fx: FlueVerdicts,
): void {
  const cfg = world.cfg;
  const fade = 1 - flueSpent(s, cfg, beat, beatPhase);
  const v = fx.verdicts;
  const ember = flueEmberAt(l, cfg, flueEmberDrawn(world, s, beatPhase));
  const core = flueUnitAt(l, cfg, FLUE_DAMPER);
  const marks: Circle[] = [
    { x: ember.x, y: ember.y, r: flueEmberR(l) * 3 },
    { x: core.x, y: core.y, r: flueCoreR(l) * 1.6 },
  ];
  const before = ctx.globalAlpha;
  marks.forEach((c, mark) => {
    ctx.globalAlpha = fade;
    const says = asked(l, world, s, mark);
    if (says === "own") drawMarkHalo(ctx, c.x, c.y, c.r, time);
    ctx.globalAlpha = fade;
    if (says === "theirs") {
      drawMarkTheirs(ctx, c.x, c.y, c.r, time);
      drawMarkWait(ctx, c.x, c.y, c.r, time);
    }
    const verdict = v.at(mark);
    if (verdict !== null) drawVerdictRing(ctx, c.x, c.y, c.r, verdict, fade);
  });
  ctx.globalAlpha = before;
}
