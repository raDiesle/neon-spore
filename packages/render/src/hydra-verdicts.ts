import { type HydraState, hydraLitStep, type SimConfig, type SimEvent } from "@neon-spore/sim";
import { drawVerdictRing, GripVerdicts } from "./grip-verdict.js";
import {
  HYDRA_MARKS,
  type HydraMark,
  hydraMarkAsks,
  hydraMarkAt,
  hydraMarkPlayer,
} from "./hydra-grip.js";
import { type Layout, seatOf } from "./layout.js";
import { drawMarkHalo, drawMarkTheirs, drawMarkWait } from "./mark-feedback.js";

/**
 * **THE HYDRA's marks answering a touch the way every mark does**
 * (`mark-feedback.ts`, `grip-verdict.ts`) — THE CHRYSALIS's case, because
 * both screens draw the one hydra but for its maws (`hydra-draw.ts`). The
 * knobs are `hydra-handles.ts`; this is what they say back.
 *
 * **Each mark asks while its kind of head is lit**, of the seat whose side it
 * is — an eye only while it is open. The one that asks this screen's seat
 * wears the halo; the partner's wears their ring and waiting clock.
 *
 * The verdicts are the hydra's own words: a neck cut, a coil turned off or
 * an eye put out greens its side's mark; a neck let go short or a tap on a
 * shut eye reddens it; and a thumb on the partner's mark reddens that mark.
 */
export class HydraVerdicts {
  /** Was the last touch on each mark right: the necks a side, the coils, the eyes. */
  readonly verdicts = new GripVerdicts();
  /** The pair of marks the lit level's heads are, which `hydraWrong` does not carry. */
  private kind = 0;

  /** The drawer's word for which kind of head is lit. */
  note(s: HydraState): void {
    const head = hydraLitStep(s)?.head;
    this.kind = head === "coil" ? 1 : head === "eye" ? 2 : 0;
  }

  ingest(events: readonly SimEvent[]): void {
    for (const e of events) {
      if (e.type === "hydraCut") this.verdicts.mark(e.seat, true);
      else if (e.type === "hydraGlance") this.verdicts.mark(e.seat, false);
      else if (e.type === "hydraUncoil") this.verdicts.mark(2 + e.seat, true);
      else if (e.type === "hydraPoke") this.verdicts.mark(4 + e.seat, true);
      else if (e.type === "hydraMiss") this.verdicts.mark(4 + e.seat, false);
      else if (e.type === "hydraWrong") this.verdicts.mark(this.kind * 2 + (1 - e.seat), false);
    }
  }

  update(dt: number): void {
    this.verdicts.update(dt);
  }

  clear(): void {
    this.kind = 0;
    this.verdicts.clear();
  }
}

/** What `mark` asks of this screen: `own` for the halo, `theirs` for the partner's ring and clock. */
function asked(l: Layout, s: HydraState, mark: HydraMark): "own" | "theirs" | null {
  if (!hydraMarkAsks(s, mark)) return null;
  if (l.role === "test") return "own";
  return hydraMarkPlayer(mark) === seatOf(l.role) ? "own" : "theirs";
}

/** The halos under the marks this screen's seat is asked for, drawn before them. */
export function drawHydraHalos(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  cfg: SimConfig,
  s: HydraState,
  time: number,
): void {
  const fade = ctx.globalAlpha;
  for (const mark of HYDRA_MARKS) {
    if (asked(l, s, mark) !== "own") continue;
    const c = hydraMarkAt(l, cfg, s, mark);
    drawMarkHalo(ctx, c.x, c.y, c.r, time);
    ctx.globalAlpha = fade;
  }
}

/** Over everything: the partner's ring and clock on their mark, and the verdicts. */
export function drawHydraVerdicts(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  cfg: SimConfig,
  s: HydraState,
  time: number,
  v: GripVerdicts,
): void {
  const fade = ctx.globalAlpha;
  for (const mark of HYDRA_MARKS) {
    const c = hydraMarkAt(l, cfg, s, mark);
    if (asked(l, s, mark) === "theirs") {
      drawMarkTheirs(ctx, c.x, c.y, c.r, time);
      drawMarkWait(ctx, c.x, c.y, c.r, time);
    }
    const verdict = v.at(mark);
    if (verdict !== null) drawVerdictRing(ctx, c.x, c.y, c.r, verdict);
    ctx.globalAlpha = fade;
  }
}
