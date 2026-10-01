import {
  type BurgeeState,
  burgeeAims,
  burgeeFreezeAsks,
  burgeeLitStep,
  burgeeSpindleAsks,
  type SimConfig,
  type SimEvent,
} from "@neon-spore/sim";
import { burgeeMarks } from "./burgee-marks.js";
import { burgeeSpindleAt, burgeeSpindleTall } from "./burgee-shape.js";
import { drawVerdictRing, GripVerdicts } from "./grip-verdict.js";
import { type Circle, type Layout, seatOf } from "./layout.js";
import { drawMarkHalo, drawMarkTheirs, drawMarkWait } from "./mark-feedback.js";

/**
 * **THE BURGEE's marks answering a touch the way every mark does**
 * (`mark-feedback.ts`, `grip-verdict.ts`; the owner, 27 September 2026: *the
 * consistent visual across all waves*). Both screens draw the one flag
 * (`burgee-draw.ts`), so this is THE CAPSTAN's arrangement again: one seat
 * stills the thing and the other works it.
 *
 * Three marks, the places a thumb or a bolt answers it (`burgee-grip.ts`).
 * **The freeze ring** asks the lit catch's freezer, until the flag is still
 * (`burgeeFreezeAsks`); **the draw's track** asks the other seat
 * (`burgeeAims`). Each wears the halo on its own seat's screen and the
 * partner's ring and clock on the other's. On a recatch either seat may
 * freeze, so both marks ask both seats until one taps, and then the track
 * asks only the other. **The spindle** asks for a shot on a fire step with it
 * lit (`burgeeSpindleAsks`); that is either seat's, and wears the halo on
 * both screens and nobody's clock.
 *
 * The verdicts are the flag's own words: a freeze on the mark greens the ring
 * and a tap off it reddens it; a freeze run out before the draw came reddens
 * the track, and so does a lift that caught nothing; a catch or a recatch
 * greens both, and a window run out — a sway, or a recatch dimming the
 * spindle — reddens both. A hit greens the spindle and a shot run out reddens
 * it. **A wrong colour is not refused red**: the simulation says nothing of
 * it (`sim/burgee-shot.ts`).
 *
 * Between steps the ring and the track stand where the last lit catch put
 * them — `burgeeLight`'s offset, remembered here — so a verdict landing as
 * the step closes is drawn where the thumb was. Held in `BurgeeFx`
 * (`burgee-fx.ts`). Everything here is in canvas pixels.
 */
export const BURGEE_FREEZE_MARK = 0;
export const BURGEE_DRAW_MARK = 1;
export const BURGEE_SPINDLE_MARK = 2;

const CATCH = [BURGEE_FREEZE_MARK, BURGEE_DRAW_MARK] as const;

/** Each word of the flag's that answers or lapses: the marks it greens or reddens. */
const SAYS: Readonly<Record<string, { marks: readonly number[]; right: boolean }>> = {
  burgeeFreeze: { marks: [BURGEE_FREEZE_MARK], right: true },
  burgeeFlap: { marks: [BURGEE_FREEZE_MARK], right: false },
  burgeeLapse: { marks: [BURGEE_DRAW_MARK], right: false },
  burgeeFlutter: { marks: [BURGEE_DRAW_MARK], right: false },
  burgeeCatch: { marks: CATCH, right: true },
  burgeeRecatch: { marks: CATCH, right: true },
  burgeeSway: { marks: CATCH, right: false },
  burgeeDim: { marks: CATCH, right: false },
  burgeeHit: { marks: [BURGEE_SPINDLE_MARK], right: true },
  burgeeMiss: { marks: [BURGEE_SPINDLE_MARK], right: false },
};

export class BurgeeVerdicts {
  /** Was the last touch on each mark right. */
  readonly verdicts = new GripVerdicts();
  /** The last lit catch's offset, where its ring and track stood; null before one. */
  offset: number | null = null;

  ingest(events: readonly SimEvent[]): void {
    for (const e of events) {
      if (e.type === "burgeeLight" && e.ask !== "fire") this.offset = e.offset;
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
    this.offset = null;
  }
}

/** What a mark asks of this screen: `own` for the halo, `theirs` for the partner's ring and clock. */
function asked(l: Layout, s: BurgeeState, mark: number): "own" | "theirs" | null {
  if (mark === BURGEE_SPINDLE_MARK) return burgeeSpindleAsks(s) ? "own" : null;
  const asks = (side: 0 | 1) =>
    mark === BURGEE_FREEZE_MARK ? burgeeFreezeAsks(s, side) : burgeeAims(s, side);
  if (l.role === "test") return asks(0) || asks(1) ? "own" : null;
  const side = seatOf(l.role) === 1 ? 0 : 1;
  if (asks(side)) return "own";
  return asks(side === 0 ? 1 : 0) ? "theirs" : null;
}

/** Where the ring and the track stand: the lit catch's, else the last one's, else the next one's. */
function catchOffset(s: BurgeeState, remembered: number | null): number | null {
  const lit = burgeeLitStep(s);
  if (lit !== null) return lit.ask === "fire" ? remembered : lit.offset;
  if (remembered !== null) return remembered;
  const next = s.steps[s.cursor];
  return next === undefined || next.ask === "fire" ? null : next.offset;
}

/**
 * Over the flag, at `fade`: the halo on each mark that asks this screen, the
 * partner's ring and clock on each that asks only them, and every verdict
 * still showing.
 */
export function drawBurgeeMarkFeedback(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  cfg: SimConfig,
  s: BurgeeState,
  time: number,
  fade: number,
  v: BurgeeVerdicts,
): void {
  const offset = catchOffset(s, v.offset);
  const marks: (Circle | null)[] = [null, null];
  if (offset !== null) {
    const { ring, from } = burgeeMarks(l, cfg, { offset });
    marks[BURGEE_FREEZE_MARK] = ring;
    marks[BURGEE_DRAW_MARK] = { x: from.x, y: from.y, r: ring.r };
  }
  const spindle = burgeeSpindleAt(l, cfg);
  marks[BURGEE_SPINDLE_MARK] = { x: spindle.x, y: spindle.y, r: burgeeSpindleTall(l) };
  const before = ctx.globalAlpha;
  marks.forEach((c, mark) => {
    if (c === null) return;
    ctx.globalAlpha = fade;
    const says = asked(l, s, mark);
    if (says === "own") drawMarkHalo(ctx, c.x, c.y, c.r, time);
    ctx.globalAlpha = fade;
    if (says === "theirs") {
      drawMarkTheirs(ctx, c.x, c.y, c.r, time);
      drawMarkWait(ctx, c.x, c.y, c.r, time);
    }
    const verdict = v.verdicts.at(mark);
    if (verdict !== null) drawVerdictRing(ctx, c.x, c.y, c.r, verdict);
  });
  ctx.globalAlpha = before;
}
