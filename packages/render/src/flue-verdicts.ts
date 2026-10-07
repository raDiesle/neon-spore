import type { FlueState, SimEvent, World } from "@neon-spore/sim";
import { drawFlueGlassVerdict } from "./flue-glass.js";
import { flueSpent } from "./flue-pose.js";
import { flueSightAt } from "./flue-shape.js";
import { GripVerdicts } from "./grip-verdict.js";
import type { Layout } from "./layout.js";

/**
 * **THE FLUE's mark answering a shot the way every mark does**
 * (`mark-feedback.ts`, `grip-verdict.ts`; the owner, 27 September 2026: *the
 * consistent visual across all waves*).
 *
 * One mark: **the sight** over the held cannon, the glass where the ember
 * must be met (`flue-glass.ts`). A hit greens it and a shot spent reddens
 * it, on both screens alike — the green and red outlines the owner asked to
 * be able to see, 5 October 2026.
 *
 * Held in `FlueFx` (`flue-fx.ts`). Everything here is in canvas pixels.
 */
export const FLUE_SIGHT_MARK = 0;

/** Each word of the flue's that answers: green for a hit, red for a shot spent. */
const SAYS: Readonly<Record<string, boolean>> = { flueHit: true, flueMiss: false };

export class FlueVerdicts {
  /** Was the last shot at the sight right. */
  readonly verdicts = new GripVerdicts();

  ingest(events: readonly SimEvent[]): void {
    for (const e of events) {
      const right = SAYS[e.type];
      if (right !== undefined) this.verdicts.mark(FLUE_SIGHT_MARK, right);
    }
  }

  update(dt: number): void {
    this.verdicts.update(dt);
  }

  clear(): void {
    this.verdicts.clear();
  }
}

/**
 * Over the flue, fading as it is spent: the verdict on the glass while it
 * still shows. The halo, the partner's ring and its clock stood round the
 * sight here until 7 October 2026, when the sight became glass and the owner
 * asked for the field around it cleared: the siren says whose turn it is.
 */
export function drawFlueMarkFeedback(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  s: FlueState,
  beat: number,
  beatPhase: number,
  fx: FlueVerdicts,
): void {
  const verdict = fx.verdicts.at(FLUE_SIGHT_MARK);
  if (verdict === null) return;
  const fade = 1 - flueSpent(s, world.cfg, beat, beatPhase);
  drawFlueGlassVerdict(ctx, l, flueSightAt(l, world.cfg), verdict, fade);
}
