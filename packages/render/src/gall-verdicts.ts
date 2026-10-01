import {
  type GallState,
  gallPointAsks,
  gallRootAsks,
  type SimConfig,
  type SimEvent,
} from "@neon-spore/sim";
import { gallPointCircle, gallRootCircle } from "./gall-grip.js";
import { drawVerdictRing, GripVerdicts } from "./grip-verdict.js";
import { type Circle, type Layout, seatOf } from "./layout.js";
import { drawMarkHalo, drawMarkTheirs, drawMarkWait } from "./mark-feedback.js";

/**
 * **THE GALL's marks answering a touch the way every mark does**
 * (`mark-feedback.ts`, `grip-verdict.ts`; the owner, 27 September 2026: *the
 * consistent visual across all waves*). Both screens draw the whole seam and
 * the gall where it sits (`gall-draw.ts`), so this is THE VISE's arrangement
 * on a body that moves: geometry says whose the pinch is.
 *
 * Two marks, the places a thumb answers it (`gall-grip.ts`). **The point**
 * the gall sits on asks a close of the seat whose half it is on
 * (`gallPointAsks`): the halo on that seat's screen, and the partner's ring
 * and clock on the other's, so when the gall jumps across the middle the
 * halo goes over to the other screen with it. **The root** asks for a shot
 * on a fire step with the root bared (`gallRootAsks`); that is either
 * seat's, and wears the halo on both screens and nobody's clock.
 *
 * The verdicts are the seam's own words: a close landed greens the point and
 * a hit greens the root. A pinch let slip and a close run out — the gall
 * swelling back where it was — redden the point, and a shot run out reddens
 * the root. A pinch come shut is only a part of a close, so it says nothing.
 * **Neither a pinch on bare seam nor a wrong colour is refused red**: the
 * simulation says nothing of either (`sim/gall-hand.ts`, `sim/gall-shot.ts`).
 *
 * Held in `GallFx` (`gall-fx.ts`), as THE CAPSTAN's are in its own.
 * Everything here is in canvas pixels, where the gall stands this frame.
 */
export const GALL_POINT_MARK = 0;
export const GALL_ROOT_MARK = 1;

/** Each word of the seam's that answers or lapses: the mark it greens or reddens. */
const SAYS: Readonly<Record<string, { mark: number; right: boolean }>> = {
  gallClose: { mark: GALL_POINT_MARK, right: true },
  gallHit: { mark: GALL_ROOT_MARK, right: true },
  gallSlip: { mark: GALL_POINT_MARK, right: false },
  gallSwell: { mark: GALL_POINT_MARK, right: false },
  gallMiss: { mark: GALL_ROOT_MARK, right: false },
};

export class GallVerdicts {
  /** Was the last touch on each mark right. */
  readonly verdicts = new GripVerdicts();

  ingest(events: readonly SimEvent[]): void {
    for (const e of events) {
      const said = SAYS[e.type];
      if (said !== undefined) this.verdicts.mark(said.mark, said.right);
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
function asked(l: Layout, s: GallState, mark: number): "own" | "theirs" | null {
  if (mark === GALL_ROOT_MARK) return gallRootAsks(s) ? "own" : null;
  const asks = (side: 0 | 1) => gallPointAsks(s, side);
  if (l.role === "test") return asks(0) || asks(1) ? "own" : null;
  const side = seatOf(l.role) === 1 ? 0 : 1;
  if (asks(side)) return "own";
  return asks(side === 0 ? 1 : 0) ? "theirs" : null;
}

/**
 * Over the seam, at `fade`: the halo on each mark that asks this screen, the
 * partner's ring and clock on each that asks only them, and every verdict
 * still showing.
 */
export function drawGallMarkFeedback(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  cfg: SimConfig,
  s: GallState,
  time: number,
  fade: number,
  v: GripVerdicts,
): void {
  const marks: Circle[] = [gallPointCircle(l, cfg, s.point), gallRootCircle(l, cfg)];
  const before = ctx.globalAlpha;
  marks.forEach((c, mark) => {
    ctx.globalAlpha = fade;
    const says = asked(l, s, mark);
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
