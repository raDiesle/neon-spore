import {
  type KeelState,
  keelEndAsks,
  keelEndSeg,
  keelFlipping,
  keelJointAsks,
  type SimConfig,
  type SimEvent,
} from "@neon-spore/sim";
import { drawVerdictRing, GripVerdicts } from "./grip-verdict.js";
import { keelRingCircle } from "./keel-marks.js";
import type { Seg } from "./keel-shape.js";
import type { Circle, Layout, ViewRole } from "./layout.js";
import { drawMarkHalo, drawMarkTheirs, drawMarkWait } from "./mark-feedback.js";
import { drawMarkHeld, drawMarkProgress, MARK_PROGRESS_R } from "./mark-progress.js";

/**
 * **THE KEEL's joints answering a touch the way every mark does**
 * (`mark-feedback.ts`, `grip-verdict.ts`; the owner, 27 September 2026: *the
 * consistent visual across all waves*) — the whole convention, THE SINEW's
 * case, because both screens draw the one spine (`keel-draw.ts`). The marks
 * themselves, the ring and the socket, are `keel-marks.ts`; this is what they
 * say back.
 *
 * Whether a mark asks is the simulation's (`sim/keel.ts`): the lit joint asks
 * the seat whose half it sits over, or both over the middle column
 * (`keelJointAsks`); in the flip each end joint asks its own seat while that
 * thumb is off it (`keelEndAsks`). **An asking mark wears the halo on its
 * owner's screen and the partner's turning ring and clock on the other's** —
 * which is the whole question this boss asks, *whose is it*, answered on the
 * glass before either thumb moves.
 *
 * The verdicts are the spine's own words, keyed by segment, so each is drawn
 * round the plate it names: a lock greens that joint, a window run out or a
 * tempo-run segment working loose reddens it; the flip arrested greens both
 * end joints and the flip snapped back reddens both. **A wrong-seat tap is not
 * refused red**: the simulation says nothing of it, on purpose — a pair find
 * out whose joint it was by watching whose tap counted (`sim/keel-hand.ts`).
 * The socket and the marrow are the cannon's, not a touch's.
 *
 * **An end held through the flip says it is right, and the chord says how
 * far** (the owner, 7 October 2026, THE CAPSTAN's rule, `mark-progress.ts`):
 * a thumb down on its own end joint wears the steady green ring there in
 * place of the halo, on both screens, and both ends carry the chord's count —
 * one segment a beat of both thumbs down, out of `keelChordBeats` — so a seat
 * holding sees the partner still owed, and how close the arrest is.
 *
 * Held in `KeelFx` (`keel-fx.ts`).
 */
export class KeelVerdicts {
  /** Was the last touch on each segment's joint right, keyed by segment. */
  readonly verdicts = new GripVerdicts();

  /** `segments` is how many the spine has, which the tail end's key is read off. */
  ingest(events: readonly SimEvent[], segments: number): void {
    for (const e of events) {
      if (e.type === "keelLock") this.verdicts.mark(e.seg, true);
      else if (e.type === "keelMiss" || e.type === "keelSlip") this.verdicts.mark(e.seg, false);
      else if (e.type === "keelArrest" || e.type === "keelSnap") {
        const good = e.type === "keelArrest";
        this.verdicts.mark(0, good);
        this.verdicts.mark(segments - 1, good);
      }
    }
  }

  update(dt: number): void {
    this.verdicts.update(dt);
  }

  clear(): void {
    this.verdicts.clear();
  }
}

/** Whether `seat`'s marks are this screen's own — both on the test screen. */
function mine(role: ViewRole, seat: 1 | 2): boolean {
  return role === "test" || (role === "p1") === (seat === 1);
}

/** Each mark asking this frame: where it is, and which seat it asks — `null` for either. */
function asking(l: Layout, cfg: SimConfig, s: KeelState, segs: Seg[]): [Circle, 1 | 2 | null][] {
  const out: [Circle, 1 | 2 | null][] = [];
  const joint = segs[s.joint];
  if (joint !== undefined) {
    const p1 = keelJointAsks(s, cfg.cols, 1);
    const p2 = keelJointAsks(s, cfg.cols, 2);
    if (p1 || p2) out.push([keelRingCircle(l, joint.centre), p1 && p2 ? null : p1 ? 1 : 2]);
  }
  for (const seat of [1, 2] as const) {
    const end = segs[keelEndSeg(s, seat)];
    if (end !== undefined && keelEndAsks(s, seat)) out.push([keelRingCircle(l, end.centre), seat]);
  }
  return out;
}

/** Under the rings: the halo on each asking mark this screen owns. */
export function drawKeelHalos(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  cfg: SimConfig,
  s: KeelState,
  segs: Seg[],
  time: number,
): void {
  const fade = ctx.globalAlpha;
  for (const [c, seat] of asking(l, cfg, s, segs)) {
    if (seat === null || mine(l.role, seat)) drawMarkHalo(ctx, c.x, c.y, c.r, time);
  }
  ctx.globalAlpha = fade;
}

/** How far the flip's chord has got, in beats of both thumbs down out of those it needs; null outside the flip. */
export function keelChordCount(
  cfg: SimConfig,
  s: KeelState,
): { share: number; segments: number } | null {
  if (!keelFlipping(s)) return null;
  return { share: s.chordBeats / cfg.keelChordBeats, segments: cfg.keelChordBeats };
}

/** Over the rings, in the flip: each end held wears the green ring, and both the chord's count. */
export function drawKeelHeld(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  cfg: SimConfig,
  s: KeelState,
  segs: Seg[],
  time: number,
): void {
  const count = keelChordCount(cfg, s);
  if (count === null) return;
  for (const seat of [1, 2] as const) {
    const end = segs[keelEndSeg(s, seat)];
    if (end === undefined) continue;
    const c = keelRingCircle(l, end.centre);
    if (s.held[seat - 1]) drawMarkHeld(ctx, c.x, c.y, c.r, time);
    drawMarkProgress(ctx, c.x, c.y, c.r * MARK_PROGRESS_R, count.share, count.segments);
  }
}

/** Over the rings: the partner's ring and clock on each asking mark this screen does not own, and every segment's verdict. */
export function drawKeelVerdicts(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  cfg: SimConfig,
  s: KeelState,
  segs: Seg[],
  time: number,
  v: GripVerdicts,
): void {
  for (const [c, seat] of asking(l, cfg, s, segs)) {
    if (seat === null || mine(l.role, seat)) continue;
    drawMarkTheirs(ctx, c.x, c.y, c.r, time);
    drawMarkWait(ctx, c.x, c.y, c.r, time);
  }
  segs.forEach((g, k) => {
    const verdict = v.at(k);
    if (verdict === null) return;
    const c = keelRingCircle(l, g.centre);
    drawVerdictRing(ctx, c.x, c.y, c.r, verdict);
  });
}
