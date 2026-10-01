import {
  type CapstanState,
  capstanCoreAsks,
  capstanRubAsks,
  capstanSteerAsks,
  type SimConfig,
  type SimEvent,
} from "@neon-spore/sim";
import { capstanCoreStanding, capstanRubStanding, capstanSteerStanding } from "./capstan-grip.js";
import { drawVerdictRing, GripVerdicts } from "./grip-verdict.js";
import { type Circle, type Layout, seatOf } from "./layout.js";
import { drawMarkHalo, drawMarkTheirs, drawMarkWait } from "./mark-feedback.js";

/**
 * **THE CAPSTAN's marks answering a touch the way every mark does**
 * (`mark-feedback.ts`, `grip-verdict.ts`; the owner, 27 September 2026: *the
 * consistent visual across all waves*). Both screens draw the one drum
 * (`capstan-draw.ts`), so this is THE DAVIT's arrangement again: one seat
 * steers and the other works the thing the steer brings round.
 *
 * Three marks, the places a thumb answers it (`capstan-grip.ts`). **The
 * middle** is the steer: it asks the lit band's own seat on a left or a right
 * (`capstanSteerAsks`), and on a hold both seats until one pulls past the
 * mark, and then only that one. **The end** a thumb is wanted on is the rub:
 * it asks the seat not steering, once one steers (`capstanRubAsks`). Each
 * wears the halo on its own seat's screen and the partner's ring and clock on
 * the other's, so on a left or a right both screens wait on something. **The
 * core** asks for a shot on a fire step with the core bared
 * (`capstanCoreAsks`); that is either seat's, and wears the halo on both
 * screens and nobody's clock.
 *
 * The verdicts are the drum's own words: a band worn bright or a hold kept
 * greens the steer and the rub, and a hit greens the core. A window run out —
 * a stall, or a hold the cover came down on — reddens both, and a shot run
 * out reddens the core. A reversal worn in is only a part of a step and a
 * drift is a pause, so neither says anything. **Neither a wrong seat's touch
 * nor a wrong colour is refused red**: the simulation says nothing of either
 * (`sim/capstan-hand.ts`, `sim/capstan-shot.ts`).
 *
 * Held in `CapstanFx` (`capstan-fx.ts`), as THE GRINDSTONE's are in its own.
 * Everything here is in canvas pixels, where the drum stands this frame.
 */
export const CAPSTAN_STEER_MARK = 0;
export const CAPSTAN_RUB_MARK = 1;
export const CAPSTAN_CORE_MARK = 2;

const WORK = [CAPSTAN_STEER_MARK, CAPSTAN_RUB_MARK] as const;

/** Each word of the drum's that answers or lapses: the marks it greens or reddens. */
const SAYS: Readonly<Record<string, { marks: readonly number[]; right: boolean }>> = {
  capstanBright: { marks: WORK, right: true },
  capstanKept: { marks: WORK, right: true },
  capstanHit: { marks: [CAPSTAN_CORE_MARK], right: true },
  capstanStall: { marks: WORK, right: false },
  capstanCover: { marks: WORK, right: false },
  capstanMiss: { marks: [CAPSTAN_CORE_MARK], right: false },
};

export class CapstanVerdicts {
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
function asked(l: Layout, cfg: SimConfig, s: CapstanState, mark: number): "own" | "theirs" | null {
  if (mark === CAPSTAN_CORE_MARK) return capstanCoreAsks(s) ? "own" : null;
  const asks = (side: 0 | 1) =>
    mark === CAPSTAN_STEER_MARK
      ? capstanSteerAsks({ cfg }, s, side)
      : capstanRubAsks({ cfg }, s, side);
  if (l.role === "test") return asks(0) || asks(1) ? "own" : null;
  const side = seatOf(l.role) === 1 ? 0 : 1;
  if (asks(side)) return "own";
  return asks(side === 0 ? 1 : 0) ? "theirs" : null;
}

/**
 * Over the drum, at `fade`: the halo on each mark that asks this screen, the
 * partner's ring and clock on each that asks only them, and every verdict
 * still showing.
 */
export function drawCapstanMarkFeedback(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  cfg: SimConfig,
  s: CapstanState,
  beat: number,
  beatPhase: number,
  time: number,
  fade: number,
  v: GripVerdicts,
): void {
  const marks: Circle[] = [
    capstanSteerStanding(l, cfg, s, beat, beatPhase),
    capstanRubStanding(l, cfg, s, beat, beatPhase),
    capstanCoreStanding(l, cfg, s, beat, beatPhase),
  ];
  const before = ctx.globalAlpha;
  marks.forEach((c, mark) => {
    ctx.globalAlpha = fade;
    const says = asked(l, cfg, s, mark);
    if (says === "own") drawMarkHalo(ctx, c.x, c.y, c.r, time);
    ctx.globalAlpha = fade;
    if (says === "theirs") {
      drawMarkTheirs(ctx, c.x, c.y, c.r, time);
      drawMarkWait(ctx, c.x, c.y, c.r, time);
    }
    const verdict = v.at(mark);
    if (verdict !== null) drawVerdictRing(ctx, c.x, c.y, c.r, verdict);
  });
  ctx.globalAlpha = before;
}
