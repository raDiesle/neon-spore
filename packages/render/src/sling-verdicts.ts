import {
  type SimEvent,
  type SlingAsk,
  type SlingState,
  slingAsks,
  slingCupAsks,
} from "@neon-spore/sim";
import { drawVerdictRing, GripVerdicts } from "./grip-verdict.js";
import { type Circle, type Layout, seatOf } from "./layout.js";
import { drawMarkHalo, drawMarkTheirs, drawMarkWait } from "./mark-feedback.js";

/**
 * **THE SLING's marks answering a touch the way every mark does**
 * (`mark-feedback.ts`, `grip-verdict.ts`; the owner, 27 September 2026: *the
 * consistent visual across all waves*). Both screens draw the one fork
 * (`sling-draw.ts`), so this is THE VISE's arrangement again.
 *
 * Three marks. **The two cords** are each one seat's — the left the pilot's,
 * the right the navigator's (`sim/sling-hand.ts`) — and a cord asks while a
 * draw step is lit on it, or a `both` step its seat has not yet loosed
 * (`slingAsks`): the halo on the owner's screen, the partner's ring and clock
 * on the other's, so a seat already loosed sees the cord still waited on.
 * **The cup** asks for a shot while a fire step stands with the yoke lit
 * (`slingCupAsks`); it is either seat's, and wears the halo on both screens
 * and nobody's clock.
 *
 * The verdicts are the fork's own words: a cord loosed true greens its own,
 * a steady greens both, a cup hit greens the cup. A lift let go short of true
 * reddens its own cord, and so does a draw through the cool, which asks both
 * seats to leave the cords alone. A step let run out — a cord springing back,
 * the yoke dimmed, a shot missed — reddens only what that step asked and was
 * not yet loosed, remembered from its light. **A cord drawn by the wrong seat
 * is not refused red**: the simulation says nothing of it
 * (`sim/sling-hand.ts`), and nor does a wrong colour.
 *
 * Held in `SlingFx` (`sling-fx.ts`). Everything here is in the fork's frame,
 * as the drawer has it: translated to the crotch.
 */
export const SLING_CUP_MARK = 0;
export const SLING_LEFT_MARK = 1;
export const SLING_RIGHT_MARK = 2;

const CORDS = [SLING_LEFT_MARK, SLING_RIGHT_MARK] as const;

/** What each step asks, by the marks it lights. */
const OWES: Readonly<Record<SlingAsk, readonly number[]>> = {
  left: [SLING_LEFT_MARK],
  right: [SLING_RIGHT_MARK],
  both: CORDS,
  fire: [SLING_CUP_MARK],
};

/** Each word of the fork's that answers the whole step: the marks it greens. */
const ANSWERS: Readonly<Record<string, readonly number[]>> = {
  slingSteady: CORDS,
  slingHit: [SLING_CUP_MARK],
};

/** Each word of the fork's that says a step ran out. */
const LAPSES = new Set(["slingSpring", "slingDim", "slingMiss"]);

export class SlingVerdicts {
  /** Was the last touch on each mark right. */
  readonly verdicts = new GripVerdicts();
  /** The marks the lit step asked and nobody has answered yet, from its light. */
  private owed: readonly number[] = [];

  ingest(events: readonly SimEvent[]): void {
    for (const e of events) {
      if (e.type === "slingLight") this.owed = OWES[e.ask];
      else if (e.type === "slingSlack" || e.type === "slingSnap")
        this.verdicts.mark(CORDS[e.side], false);
      // A loose answers its own cord; in a `both` step the other is still owed.
      else if (e.type === "slingLoose") {
        this.verdicts.mark(CORDS[e.side], true);
        this.owed = this.owed.filter((k) => k !== CORDS[e.side]);
      } else if (LAPSES.has(e.type)) {
        for (const k of this.owed) this.verdicts.mark(k, false);
        this.owed = [];
      } else {
        const said = ANSWERS[e.type];
        if (said === undefined) continue;
        for (const k of said) this.verdicts.mark(k, true);
        this.owed = [];
      }
    }
  }

  update(dt: number): void {
    this.verdicts.update(dt);
  }

  clear(): void {
    this.verdicts.clear();
    this.owed = [];
  }
}

/** Where the drawer put this frame's cup and the two cords. */
export interface SlingMarkPlaces {
  cup: Circle;
  cords: readonly [Circle, Circle];
}

/** What a mark asks of this screen: `own` for the halo, `theirs` for the partner's ring and clock. */
function asked(l: Layout, s: SlingState, mark: number): "own" | "theirs" | null {
  if (mark === SLING_CUP_MARK) return slingCupAsks(s) ? "own" : null;
  const seat = mark === SLING_LEFT_MARK ? 1 : 2;
  if (!slingAsks(s, seat === 1 ? 0 : 1)) return null;
  return l.role === "test" || seatOf(l.role) === seat ? "own" : "theirs";
}

/**
 * Over the fork: the halo on each mark that asks this screen, the partner's
 * ring and clock on each that asks only them, and every verdict still showing.
 */
export function drawSlingMarkFeedback(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  s: SlingState,
  time: number,
  at: SlingMarkPlaces,
  v: GripVerdicts,
): void {
  const fade = ctx.globalAlpha;
  [at.cup, at.cords[0], at.cords[1]].forEach((c, mark) => {
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
  ctx.globalAlpha = fade;
}
