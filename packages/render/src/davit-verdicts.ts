import {
  type DavitState,
  davitLitStep,
  davitLooseAsks,
  davitPivotAsks,
  davitSteerAsks,
  davitSteering,
  type SimEvent,
} from "@neon-spore/sim";
import { GRIP_R_MUL, STEER_R } from "./davit-grip.js";
import { DAVIT_SAG, davitHook, davitHookRadius, davitTip } from "./davit-shape.js";
import { drawVerdictRing, GripVerdicts } from "./grip-verdict.js";
import { type Circle, type Layout, seatOf } from "./layout.js";
import { drawMarkHalo, drawMarkTheirs, drawMarkWait } from "./mark-feedback.js";
import { drawMarkHeld, drawMarkProgress, MARK_PROGRESS_R } from "./mark-progress.js";

/**
 * **THE DAVIT's marks answering a touch the way every mark does**
 * (`mark-feedback.ts`, `grip-verdict.ts`; the owner, 27 September 2026: *the
 * consistent visual across all waves*). Both screens draw the one boom
 * (`davit-draw.ts`), so this is THE CYST's arrangement again.
 *
 * Two marks, the two places a thumb answers it (`davit-grip.ts`). **The
 * boom** is the steer: it asks the seat whose steer the lit step wants
 * (`davitSteerAsks`). **The hook** is the loose: it asks the seat whose draw
 * the lit step wants (`davitLooseAsks`) — the halo on the owner's screen, the
 * partner's ring and clock on the other's. On a reland both seats may steer
 * and draw, and once one thumb holds the boom on its target the boom asks
 * only that seat and the hook only the other, so the seat steering sees its
 * partner's loose waited on. On a fire step with the pivot lit the hook asks
 * for a shot (`davitPivotAsks`); that is either seat's, and wears the halo on
 * both screens and nobody's clock.
 *
 * The verdicts are the boom's own words: a true loose — on a swing or a
 * reland — greens both marks, and a hit greens the hook. A steer that drifts
 * off its target reddens the boom, a draw lifted wrong reddens the hook, a
 * swing or a reland let run out reddens both, and a shot let run out the
 * hook. **Neither a wrong seat's touch nor a wrong colour is refused red**:
 * the simulation says nothing of either (`sim/davit-hand.ts`,
 * `sim/davit-shot.ts`).
 *
 * **The steer says it is right, and the draw how far** (the owner, 7 October
 * 2026, THE CAPSTAN's rule for every boss: `capstan-verdicts.ts`). Once a
 * thumb holds the boom on its target (`davitSteering`) the boom wears the
 * steady green ring of a part held where it is wanted, on both screens, and
 * the halo goes. **The draw's count rides the hook on both screens** — one
 * green segment a beat held steered, over a dim track of the step's `beats`
 * (`mark-progress.ts`) — so the seat holding the boom sees its partner still
 * drawing, and how far.
 *
 * Held in `LateRoster` (`effects-boss-roster-late.ts`). Everything here is in
 * the boom's frame, as the drawer has it: translated to the mast's foot.
 */
export const DAVIT_BOOM_MARK = 0;
export const DAVIT_HOOK_MARK = 1;

const BOTH = [DAVIT_BOOM_MARK, DAVIT_HOOK_MARK] as const;

/** Each word of the boom's that answers or lapses: the marks it greens or reddens. */
const SAYS: Readonly<Record<string, { marks: readonly number[]; right: boolean }>> = {
  davitLoose: { marks: BOTH, right: true },
  davitReland: { marks: BOTH, right: true },
  davitHit: { marks: [DAVIT_HOOK_MARK], right: true },
  davitDrift: { marks: [DAVIT_BOOM_MARK], right: false },
  davitSlack: { marks: [DAVIT_HOOK_MARK], right: false },
  davitSway: { marks: BOTH, right: false },
  davitDim: { marks: BOTH, right: false },
  davitMiss: { marks: [DAVIT_HOOK_MARK], right: false },
};

export class DavitVerdicts {
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

/** The boom round its middle, as wide as the steer's reach, and the hook as wide as the loose's. */
function marksAt(l: Layout, angle: number): Circle[] {
  const tip = davitTip(l, angle);
  const hook = davitHook(l, angle, DAVIT_SAG);
  return [
    { x: tip.x / 2, y: tip.y / 2, r: STEER_R * l.tile },
    { x: hook.x, y: hook.y, r: davitHookRadius(l) * GRIP_R_MUL },
  ];
}

/** What a mark asks of this screen: `own` for the halo, `theirs` for the partner's ring and clock. */
function asked(l: Layout, s: DavitState, mark: number): "own" | "theirs" | null {
  if (mark === DAVIT_HOOK_MARK && davitPivotAsks(s)) return "own";
  const asks = mark === DAVIT_BOOM_MARK ? davitSteerAsks : davitLooseAsks;
  if (l.role === "test") return asks(s, 0) || asks(s, 1) ? "own" : null;
  const side = seatOf(l.role) === 1 ? 0 : 1;
  if (asks(s, side)) return "own";
  return asks(s, side === 0 ? 1 : 0) ? "theirs" : null;
}

/**
 * Over the boom: the halo on each mark that asks this screen, the partner's
 * ring and clock on each that asks only them, and every verdict still
 * showing. `angle` is the boom's as drawn this frame.
 */
export function drawDavitMarkFeedback(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  s: DavitState,
  angle: number,
  time: number,
  v: GripVerdicts,
): void {
  const fade = ctx.globalAlpha;
  const held = davitSteering(s) !== null;
  marksAt(l, angle).forEach((c, mark) => {
    const says = asked(l, s, mark);
    const boom = mark === DAVIT_BOOM_MARK;
    if (boom && held) drawMarkHeld(ctx, c.x, c.y, c.r, time);
    else if (says === "own") drawMarkHalo(ctx, c.x, c.y, c.r, time);
    ctx.globalAlpha = fade;
    if (says === "theirs") {
      drawMarkTheirs(ctx, c.x, c.y, c.r, time);
      drawMarkWait(ctx, c.x, c.y, c.r, time);
    }
    ctx.globalAlpha = fade;
    const count = boom ? null : davitDrawCount(s);
    if (count !== null) {
      drawMarkProgress(ctx, c.x, c.y, c.r * MARK_PROGRESS_R, count.share, count.segments);
    }
    const verdict = v.at(mark);
    if (verdict !== null) drawVerdictRing(ctx, c.x, c.y, c.r, verdict);
  });
  ctx.globalAlpha = fade;
}

/**
 * How far the lit step's draw has got, and in how many parts: the drawing
 * seat's beats held steered out of the step's `beats`. On a swing the
 * drawer is the step's; on a reland it is the seat not holding the boom, and
 * nobody's until one does. Null on a shot and between steps.
 */
export function davitDrawCount(s: DavitState): { share: number; segments: number } | null {
  const step = davitLitStep(s);
  if (step === null || step.ask === "fire" || step.beats < 1) return null;
  let drawer: 0 | 1;
  if (step.ask === "reland") {
    const steering = davitSteering(s);
    if (steering === null) return null;
    drawer = steering === 0 ? 1 : 0;
  } else drawer = step.ask === "left" ? 1 : 0;
  return { share: s.drawnBeats[drawer] / step.beats, segments: step.beats };
}
