import {
  type GovernorState,
  governorFiring,
  governorGovernor,
  governorLitStep,
  governorTapper,
  type SimEvent,
} from "@neon-spore/sim";
import { type Dial, dialAt, drumAt, hubR, TRACK_IN, TRACK_OUT } from "./governor-shape.js";
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
 * Three marks, each asking one seat or both: **the lit mark on the track**
 * asks the step's tapper, **the yoke** the braking seat, and **the hub**
 * either seat while a shot is owed. A mark that asks this screen's seat
 * wears the halo; one that asks only the partner's wears their ring and
 * waiting clock — so the one braking sees the tap waited on, and the tapper
 * sees the chord asked of the other.
 *
 * The verdicts are the governor's own words: a tap or a retap landed greens
 * the mark and a skid or a window run out reddens it; a chord made whole
 * greens the yoke and one broken reddens it; a hit greens the hub and a shot
 * run out reddens it. Held in `effects.boss.governor` and drawn in the
 * field's pixels, as the drawer has them.
 */
export const GOVERNOR_MARK = 0;
export const GOVERNOR_YOKE = 1;
export const GOVERNOR_HUB = 2;

/** Each word of the governor's that is a verdict: the mark it lands on, and which way. */
const SAYS: Readonly<Record<string, readonly [number, boolean]>> = {
  governorTick: [GOVERNOR_MARK, true],
  governorRetap: [GOVERNOR_MARK, true],
  governorSkid: [GOVERNOR_MARK, false],
  governorSway: [GOVERNOR_MARK, false],
  governorDim: [GOVERNOR_MARK, false],
  governorPlant: [GOVERNOR_YOKE, true],
  governorSlip: [GOVERNOR_YOKE, false],
  governorHit: [GOVERNOR_HUB, true],
  governorMiss: [GOVERNOR_HUB, false],
};

export class GovernorVerdicts {
  /** Was the last touch on the mark, the yoke and the hub right. */
  readonly verdicts = new GripVerdicts();

  ingest(events: readonly SimEvent[]): void {
    for (const e of events) {
      const said = SAYS[e.type];
      if (said !== undefined) this.verdicts.mark(said[0], said[1]);
    }
  }

  update(dt: number): void {
    this.verdicts.update(dt);
  }

  clear(): void {
    this.verdicts.clear();
  }
}

/** Where each mark is this frame: the lit mark's middle on the track, the drum, and the hub. */
function markAt(l: Layout, d: Dial, s: GovernorState, mark: number): Circle {
  if (mark === GOVERNOR_MARK) {
    const at = dialAt(d, governorLitStep(s)?.markMilli ?? 0, (TRACK_IN + TRACK_OUT) / 2);
    return { x: at.x, y: at.y, r: d.r * (TRACK_OUT - TRACK_IN) };
  }
  if (mark === GOVERNOR_YOKE) {
    const drum = drumAt(l, d);
    return { x: drum.at.x, y: drum.at.y, r: drum.r * 1.4 };
  }
  return { x: d.cx, y: d.cy, r: hubR(l) * 1.3 };
}

/** Whether `mark` asks `seat` this instant. */
function asks(s: GovernorState, mark: number, seat: 1 | 2): boolean {
  if (mark === GOVERNOR_MARK) return governorTapper(s) === seat;
  if (mark === GOVERNOR_YOKE) return governorGovernor(s) === seat;
  return governorFiring(s);
}

/** What each mark asks of this screen: `own` for the halo, `theirs` for the partner's ring and clock. */
function asked(l: Layout, s: GovernorState, mark: number): "own" | "theirs" | null {
  if (l.role === "test") return asks(s, mark, 1) || asks(s, mark, 2) ? "own" : null;
  const me = seatOf(l.role);
  if (asks(s, mark, me)) return "own";
  return asks(s, mark, me === 1 ? 2 : 1) ? "theirs" : null;
}

const MARKS = [GOVERNOR_MARK, GOVERNOR_YOKE, GOVERNOR_HUB] as const;

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
