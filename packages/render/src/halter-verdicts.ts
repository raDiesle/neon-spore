import {
  type HalterState,
  halterCoreAsks,
  halterGripAsks,
  halterGripped,
  halterLitStep,
  halterResters,
  halterSeatIndex,
  type SimConfig,
  type SimEvent,
} from "@neon-spore/sim";
import { drawVerdictRing, GripVerdicts } from "./grip-verdict.js";
import { halterLitSegment } from "./halter-pose.js";
import { halterCoreAt, halterCoreR, halterGripAt } from "./halter-shape.js";
import { type Circle, type Layout, seatOf } from "./layout.js";
import { drawMarkHalo, drawMarkTheirs, drawMarkWait } from "./mark-feedback.js";
import { drawMarkHeld, drawMarkProgress, MARK_PROGRESS_R } from "./mark-progress.js";

/**
 * **THE HALTER's marks answering a touch the way every mark does**
 * (`mark-feedback.ts`, `grip-verdict.ts`; the owner, 27 September 2026: *the
 * consistent visual across all waves*). Both screens draw the one seam
 * (`halter-draw.ts`), so this is THE CYST's arrangement again.
 *
 * Three marks, the places a thumb answers it (`halter-grip.ts`). **The two
 * grips** of the lit segment are the chord: they ask the seat whose chord the
 * lit step wants (`halterGripAsks`) — the halo on the gripper's screen, the
 * partner's ring and clock on the resting seat's, which is the one screen
 * that must touch nothing and so waits. On a guard either seat may chord, and
 * once one has a grip down the grips ask only that one. **The core** asks for
 * a shot on a fire step with the centre bare (`halterCoreAsks`); that is
 * either seat's, and wears the halo on both screens and nobody's clock.
 *
 * The verdicts are the seam's own words: a crack or a guard made greens both
 * grips, and a hit greens the core. A pair come apart — the chord lifted or
 * the rester stirred — reddens both grips, and so does a step run out or a
 * guard failed; a shot run out reddens the core. **Neither a wrong seat's
 * touch nor a wrong colour is refused red**: the simulation says nothing of
 * either (`sim/halter-hand.ts`, `sim/halter-shot.ts`).
 *
 * **The chord says it is right, and the pair how far** (the owner, 7
 * October 2026, THE CAPSTAN's rule for every boss: `capstan-verdicts.ts`).
 * Once the gripping seat has both grips down (`halterGripper`) the two wear
 * the steady green ring of a part held where it is wanted, on both screens,
 * and the halo goes. **The pair's count rings both grips on both screens**, one ring round the two
 * — one green segment a beat the rester has kept still, then one a beat the
 * two have held together, over a dim track of `halterRestThreshold` and
 * `halterHoldBeats` (`mark-progress.ts`) — so the seat holding sees its
 * partner still keeping still, and how far. The resting seat has no mark of
 * its own to carry it: a mark would be a thing on the glass inviting a thumb.
 *
 * Held in `LateRoster` (`effects-boss-roster-late.ts`). Everything here is in
 * the seam's frame, as the drawer has it: translated to its centre.
 */
export const HALTER_LEFT_GRIP_MARK = 0;
export const HALTER_RIGHT_GRIP_MARK = 1;
export const HALTER_CORE_MARK = 2;

const GRIPS = [HALTER_LEFT_GRIP_MARK, HALTER_RIGHT_GRIP_MARK] as const;

/** How far round a grip its mark reaches, in tiles: under the press's reach, so the two never touch. */
const GRIP_MARK_R = 0.45;

/** Each word of the seam's that answers or lapses: the marks it greens or reddens. */
const SAYS: Readonly<Record<string, { marks: readonly number[]; right: boolean }>> = {
  halterCrack: { marks: GRIPS, right: true },
  halterGuard: { marks: GRIPS, right: true },
  halterHit: { marks: [HALTER_CORE_MARK], right: true },
  halterSlip: { marks: GRIPS, right: false },
  halterStartle: { marks: GRIPS, right: false },
  halterShut: { marks: GRIPS, right: false },
  halterSeal: { marks: GRIPS, right: false },
  halterMiss: { marks: [HALTER_CORE_MARK], right: false },
};

