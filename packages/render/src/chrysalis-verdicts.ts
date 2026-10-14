import {
  type ChrysalisState,
  chrysalisLitStep,
  type SimConfig,
  type SimEvent,
} from "@neon-spore/sim";
import {
  CHRYSALIS_MARKS,
  type ChrysalisMark,
  chrysalisMarkAt,
  chrysalisMarkPlayer,
  chrysalisMarkTakes,
} from "./chrysalis-grip.js";
import { drawVerdictRing, GripVerdicts } from "./grip-verdict.js";
import { type Layout, seatOf } from "./layout.js";
import { drawMarkHalo, drawMarkTheirs, drawMarkWait } from "./mark-feedback.js";

/**
 * **THE CHRYSALIS's marks answering a touch the way every mark does**
 * (`mark-feedback.ts`, `grip-verdict.ts`) — THE BASTION's case, because both
 * screens draw the one cocoon (`chrysalis-draw.ts`). The knobs are
 * `chrysalis-handles.ts`, the rubs their cues' drops; this is what they say
 * back.
 *
 * **Each mark asks while its skin is lit**, of the seat whose side it is. The
 * one that asks this screen's seat wears the halo; the partner's wears their
 * ring and waiting clock.
 *
 * The verdicts are the cocoon's own words: a quill ripped greens its side's
 * knob and one snapped back reddens it; a half wiped clear greens that half;
 * and a thumb on the partner's mark reddens that mark — the far half on the
 * slime, the far knob on the quills.
 */
export class ChrysalisVerdicts {
  /** Was the last touch on each mark right: the quills a side, then the halves. */
  readonly verdicts = new GripVerdicts();
  private onSlime = false;

  /** The drawer's word for which skin is lit, which `chrysalisWrong` does not carry. */
  note(s: ChrysalisState): void {
    this.onSlime = chrysalisLitStep(s)?.skin === "slime";
  }

  ingest(events: readonly SimEvent[]): void {
    for (const e of events) {
      if (e.type === "chrysalisRip") this.verdicts.mark(e.seat, true);
      else if (e.type === "chrysalisSnap") this.verdicts.mark(e.seat, false);
      else if (e.type === "chrysalisWipe") this.verdicts.mark(2 + e.seat, true);
      else if (e.type === "chrysalisWrong") {
        this.verdicts.mark((this.onSlime ? 2 : 0) + (1 - e.seat), false);
      }
    }
  }

  update(dt: number): void {
    this.verdicts.update(dt);
  }

  clear(): void {
    this.onSlime = false;
    this.verdicts.clear();
  }
}

/** What `mark` asks of this screen: `own` for the halo, `theirs` for the partner's ring and clock. */
function asked(l: Layout, s: ChrysalisState, mark: ChrysalisMark): "own" | "theirs" | null {
  if (!chrysalisMarkTakes(s, mark)) return null;
  if (l.role === "test") return "own";
  return chrysalisMarkPlayer(mark) === seatOf(l.role) ? "own" : "theirs";
}

/** The halos under the marks this screen's seat is asked for, drawn before them. */
export function drawChrysalisHalos(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  cfg: SimConfig,
  s: ChrysalisState,
  time: number,
): void {
  const fade = ctx.globalAlpha;
  for (const mark of CHRYSALIS_MARKS) {
    if (asked(l, s, mark) !== "own") continue;
    const c = chrysalisMarkAt(l, cfg, s, mark);
    drawMarkHalo(ctx, c.x, c.y, c.r, time);
    ctx.globalAlpha = fade;
  }
}

/** Over everything: the partner's ring and clock on their mark, and the verdicts. */
export function drawChrysalisVerdicts(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  cfg: SimConfig,
  s: ChrysalisState,
  time: number,
  v: GripVerdicts,
): void {
  const fade = ctx.globalAlpha;
  for (const mark of CHRYSALIS_MARKS) {
    const c = chrysalisMarkAt(l, cfg, s, mark);
    if (asked(l, s, mark) === "theirs") {
      drawMarkTheirs(ctx, c.x, c.y, c.r, time);
      drawMarkWait(ctx, c.x, c.y, c.r, time);
    }
    const verdict = v.at(mark);
    if (verdict !== null) drawVerdictRing(ctx, c.x, c.y, c.r, verdict);
    ctx.globalAlpha = fade;
  }
}
