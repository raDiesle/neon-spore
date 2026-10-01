import {
  type SimEvent,
  type TrivetAsk,
  type TrivetState,
  trivetFootAsks,
  trivetHubAsks,
  trivetNeedleAsks,
} from "@neon-spore/sim";
import { drawVerdictRing, GripVerdicts } from "./grip-verdict.js";
import { type Circle, type Layout, seatOf } from "./layout.js";
import { drawMarkHalo, drawMarkTheirs, drawMarkWait } from "./mark-feedback.js";
import { type Point, trivetFaceR } from "./trivet-shape.js";

/**
 * **THE TRIVET's marks answering a touch the way every mark does**
 * (`mark-feedback.ts`, `grip-verdict.ts`; the owner, 27 September 2026: *the
 * consistent visual across all waves*). Both screens draw the one stand
 * (`trivet-draw.ts`), so this is THE VISE's arrangement again.
 *
 * Four marks. **The two outer feet** are each one seat's — the front the
 * pilot's, the rear the navigator's (`sim/trivet-hand.ts`) — and a foot asks
 * while the lit step wants its chord and the chord is not held down
 * (`trivetFootAsks`): its own chord, both, or the lurch leaning on it. The
 * halo is on the owner's screen, the partner's ring and clock on the other's,
 * so a seat already holding sees the foot still up. **The hub** asks for a
 * shot while it is lit on a fire step, or on a lurch once its chord is held
 * (`trivetHubAsks`), and **the hull under the needle** for the shield under
 * its column (`trivetNeedleAsks`); those two are either seat's, and wear the
 * halo on both screens and nobody's clock.
 *
 * The verdicts are the stand's own words: a plant greens its foot and a brace
 * greens both; a pad lifted off a chord not yet answered reddens its own foot;
 * a hub hit and a needle turned green their marks. A step let run out — a foot
 * springing, the stand rocking, a shot, a lurch or a needle missed — reddens
 * only what that step asked, remembered from its light. **A pad pressed by
 * the wrong seat is not refused red**: the simulation says nothing of it
 * (`sim/trivet-hand.ts`), and nor does a wrong colour.
 *
 * Held in `TrivetFx` (`trivet-fx.ts`). Everything here is in the stand's own
 * frame, as the drawer has it: translated to the hub's standing middle,
 * dropped, thudded and shaken.
 */
export const TRIVET_HUB_MARK = 0;
export const TRIVET_FRONT_MARK = 1;
export const TRIVET_REAR_MARK = 2;
export const TRIVET_NEEDLE_MARK = 3;

const FEET = [TRIVET_FRONT_MARK, TRIVET_REAR_MARK] as const;

/** A foot's mark round its plate, in tiles. */
const FOOT_R = 0.6;

/** What each step asks, by the marks it lights. A lurch's own chord is drawn asking, and only its shot is owed. */
const OWES: Readonly<Record<TrivetAsk, readonly number[]>> = {
  front: [TRIVET_FRONT_MARK],
  rear: [TRIVET_REAR_MARK],
  both: FEET,
  fire: [TRIVET_HUB_MARK],
  tip: [TRIVET_HUB_MARK],
  needle: [TRIVET_NEEDLE_MARK],
};

/** Each word of the stand's that answers, but a plant: the marks it greens. */
const ANSWERS: Readonly<Record<string, readonly number[]>> = {
  trivetBrace: FEET,
  trivetHit: [TRIVET_HUB_MARK],
  trivetTurn: [TRIVET_NEEDLE_MARK],
};

/** Each word of the stand's that says a step ran out. */
const LAPSES = new Set(["trivetSpring", "trivetRock", "trivetMiss"]);

export class TrivetVerdicts {
  /** Was the last touch on each mark right. */
  readonly verdicts = new GripVerdicts();
  /** The marks the lit step asked, from its light until it is answered or runs out. */
  private owed: readonly number[] = [];

  ingest(events: readonly SimEvent[]): void {
    for (const e of events) {
      if (e.type === "trivetLight") this.owed = OWES[e.ask];
      else if (e.type === "trivetSlip") this.verdicts.mark(FEET[e.side], false);
      else if (e.type === "trivetPlant") {
        this.verdicts.mark(FEET[e.side], true);
        this.owed = [];
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

/** Where the drawer put this frame's hub, the two outer feet and the hull under the needle. */
export interface TrivetMarkPlaces {
  hub: Point;
  feet: readonly [Point, Point];
  needle: Point;
}

function marksAt(l: Layout, at: TrivetMarkPlaces): Circle[] {
  const r = FOOT_R * l.tile;
  return [
    { ...at.hub, r: trivetFaceR(l) },
    { ...at.feet[0], r },
    { ...at.feet[1], r },
    { ...at.needle, r: l.tile * 0.5 },
  ];
}

/** What a mark asks of this screen: `own` for the halo, `theirs` for the partner's ring and clock. */
function asked(l: Layout, s: TrivetState, mark: number): "own" | "theirs" | null {
  if (mark === TRIVET_HUB_MARK) return trivetHubAsks(s) ? "own" : null;
  if (mark === TRIVET_NEEDLE_MARK) return trivetNeedleAsks(s) ? "own" : null;
  const seat = mark === TRIVET_FRONT_MARK ? 1 : 2;
  if (!trivetFootAsks(s, seat === 1 ? 0 : 1)) return null;
  return l.role === "test" || seatOf(l.role) === seat ? "own" : "theirs";
}

/**
 * Over the stand: the halo on each mark that asks this screen, the partner's
 * ring and clock on each that asks only them, and every verdict still showing.
 */
export function drawTrivetMarkFeedback(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  s: TrivetState,
  time: number,
  at: TrivetMarkPlaces,
  v: GripVerdicts,
): void {
  const fade = ctx.globalAlpha;
  marksAt(l, at).forEach((c, mark) => {
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
