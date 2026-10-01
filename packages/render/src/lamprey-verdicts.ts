import {
  type LampreyState,
  lampreyFiring,
  lampreyPinner,
  lampreyTapper,
  type SimEvent,
} from "@neon-spore/sim";
import { drawVerdictRing, GripVerdicts } from "./grip-verdict.js";
import { type LampreyPose, lampreyToothAt } from "./lamprey-shape.js";
import { type Circle, type Layout, seatOf } from "./layout.js";
import { drawMarkHalo, drawMarkTheirs, drawMarkWait } from "./mark-feedback.js";

/**
 * **THE LAMPREY's marks answering a touch the way every mark does**
 * (`mark-feedback.ts`, `grip-verdict.ts`) — THE SINEW's case, because both
 * screens draw the one eel (`lamprey-draw.ts`). The marks themselves are
 * `lamprey-marks.ts`; this is what they say back.
 *
 * Three marks: **the jaw on the hull** asks the bite's pinner, **the lit
 * tooth** the other seat, and **the gullet** either seat while it is reared.
 * A mark that asks this screen's seat wears the halo; one that asks only the
 * partner's wears their ring and waiting clock.
 *
 * The verdicts are the eel's own words: a crawl held through greens the jaw
 * and a chew reddens it; a crack greens the tooth and a snap reddens it; a
 * hit greens the gullet and a lunge reddens it.
 */
export const LAMPREY_JAW = 0;
export const LAMPREY_TOOTH = 1;
export const LAMPREY_GULLET = 2;

/** Each word of the eel's that is a verdict: the mark it lands on, and which way. */
const SAYS: Readonly<Record<string, readonly [number, boolean]>> = {
  lampreyCrawl: [LAMPREY_JAW, true],
  lampreyGnaw: [LAMPREY_JAW, false],
  lampreyFull: [LAMPREY_JAW, false],
  lampreyCrack: [LAMPREY_TOOTH, true],
  lampreySnap: [LAMPREY_TOOTH, false],
  lampreyHit: [LAMPREY_GULLET, true],
  lampreyLunge: [LAMPREY_GULLET, false],
};

export class LampreyVerdicts {
  /** Was the last touch on the jaw, the tooth and the gullet right. */
  readonly verdicts = new GripVerdicts();

  ingest(events: readonly SimEvent[]): void {
    let gnawed = false;
    for (const e of events) if (e.type === "lampreyGnaw") gnawed = true;
    for (const e of events) {
      // A crawl the jaw was let go through is not held: the chew's red stands.
      if (e.type === "lampreyCrawl" && gnawed) continue;
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

/** Where each mark is this frame: the jaw on the hull, the lit tooth, and the gullet. */
function markAt(l: Layout, p: LampreyPose, s: LampreyState, mark: number): Circle {
  if (mark === LAMPREY_JAW) return { x: p.x, y: l.hullY, r: l.tile * 0.9 };
  if (mark === LAMPREY_TOOTH) {
    const at = lampreyToothAt(p, s.litTooth);
    return { x: at.x, y: at.y, r: p.r * 0.32 };
  }
  return { x: p.x, y: p.y, r: p.r * 0.6 };
}

/** Whether `mark` asks `seat` this instant. */
function asks(s: LampreyState, mark: number, seat: 1 | 2): boolean {
  if (mark === LAMPREY_JAW) return lampreyPinner(s) === seat;
  if (mark === LAMPREY_TOOTH) return lampreyTapper(s) === seat;
  return lampreyFiring(s);
}

/** What each mark asks of this screen: `own` for the halo, `theirs` for the partner's ring and clock. */
function asked(l: Layout, s: LampreyState, mark: number): "own" | "theirs" | null {
  if (l.role === "test") return asks(s, mark, 1) || asks(s, mark, 2) ? "own" : null;
  const me = seatOf(l.role);
  if (asks(s, mark, me)) return "own";
  return asks(s, mark, me === 1 ? 2 : 1) ? "theirs" : null;
}

const MARKS = [LAMPREY_JAW, LAMPREY_TOOTH, LAMPREY_GULLET] as const;

/** The halos under the marks this screen's seat is asked for, drawn before them. */
export function drawLampreyHalos(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  p: LampreyPose,
  s: LampreyState,
  time: number,
): void {
  const fade = ctx.globalAlpha;
  for (const mark of MARKS) {
    if (asked(l, s, mark) !== "own") continue;
    const c = markAt(l, p, s, mark);
    drawMarkHalo(ctx, c.x, c.y, c.r, time);
    ctx.globalAlpha = fade;
  }
}

/** Over everything: the partner's ring and clock on each mark that asks only them, and the verdicts. */
export function drawLampreyVerdicts(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  p: LampreyPose,
  s: LampreyState,
  time: number,
  v: GripVerdicts,
): void {
  const fade = ctx.globalAlpha;
  for (const mark of MARKS) {
    const c = markAt(l, p, s, mark);
    if (asked(l, s, mark) === "theirs") {
      drawMarkTheirs(ctx, c.x, c.y, c.r, time);
      drawMarkWait(ctx, c.x, c.y, c.r, time);
    }
    const verdict = v.at(mark);
    if (verdict !== null) drawVerdictRing(ctx, c.x, c.y, c.r, verdict);
    ctx.globalAlpha = fade;
  }
}
