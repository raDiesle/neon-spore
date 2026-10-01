import {
  type PlumbAsk,
  type PlumbState,
  plumbCoreAsks,
  plumbStoneAsks,
  type SimEvent,
} from "@neon-spore/sim";
import { drawVerdictRing, GripVerdicts } from "./grip-verdict.js";
import { type Circle, type Layout, seatOf } from "./layout.js";
import { drawMarkHalo, drawMarkTheirs, drawMarkWait } from "./mark-feedback.js";

/**
 * **THE PLUMB's marks answering a touch the way every mark does**
 * (`mark-feedback.ts`, `grip-verdict.ts`; the owner, 27 September 2026: *the
 * consistent visual across all waves*). Both screens draw the one bob
 * (`plumb-draw.ts`), so this is THE VISE's arrangement again.
 *
 * Three marks. **The two stones** are each one seat's — the left the pilot's,
 * the right the navigator's (`sim/plumb-hand.ts`) — and a stone asks while a
 * level step is lit and its seat is not yet pulling towards true
 * (`plumbStoneAsks`): the halo on the owner's screen, the partner's ring and
 * clock on the other's, so a seat already pulling sees the stone still
 * waited on. Every level step is both seats pulling, so a level asks both
 * stones whichever weight it settles. **The core** asks for a shot while a
 * fire step stands with it lit (`plumbCoreAsks`); it is either seat's, and
 * wears the halo on both screens and nobody's clock.
 *
 * The verdicts are the bob's own words: a settle and a steady green both
 * stones, a core hit greens the core. A pull that knocks the bob off true
 * reddens its own stone, and so does a pull through the bleed, which asks
 * both seats to leave the stones alone. A step let run out — a weight swung
 * back, the core dimmed, a shot missed — reddens only what that step asked,
 * remembered from its light. **A stone pulled by the wrong seat is not
 * refused red**: the simulation says nothing of it (`sim/plumb-hand.ts`), and
 * nor does a wrong colour.
 *
 * Held in `PlumbFx` (`plumb-fx.ts`). Everything here is in the hook's frame,
 * as the drawer has it: translated to the hook, lifted and shaken.
 */
export const PLUMB_CORE_MARK = 0;
export const PLUMB_LEFT_MARK = 1;
export const PLUMB_RIGHT_MARK = 2;

const STONES = [PLUMB_LEFT_MARK, PLUMB_RIGHT_MARK] as const;

/** What each step asks, by the marks it lights. */
const OWES: Readonly<Record<PlumbAsk, readonly number[]>> = {
  left: STONES,
  right: STONES,
  both: STONES,
  fire: [PLUMB_CORE_MARK],
};

/** Each word of the bob's that answers: the marks it greens. */
const ANSWERS: Readonly<Record<string, readonly number[]>> = {
  plumbSettle: STONES,
  plumbSteady: STONES,
  plumbHit: [PLUMB_CORE_MARK],
};

/** Each word of the bob's that says a step ran out. */
const LAPSES = new Set(["plumbSwing", "plumbDim", "plumbMiss"]);

export class PlumbVerdicts {
  /** Was the last touch on each mark right. */
  readonly verdicts = new GripVerdicts();
  /** The marks the lit step asked, from its light until it is answered or runs out. */
  private owed: readonly number[] = [];

  ingest(events: readonly SimEvent[]): void {
    for (const e of events) {
      if (e.type === "plumbLight") this.owed = OWES[e.ask];
      else if (e.type === "plumbDrift" || e.type === "plumbFlare")
        this.verdicts.mark(STONES[e.side], false);
      else if (LAPSES.has(e.type)) {
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

/** Where the drawer put this frame's core and the two stones. */
export interface PlumbMarkPlaces {
  core: Circle;
  stones: readonly [Circle, Circle];
}

/** What a mark asks of this screen: `own` for the halo, `theirs` for the partner's ring and clock. */
function asked(l: Layout, s: PlumbState, mark: number): "own" | "theirs" | null {
  if (mark === PLUMB_CORE_MARK) return plumbCoreAsks(s) ? "own" : null;
  const seat = mark === PLUMB_LEFT_MARK ? 1 : 2;
  if (!plumbStoneAsks(s, seat === 1 ? 0 : 1)) return null;
  return l.role === "test" || seatOf(l.role) === seat ? "own" : "theirs";
}

/**
 * Over the bob: the halo on each mark that asks this screen, the partner's
 * ring and clock on each that asks only them, and every verdict still showing.
 */
export function drawPlumbMarkFeedback(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  s: PlumbState,
  time: number,
  at: PlumbMarkPlaces,
  v: GripVerdicts,
): void {
  const fade = ctx.globalAlpha;
  [at.core, at.stones[0], at.stones[1]].forEach((c, mark) => {
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
