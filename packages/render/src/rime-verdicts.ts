import {
  midCol,
  type RimeAsk,
  type RimeState,
  rimeCoreAsks,
  rimeHalfAsks,
  rimeIcicleAsks,
  rimeIcicleCol,
  rimeSurgeAsks,
  type SimConfig,
  type SimEvent,
} from "@neon-spore/sim";
import { fieldX } from "./field-flip.js";
import { drawVerdictRing, GripVerdicts } from "./grip-verdict.js";
import { type Circle, type Layout, seatOf } from "./layout.js";
import { drawMarkHalo, drawMarkTheirs, drawMarkWait } from "./mark-feedback.js";
import { rimeCentre, rimeCoreR, rimeHalfMiddle, rimeRadius } from "./rime-shape.js";

/**
 * **THE RIME's marks answering a touch the way every mark does**
 * (`mark-feedback.ts`, `grip-verdict.ts`; the owner, 27 September 2026: *the
 * consistent visual across all waves*). Both screens draw the one lens
 * (`rime-draw.ts`), so this is THE VISE's arrangement again.
 *
 * Five marks. **The two halves** are each one seat's — the left the pilot's,
 * the right the navigator's (`rime-grip.ts`) — and a half asks while a wipe
 * or the whiteout is lit on it with frost still on it (`rimeHalfAsks`): the
 * halo on the owner's screen, the partner's ring and clock on the other's, so
 * a seat already wiped clear in the whiteout sees the half still frosted.
 * **The core** asks for a shot while a fire step stands with it bare
 * (`rimeCoreAsks`), **the hull under the lens** for the shield through the
 * surge (`rimeSurgeAsks`), and **the hull under the icicle** for the shield
 * under its column (`rimeIcicleAsks`); those three are either seat's, and
 * wear the halo on both screens and nobody's clock.
 *
 * The verdicts are the lens's own words: a half wiped clear greens it, the
 * whiteout thawed greens both, a core hit greens the core and a block greens
 * the shield it was asked of. A step let run out — a half frosting back, the
 * lens clouding, a shot or a shield missed — reddens only what that step
 * asked, remembered from its light; a wipe too many in the refreeze reddens
 * the core it scatters the film over. **A half rubbed by the wrong seat is
 * not refused red**: the simulation says nothing of it (`sim/rime-hand.ts`),
 * and nor does a wrong colour.
 *
 * Held in `RimeFx` (`rime-fx.ts`). Everything here is in the lens's own frame,
 * as the drawer has it: translated to its middle and shaken.
 */
export const RIME_CORE_MARK = 0;
export const RIME_LEFT_MARK = 1;
export const RIME_RIGHT_MARK = 2;
export const RIME_HULL_MARK = 3;
export const RIME_ICICLE_MARK = 4;

const HALVES = [RIME_LEFT_MARK, RIME_RIGHT_MARK] as const;

/** What each step asks, by the marks it lights. */
const OWES: Readonly<Record<RimeAsk, readonly number[]>> = {
  left: [RIME_LEFT_MARK],
  right: [RIME_RIGHT_MARK],
  both: HALVES,
  fire: [RIME_CORE_MARK],
  shield: [RIME_HULL_MARK],
  icicle: [RIME_ICICLE_MARK],
};

/** Each word of the lens's that says a step ran out. */
const LAPSES = new Set(["rimeFrost", "rimeCloud", "rimeMiss"]);

export class RimeVerdicts {
  /** Was the last touch on each mark right. */
  readonly verdicts = new GripVerdicts();
  /** The marks the lit step asked, from its light until it is answered or runs out. */
  private owed: readonly number[] = [];

  ingest(events: readonly SimEvent[]): void {
    for (const e of events) {
      if (e.type === "rimeLight") this.owed = OWES[e.ask];
      else if (e.type === "rimeClear") this.answer([HALVES[e.side]]);
      else if (e.type === "rimeHit") this.answer([RIME_CORE_MARK]);
      else if (e.type === "rimeScatter") this.verdicts.mark(RIME_CORE_MARK, false);
      // The whiteout thawed and the shield turned answer whatever was asked;
      // a bare after a wipe has nothing owed left to green.
      else if (e.type === "rimeBare" || e.type === "rimeBlock") this.answer(this.owed);
      else if (LAPSES.has(e.type)) {
        for (const k of this.owed) this.verdicts.mark(k, false);
        this.owed = [];
      }
    }
  }

  private answer(marks: readonly number[]): void {
    for (const k of marks) this.verdicts.mark(k, true);
    this.owed = [];
  }

  update(dt: number): void {
    this.verdicts.update(dt);
  }

  clear(): void {
    this.verdicts.clear();
    this.owed = [];
  }
}

/** Where each mark stands this frame, in the lens's frame; `toHull` is how far below it the hull is. */
function marksAt(l: Layout, cfg: SimConfig, s: RimeState, toHull: number): Circle[] {
  const r = rimeRadius(l).rx * 0.5;
  const half = (side: 0 | 1): Circle => ({ ...rimeHalfMiddle(l, side), r });
  // The icicle of the step lit, or of the one just past, as the drawer drops it.
  const fell = s.phase === "lit" ? s.steps[s.cursor] : s.steps[s.cursor - 1];
  const icicleX =
    fell === undefined ? 0 : fieldX(l, rimeIcicleCol(midCol(cfg), fell)) - rimeCentre(l, cfg).x;
  return [
    { x: 0, y: 0, r: rimeCoreR(l) },
    half(0),
    half(1),
    { x: 0, y: toHull, r: l.tile * 0.5 },
    { x: icicleX, y: toHull, r: l.tile * 0.5 },
  ];
}

/** What a mark asks of this screen: `own` for the halo, `theirs` for the partner's ring and clock. */
function asked(l: Layout, s: RimeState, mark: number): "own" | "theirs" | null {
  if (mark === RIME_CORE_MARK) return rimeCoreAsks(s) ? "own" : null;
  if (mark === RIME_HULL_MARK) return rimeSurgeAsks(s) ? "own" : null;
  if (mark === RIME_ICICLE_MARK) return rimeIcicleAsks(s) ? "own" : null;
  const seat = mark === RIME_LEFT_MARK ? 1 : 2;
  if (!rimeHalfAsks(s, seat === 1 ? 0 : 1)) return null;
  return l.role === "test" || seatOf(l.role) === seat ? "own" : "theirs";
}

/**
 * Over the lens: the halo on each mark that asks this screen, the partner's
 * ring and clock on each that asks only them, and every verdict still showing.
 */
export function drawRimeMarkFeedback(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  cfg: SimConfig,
  s: RimeState,
  time: number,
  toHull: number,
  v: GripVerdicts,
): void {
  const fade = ctx.globalAlpha;
  marksAt(l, cfg, s, toHull).forEach((c, mark) => {
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
