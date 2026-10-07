import {
  type GovernorState,
  governorFiring,
  governorLitStep,
  governorMarkLanded,
  governorOpenFor,
  type SimEvent,
} from "@neon-spore/sim";
import { type Dial, dialAt, gapAt, hubR, TRACK_IN, TRACK_OUT } from "./governor-shape.js";
import { drawVerdictRing, GripVerdicts } from "./grip-verdict.js";
import { type Circle, type Layout, seatOf } from "./layout.js";
import { drawMarkHalo, drawMarkTheirs, drawMarkWait } from "./mark-feedback.js";

/**
 * **THE GOVERNOR's marks answering a touch the way every mark does**
 * (`mark-feedback.ts`, `grip-verdict.ts`; the owner, 27 September 2026: *the
 * consistent visual across all waves*) — THE SINEW's case, because both
 * screens draw the one governor (`governor-draw.ts`). The marks themselves
 * are `governor-marks.ts`; this is what they say back.
 *
 * Three marks: **each seat's mark on the track**, where its next open mark
 * is, asking that seat; and **the gap** the tip is shot in (still named
 * `GOVERNOR_HUB`, the mark it was until 7 October 2026), asking either seat while a shot is
 * owed. A mark that asks this screen's seat wears the halo; one that asks
 * only the partner's wears their ring and waiting clock — so on an ordered
 * step the seat whose turn it is not sees whose it is.
 *
 * The verdicts are the governor's own words: a mark landed greens the
 * seat's mark and a skid reddens it; a window run out reddens both; a hit
 * greens the gap and a shot run out reddens it. Held in
 * `effects.boss.governor` and drawn in the field's pixels, as the drawer has
 * them.
 */
export const GOVERNOR_PILOT_MARK = 0;
export const GOVERNOR_NAVIGATOR_MARK = 1;
export const GOVERNOR_HUB = 2;

/** The marks a governor event is a verdict on, and which way. */
function says(e: SimEvent): readonly (readonly [number, boolean])[] {
  const seat = (side: 0 | 1) => (side === 0 ? GOVERNOR_PILOT_MARK : GOVERNOR_NAVIGATOR_MARK);
  switch (e.type) {
    case "governorTick":
    case "governorRetap":
      return [[seat(e.side), true]];
    case "governorSkid":
      return [[seat(e.side), false]];
    case "governorSway":
    case "governorDim":
      return [
        [GOVERNOR_PILOT_MARK, false],
        [GOVERNOR_NAVIGATOR_MARK, false],
      ];
    case "governorHit":
      return [[GOVERNOR_HUB, true]];
    case "governorMiss":
      return [[GOVERNOR_HUB, false]];
    default:
      return [];
  }
}

export class GovernorVerdicts {
  /** Was the last touch on each seat's mark and on the gap right. */
  readonly verdicts = new GripVerdicts();

  ingest(events: readonly SimEvent[]): void {
    for (const e of events) for (const [mark, ok] of says(e)) this.verdicts.mark(mark, ok);
  }

  update(dt: number): void {
    this.verdicts.update(dt);
  }

  clear(): void {
    this.verdicts.clear();
  }
}

/** The seat a track mark is for. */
const seatFor = (mark: number): 1 | 2 => (mark === GOVERNOR_PILOT_MARK ? 1 : 2);

/** Where a seat's mark is: its first mark of the lit step not landed, or null with none. */
function seatMilli(s: GovernorState, seat: 1 | 2): number | null {
  const step = governorLitStep(s);
  if (step === null) return null;
  const i = step.marks.findIndex((m, at) => m.seat === seat && !governorMarkLanded(s, at));
  return step.marks[i]?.markMilli ?? null;
}

/** Where each mark is this frame: a seat's mark's middle on the track, or the gap the tip is shot in. */
function markAt(l: Layout, d: Dial, s: GovernorState, mark: number): Circle {
  if (mark !== GOVERNOR_HUB) {
    const at = dialAt(d, seatMilli(s, seatFor(mark)) ?? 0, (TRACK_IN + TRACK_OUT) / 2);
    return { x: at.x, y: at.y, r: d.r * (TRACK_OUT - TRACK_IN) };
  }
  const gap = gapAt(d);
  return { x: gap.x, y: gap.y, r: hubR(l) * 1.3 };
}

/** Whether `mark` asks `seat` this instant. */
function asks(s: GovernorState, mark: number, seat: 1 | 2): boolean {
  if (mark === GOVERNOR_HUB) return governorFiring(s);
  return seatFor(mark) === seat && governorOpenFor(s, seat);
}

/** What each mark asks of this screen: `own` for the halo, `theirs` for the partner's ring and clock. */
function asked(l: Layout, s: GovernorState, mark: number): "own" | "theirs" | null {
  if (l.role === "test") return asks(s, mark, 1) || asks(s, mark, 2) ? "own" : null;
  const me = seatOf(l.role);
  if (asks(s, mark, me)) return "own";
  return asks(s, mark, me === 1 ? 2 : 1) ? "theirs" : null;
}

const MARKS = [GOVERNOR_PILOT_MARK, GOVERNOR_NAVIGATOR_MARK, GOVERNOR_HUB] as const;

/** The halos under the marks this screen's seat is asked for, drawn before them. */
export function drawGovernorHalos(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  d: Dial,
  s: GovernorState,
  time: number,
): void {
  const fade = ctx.globalAlpha;
  for (const mark of MARKS) {
    if (asked(l, s, mark) !== "own") continue;
    const c = markAt(l, d, s, mark);
    drawMarkHalo(ctx, c.x, c.y, c.r, time);
    ctx.globalAlpha = fade;
  }
}

/** Over everything: the partner's ring and clock on each mark that asks only them, and the verdicts. */
export function drawGovernorVerdicts(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  d: Dial,
  s: GovernorState,
  time: number,
  v: GripVerdicts,
): void {
  const fade = ctx.globalAlpha;
  for (const mark of MARKS) {
    const c = markAt(l, d, s, mark);
    if (asked(l, s, mark) === "theirs") {
      drawMarkTheirs(ctx, c.x, c.y, c.r, time);
      drawMarkWait(ctx, c.x, c.y, c.r, time);
    }
    const verdict = v.at(mark);
    if (verdict !== null) drawVerdictRing(ctx, c.x, c.y, c.r, verdict);
    ctx.globalAlpha = fade;
  }
}