export class HalterVerdicts {
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

/**
 * The lit segment's two grips, or the middle one's while none is lit — where a
 * verdict on them still shows — and the core as wide as it is drawn.
 */
function marksAt(l: Layout, s: HalterState): Circle[] {
  const step = halterLitStep(s);
  const k = step !== null && step.ask !== "fire" ? (halterLitSegment(s) ?? 1) : 1;
  const r = GRIP_MARK_R * l.tile;
  const left = halterGripAt(l, k, 0);
  const right = halterGripAt(l, k, 1);
  const core = halterCoreAt(l);
  return [
    { x: left.x, y: left.y, r },
    { x: right.x, y: right.y, r },
    { x: core.x, y: core.y, r: halterCoreR(l) },
  ];
}

/** What a mark asks of this screen: `own` for the halo, `theirs` for the partner's ring and clock. */
function asked(l: Layout, s: HalterState, mark: number): "own" | "theirs" | null {
  if (mark === HALTER_CORE_MARK) return halterCoreAsks(s) ? "own" : null;
  if (l.role === "test") return halterGripAsks(s, 0) || halterGripAsks(s, 1) ? "own" : null;
  const side = seatOf(l.role) === 1 ? 0 : 1;
  if (halterGripAsks(s, side)) return "own";
  return halterGripAsks(s, side === 0 ? 1 : 0) ? "theirs" : null;
}

/**
 * Over the seam: the halo on each mark that asks this screen, the partner's
 * ring and clock on each that asks only them, and every verdict still showing.
 */
export function drawHalterMarkFeedback(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  cfg: SimConfig,
  s: HalterState,
  time: number,
  v: GripVerdicts,
): void {
  const fade = ctx.globalAlpha;
  const seat = halterGripper(s);
  const held = seat !== null && halterGripped(s, seat);
  const count = halterPairCount(cfg, s);
  const marks = marksAt(l, s);
  const [left, right] = marks;
  if (count !== null && left !== undefined && right !== undefined) {
    // One ring round the pair: the grips stand too close for one each.
    const R = Math.hypot(right.x - left.x, right.y - left.y) / 2 + left.r * MARK_PROGRESS_R;
    const x = (left.x + right.x) / 2;
    const y = (left.y + right.y) / 2;
    drawMarkProgress(ctx, x, y, R, count.share, count.segments);
  }
  marks.forEach((c, mark) => {
    const says = asked(l, s, mark);
    const grip = mark !== HALTER_CORE_MARK;
    if (grip && held) drawMarkHeld(ctx, c.x, c.y, c.r, time);
    else if (says === "own") drawMarkHalo(ctx, c.x, c.y, c.r, time);
    ctx.globalAlpha = fade;
    if (says === "theirs") {
      drawMarkTheirs(ctx, c.x, c.y, c.r, time);
      drawMarkWait(ctx, c.x, c.y, c.r, time);
    }
    ctx.globalAlpha = fade;
    const verdict = v.at(mark);
    if (verdict !== null) drawVerdictRing(ctx, c.x, c.y, c.r, verdict);
  });
  ctx.globalAlpha = fade;
}

/**
 * The seat the lit step wants gripping: the one that may not rest; on a
 * guard the one with a thumb already down, or `null` — both — while neither
 * has one.
 */
export function halterGripper(s: HalterState): 1 | 2 | null {
  const resters = halterResters(s);
  if (resters.length === 1) return resters[0] === 1 ? 2 : 1;
  const down = ([1, 2] as const).filter((seat) => s.grips[halterSeatIndex(seat)] !== 0);
  return down.length === 1 ? (down[0] ?? null) : null;
}

/**
 * How far the lit step's pair has got, and in how many parts: the resting
 * seat's still beats up to `halterRestThreshold`, then the beats the two
 * have held together toward `halterHoldBeats`. Null on a shot, between
 * steps, and on a guard nobody has gripped yet.
 */
export function halterPairCount(
  cfg: SimConfig,
  s: HalterState,
): { share: number; segments: number } | null {
  const ask = halterLitStep(s)?.ask;
  if (ask === undefined || ask === "fire") return null;
  const seat = halterGripper(s);
  if (seat === null) return null;
  const rester = halterSeatIndex(seat === 1 ? 2 : 1);
  const segments = cfg.halterRestThreshold + cfg.halterHoldBeats;
  const rest = Math.min(s.restBeats[rester], cfg.halterRestThreshold);
  return { share: (rest + s.heldBeats) / segments, segments };
}
