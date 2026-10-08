import {
  type GallState,
  gallPointAsks,
  gallShotAsks,
  type SimConfig,
  type SimEvent,
} from "@neon-spore/sim";
import { gallPointCircle } from "./gall-grip.js";
import { drawVerdictRing, GripVerdicts } from "./grip-verdict.js";
import { type Layout, seatOf } from "./layout.js";
import { drawMarkHalo, drawMarkTheirs, drawMarkWait } from "./mark-feedback.js";

/**
 * **THE GALL's mark answering a touch the way every mark does**
 * (`mark-feedback.ts`, `grip-verdict.ts`; the owner, 27 September 2026: *the
 * consistent visual across all waves*). Both screens draw the alien where it
 * sits (`gall-draw.ts`), so this is THE VISE's arrangement on a body that
 * moves: geometry says whose the hand is.
 *
 * One mark, the alien's point (`gall-grip.ts`). A leap step asks the seat
 * whose half it is on (`gallPointAsks`): the halo on that seat's screen, and
 * the partner's ring and clock on the other's, so when it leaps across the
 * middle the halo goes over to the other screen with it. A fire step asks
 * either seat, and wears the halo on both screens and nobody's clock.
 *
 * The verdicts: a leap thrown and a hit green it; a refused hand and a step
 * run out redden it. A tap is only a part of a leap, so it says nothing.
 *
 * Held in `GallFx` (`gall-fx.ts`), as THE CAPSTAN's are in its own.
 * Everything here is in canvas pixels, where the alien stands this frame.
 */
export const GALL_POINT_MARK = 0;

/** Each word of the alien's that answers or lapses: right or wrong. */
const SAYS: Readonly<Record<string, boolean>> = {
  gallLeap: true,
  gallHit: true,
  gallWhiff: false,
  gallMiss: false,
};

export class GallVerdicts {
  /** Was the last touch on each mark right. */
  readonly verdicts = new GripVerdicts();

  ingest(events: readonly SimEvent[]): void {
    for (const e of events) {
      const right = SAYS[e.type];
      if (right !== undefined) this.verdicts.mark(GALL_POINT_MARK, right);
    }
  }

  update(dt: number): void {
    this.verdicts.update(dt);
  }

  clear(): void {
    this.verdicts.clear();
  }
}

/** What the mark asks of this screen: `own` for the halo, `theirs` for the partner's ring and clock. */
function asked(l: Layout, s: GallState): "own" | "theirs" | null {
  if (gallShotAsks(s)) return "own";
  const asks = (side: 0 | 1) => gallPointAsks(s, side);
  if (l.role === "test") return asks(0) || asks(1) ? "own" : null;
  const side = seatOf(l.role) === 1 ? 0 : 1;
  if (asks(side)) return "own";
  return asks(side === 0 ? 1 : 0) ? "theirs" : null;
}

/**
 * Over the seam, at `fade`: the halo on the mark if it asks this screen, the
 * partner's ring and clock if it asks only them, and its verdict while it
 * still shows. Nothing while the alien is in the air.
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
  if (s.phase === "leap") return;
  const c = gallPointCircle(l, cfg, s.point);
  const before = ctx.globalAlpha;
  ctx.globalAlpha = fade;
  const says = asked(l, s);
  if (says === "own") drawMarkHalo(ctx, c.x, c.y, c.r, time);
  ctx.globalAlpha = fade;
  if (says === "theirs") {
    drawMarkTheirs(ctx, c.x, c.y, c.r, time);
    drawMarkWait(ctx, c.x, c.y, c.r, time);
  }
  const verdict = v.at(GALL_POINT_MARK);
  if (verdict !== null) drawVerdictRing(ctx, c.x, c.y, c.r, verdict);
  ctx.globalAlpha = before;
}
