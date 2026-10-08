import {
  type LatchGrip,
  type LatchState,
  latchLitStep,
  type SimConfig,
  type SimEvent,
} from "@neon-spore/sim";
import { drawVerdictRing, GripVerdicts } from "./grip-verdict.js";
import { latchGripPlayer } from "./latch-grip.js";
import { latchKnobAt } from "./latch-shape.js";
import { type Layout, seatOf } from "./layout.js";
import { drawMarkHalo, drawMarkTheirs, drawMarkWait } from "./mark-feedback.js";

/**
 * **THE LATCH's grips answering a touch the way every mark does**
 * (`mark-feedback.ts`, `grip-verdict.ts`) — THE SINEW's case, because both
 * screens draw the one colony (`latch-draw.ts`). The grips themselves are
 * `latch-handles.ts`; this is what they say back.
 *
 * **Both grips ask while a level is lit** — one to pull, one to hold — each
 * of the seat whose it is (`latchGripSeat`). A grip that asks this screen's
 * seat wears the halo; the partner's wears their ring and waiting clock.
 *
 * The verdicts are the rope's own words: a thumb taking hold greens its grip,
 * a pull let go that passes the turn greens the grip that pulled, a yank held
 * greens both; a thumb on the partner's grip reddens that grip, and a slip
 * reddens both — it took two hands to let it go.
 */
export class LatchVerdicts {
  /** Was the last touch on each grip right: keyed by the grip. */
  readonly verdicts = new GripVerdicts();

  ingest(events: readonly SimEvent[]): void {
    for (const e of events) {
      if (e.type === "latchGrip") this.verdicts.mark(e.grip, true);
      else if (e.type === "latchTurn") this.verdicts.mark(other(e.grip), true);
      else if (e.type === "latchWrong") this.verdicts.mark(e.grip, false);
      else if (e.type === "latchBraced") this.both(true);
      else if (e.type === "latchSlip") this.both(false);
    }
  }

  private both(good: boolean): void {
    this.verdicts.mark(0, good);
    this.verdicts.mark(1, good);
  }

  update(dt: number): void {
    this.verdicts.update(dt);
  }

  clear(): void {
    this.verdicts.clear();
  }
}

function other(grip: LatchGrip): LatchGrip {
  return grip === 0 ? 1 : 0;
}

/** What `grip` asks of this screen: `own` for the halo, `theirs` for the partner's ring and clock. */
function asked(l: Layout, s: LatchState, grip: LatchGrip): "own" | "theirs" | null {
  if (latchLitStep(s) === null) return null;
  if (l.role === "test") return "own";
  return latchGripPlayer(s, grip) === seatOf(l.role) ? "own" : "theirs";
}

const GRIPS = [0, 1] as const;

/** The halos under the grips this screen's seat is asked for, drawn before them. */
export function drawLatchHalos(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  cfg: SimConfig,
  s: LatchState,
  time: number,
): void {
  const fade = ctx.globalAlpha;
  for (const grip of GRIPS) {
    if (asked(l, s, grip) !== "own") continue;
    const c = latchKnobAt(l, cfg, s, grip);
    drawMarkHalo(ctx, c.x, c.y, c.r, time);
    ctx.globalAlpha = fade;
  }
}

/** Over everything: the partner's ring and clock on their grip, and the verdicts. */
export function drawLatchVerdicts(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  cfg: SimConfig,
  s: LatchState,
  time: number,
  v: GripVerdicts,
): void {
  const fade = ctx.globalAlpha;
  for (const grip of GRIPS) {
    const c = latchKnobAt(l, cfg, s, grip);
    if (asked(l, s, grip) === "theirs") {
      drawMarkTheirs(ctx, c.x, c.y, c.r, time);
      drawMarkWait(ctx, c.x, c.y, c.r, time);
    }
    const verdict = v.at(grip);
    if (verdict !== null) drawVerdictRing(ctx, c.x, c.y, c.r, verdict);
    ctx.globalAlpha = fade;
  }
}
