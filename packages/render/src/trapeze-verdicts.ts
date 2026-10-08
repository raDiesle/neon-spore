import {
  type SimConfig,
  type SimEvent,
  type TrapezeState,
  trapezeCaller,
  trapezeLitStep,
  trapezeLocked,
  trapezeOpenZone,
} from "@neon-spore/sim";
import { drawVerdictRing, GripVerdicts } from "./grip-verdict.js";
import { type Layout, seatOf } from "./layout.js";
import { drawMarkHalo, drawMarkTheirs, drawMarkWait } from "./mark-feedback.js";
import { trapezeAlienCircle, trapezeZoneCircle } from "./trapeze-grip.js";

/**
 * **THE TRAPEZE's marks answering a touch the way every mark does**
 * (`mark-feedback.ts`, `grip-verdict.ts`; the owner, 27 September 2026: *the
 * consistent visual across all waves*).
 *
 * Three marks, the places a thumb answers it (`trapeze-grip.ts`): **the left
 * zone** and **the right zone**, each asking the seat that pushes there while
 * it is open (`trapezeOpenZone`, `trapezeCaller`), and **the alien**, asking
 * the pilot for the tap in a lock level until the cannon is locked. The alien
 * wears the halo on the pilot's screen and the partner's ring and clock on the
 * navigator's; a zone lights itself instead (`trapeze-marks.ts`), and only its
 * verdict is drawn here.
 *
 * A push greens its zone and a brake or a refused swipe reddens it; a shot
 * that pushes greens the alien and one that slows it reddens it, and the lock
 * greens it too. Held in `TrapezeFx` (`trapeze-fx.ts`). Everything here is in
 * canvas pixels.
 */
export const TRAPEZE_LEFT_MARK = 0;
export const TRAPEZE_RIGHT_MARK = 1;
export const TRAPEZE_ALIEN_MARK = 2;
/** A zone's verdict ring, in tiles. */
const ZONE_VERDICT = 0.9;

export class TrapezeVerdicts {
  /** Was the last touch on each mark right. */
  readonly verdicts = new GripVerdicts();

  ingest(events: readonly SimEvent[]): void {
    for (const e of events) {
      if (e.type === "trapezePush" || e.type === "trapezeBrake" || e.type === "trapezeWhiff")
        this.verdicts.mark(
          e.zone < 0 ? TRAPEZE_LEFT_MARK : TRAPEZE_RIGHT_MARK,
          e.type === "trapezePush",
        );
      else if (e.type === "trapezeShot") this.verdicts.mark(TRAPEZE_ALIEN_MARK, e.gain);
      else if (e.type === "trapezeLock") this.verdicts.mark(TRAPEZE_ALIEN_MARK, true);
    }
  }

  update(dt: number): void {
    this.verdicts.update(dt);
  }

  clear(): void {
    this.verdicts.clear();
  }
}

/** The seat a mark asks this frame, 1 or 2, or null for none. */
export function trapezeMarkAsks(cfg: SimConfig, s: TrapezeState, mark: number): 1 | 2 | null {
  if (mark === TRAPEZE_ALIEN_MARK)
    return trapezeLitStep(s)?.ask === "lock" && !trapezeLocked(s) ? 1 : null;
  const side = mark === TRAPEZE_LEFT_MARK ? -1 : 1;
  if (trapezeOpenZone(cfg, s) !== side) return null;
  return trapezeCaller(s, side) === 0 ? 1 : 2;
}

/**
 * At `fade`: the halo on each mark that asks this screen, the partner's ring
 * and clock on each that asks only them, and every verdict still showing.
 */
export function drawTrapezeMarkFeedback(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  cfg: SimConfig,
  s: TrapezeState,
  time: number,
  fade: number,
  v: TrapezeVerdicts,
): void {
  const marks = [
    trapezeZoneCircle(l, cfg, s, -1),
    trapezeZoneCircle(l, cfg, s, 1),
    trapezeAlienCircle(l, cfg, s),
  ];
  const before = ctx.globalAlpha;
  marks.forEach((c, mark) => {
    if (c === null) return;
    ctx.globalAlpha = fade;
    // A zone's own light is its halo (`trapeze-marks.ts`): a second one in it would be two pictures for one ask.
    const seat = mark === TRAPEZE_ALIEN_MARK ? trapezeMarkAsks(cfg, s, mark) : null;
    const mine = seat !== null && (l.role === "test" || seatOf(l.role) === seat);
    if (mine) drawMarkHalo(ctx, c.x, c.y, c.r, time);
    else if (seat !== null) {
      drawMarkTheirs(ctx, c.x, c.y, c.r, time);
      drawMarkWait(ctx, c.x, c.y, c.r, time);
    }
    const verdict = v.verdicts.at(mark);
    // A zone is half the field: its verdict is a ring the size of a thumb in its middle, not a disc over the zone.
    const r = mark === TRAPEZE_ALIEN_MARK ? c.r : Math.min(c.r, ZONE_VERDICT * l.tile);
    if (verdict !== null) drawVerdictRing(ctx, c.x, c.y, r, verdict);
  });
  ctx.globalAlpha = before;
}
