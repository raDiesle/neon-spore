import { type BastionState, bastionLitStep, type SimConfig, type SimEvent } from "@neon-spore/sim";
import {
  type BastionMark,
  bastionMarkAt,
  bastionMarkPlayer,
  bastionMarkTakes,
} from "./bastion-grip.js";
import { drawVerdictRing, GripVerdicts } from "./grip-verdict.js";
import { type Layout, seatOf } from "./layout.js";
import { drawMarkHalo, drawMarkTheirs, drawMarkWait } from "./mark-feedback.js";

/**
 * **THE BASTION's knobs answering a touch the way every mark does**
 * (`mark-feedback.ts`, `grip-verdict.ts`) — THE LATCH's case, because both
 * screens draw the one moon (`bastion-draw.ts`). The knobs themselves are
 * `bastion-handles.ts`; this is what they say back.
 *
 * **Each knob asks while its shell is lit**: a slab's of the seat whose side
 * it is, the rim the pilot's. The one that asks this screen's seat wears the
 * halo; the partner's wears their ring and waiting clock.
 *
 * The verdicts are the moon's own words: a slab torn greens its side's knob,
 * a slab snapped back reddens it; a gun shot at the front greens the rim
 * that turned it there; and a thumb on the partner's knob reddens that knob
 * — the rim, on the ring, or the far side's slab.
 */
export class BastionVerdicts {
  /** Was the last touch on each knob right: the pilot's slabs, the navigator's, the rim. */
  readonly verdicts = new GripVerdicts();
  private onRing = false;

  /** The drawer's word for which shell is lit, which `bastionWrong` does not carry. */
  note(s: BastionState): void {
    this.onRing = bastionLitStep(s)?.layer === "ring";
  }

  ingest(events: readonly SimEvent[]): void {
    for (const e of events) {
      if (e.type === "bastionTear") this.verdicts.mark(e.seat, true);
      else if (e.type === "bastionSnap") this.verdicts.mark(e.seat, false);
      else if (e.type === "bastionGun") this.verdicts.mark(2, true);
      else if (e.type === "bastionWrong") this.verdicts.mark(this.onRing ? 2 : 1 - e.seat, false);
    }
  }

  update(dt: number): void {
    this.verdicts.update(dt);
  }

  clear(): void {
    this.onRing = false;
    this.verdicts.clear();
  }
}

const MARKS = [0, 1, 2] as const;

/** What `mark` asks of this screen: `own` for the halo, `theirs` for the partner's ring and clock. */
function asked(l: Layout, s: BastionState, mark: BastionMark): "own" | "theirs" | null {
  if (!bastionMarkTakes(s, mark)) return null;
  if (l.role === "test") return "own";
  return bastionMarkPlayer(mark) === seatOf(l.role) ? "own" : "theirs";
}

/** The halos under the knobs this screen's seat is asked for, drawn before them. */
export function drawBastionHalos(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  cfg: SimConfig,
  s: BastionState,
  time: number,
): void {
  const fade = ctx.globalAlpha;
  for (const mark of MARKS) {
    if (asked(l, s, mark) !== "own") continue;
    const c = bastionMarkAt(l, cfg, s, mark);
    drawMarkHalo(ctx, c.x, c.y, c.r, time);
    ctx.globalAlpha = fade;
  }
}

/** Over everything: the partner's ring and clock on their knob, and the verdicts. */
export function drawBastionVerdicts(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  cfg: SimConfig,
  s: BastionState,
  time: number,
  v: GripVerdicts,
): void {
  const fade = ctx.globalAlpha;
  for (const mark of MARKS) {
    const c = bastionMarkAt(l, cfg, s, mark);
    if (asked(l, s, mark) === "theirs") {
      drawMarkTheirs(ctx, c.x, c.y, c.r, time);
      drawMarkWait(ctx, c.x, c.y, c.r, time);
    }
    const verdict = v.at(mark);
    if (verdict !== null) drawVerdictRing(ctx, c.x, c.y, c.r, verdict);
    ctx.globalAlpha = fade;
  }
}
