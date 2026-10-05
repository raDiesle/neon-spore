import { type FlueState, flueLitLevel, type SimEvent, type World } from "@neon-spore/sim";
import { flueSpent } from "./flue-pose.js";
import { flueSightAt, flueSightR } from "./flue-shape.js";
import { drawVerdictRing, GripVerdicts } from "./grip-verdict.js";
import { type Layout, seatOf } from "./layout.js";
import { drawMarkHalo, drawMarkTheirs, drawMarkWait } from "./mark-feedback.js";

/**
 * **THE FLUE's mark answering a shot the way every mark does**
 * (`mark-feedback.ts`, `grip-verdict.ts`; the owner, 27 September 2026: *the
 * consistent visual across all waves*).
 *
 * One mark: **the sight** over the held cannon, where the ember must be met.
 * It asks the navigator, whose trigger it is, for as long as a level is lit:
 * the halo on the navigator's screen, and the partner's ring and clock on the
 * pilot's, whose part is to say when. A hit greens it and a shot spent
 * reddens it, on both screens alike — the green and red outlines the owner
 * asked to be able to see, 5 October 2026.
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

/** What the sight asks of this screen: `own` for the trigger's halo, `theirs` for the partner's ring and clock. */
function asked(l: Layout, s: FlueState): "own" | "theirs" | null {
  if (flueLitLevel(s) === null) return null;
  if (l.role === "test") return "own";
  return seatOf(l.role) === 2 ? "own" : "theirs";
}

/**
 * Over the flue, fading as it is spent: the halo on the sight while it asks
 * this screen, the partner's ring and clock while it asks only the other, and
 * the verdict still showing.
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
  const fade = 1 - flueSpent(s, world.cfg, beat, beatPhase);
  const at = flueSightAt(l, world.cfg);
  const r = flueSightR(l) * 1.35;
  const before = ctx.globalAlpha;
  ctx.globalAlpha = fade;
  const says = asked(l, s);
  if (says === "own") drawMarkHalo(ctx, at.x, at.y, r, time);
  ctx.globalAlpha = fade;
  if (says === "theirs") {
    drawMarkTheirs(ctx, at.x, at.y, r, time);
    drawMarkWait(ctx, at.x, at.y, r, time);
  }
  const verdict = fx.verdicts.at(FLUE_SIGHT_MARK);
  if (verdict !== null) drawVerdictRing(ctx, at.x, at.y, r, verdict, fade);
  ctx.globalAlpha = before;
}
