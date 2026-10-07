import { type SimEvent, type SurgeState, surgeAsks, type World } from "@neon-spore/sim";
import { drawVerdictRing, GripVerdicts } from "./grip-verdict.js";
import type { Layout } from "./layout.js";
import { drawMarkHalo, drawMarkTheirs, drawMarkWait } from "./mark-feedback.js";
import { surgeGripCircle, surgeGripSeat } from "./surge-grip.js";
import type { Point } from "./surge-shape.js";
import { seatOf } from "./view-role.js";

/**
 * **THE SURGE's two grip marks answering a touch the way every mark does**
 * (`mark-feedback.ts`, `grip-verdict.ts`; the owner, 27 September 2026: *the
 * consistent visual across all waves*).
 *
 * Whether a seat's thumb is asked for is the simulation's (`sim/surge.ts`
 * `surgeAsks`) — the moment its mark's word says `HOLD` (`surge-word.ts`).
 * Both marks are drawn on both screens (`surge-grip.ts`), so it is THE VANE's
 * case: a mark asking its own seat wears the halo under it, and one asking
 * the partner their ring and the clock — *not your thumb, theirs*.
 *
 * **Nothing is refused**, which no boss before it could say: the bulb is one
 * target for both seats and answers either thumb anywhere on it
 * (`sim/surge-hand.ts`), so no seat's press is ever on the other's handle.
 *
 * The verdicts come last, on every screen, and the lift is judged on both
 * marks because it takes both thumbs: a thumb landing washes its own mark
 * green (`surgeGrip`), a lift together inside the band both green
 * (`surgeVent`, `surgeEvert`), and a lift apart or short of it, or past it,
 * both red (`surgeLost`, `surgeBurst`). Keyed by the mark's seat.
 *
 * Held in `SurgeFx`, the boss's own (`surge-fx.ts`).
 */
export class SurgeMarks {
  /** Was the last touch on each seat's mark right. */
  readonly verdicts = new GripVerdicts();

  ingest(events: readonly SimEvent[]): void {
    for (const e of events) {
      if (e.type === "surgeGrip") this.verdicts.mark(e.player, true);
      if (e.type === "surgeVent" || e.type === "surgeEvert") this.both(true);
      if (e.type === "surgeLost" || e.type === "surgeBurst") this.both(false);
    }
  }

  update(dt: number): void {
    this.verdicts.update(dt);
  }

  clear(): void {
    this.verdicts.clear();
  }

  private both(good: boolean): void {
    this.verdicts.mark(1, good);
    this.verdicts.mark(2, good);
  }
}

/** The asking, drawn under the grip marks on the bulb as it is drawn this frame. */
export function drawSurgeAsked(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  s: SurgeState,
  c: Point,
  rx: number,
  ry: number,
  time: number,
  roll = 0,
): void {
  const seat = seatOf(l.role);
  for (const side of [-1, 1] as const) {
    const owner = surgeGripSeat(side);
    if (!surgeAsks(s, world, owner)) continue;
    const at = surgeGripCircle(l, world.cfg, c, rx, ry, side, roll);
    if (owner === seat) {
      drawMarkHalo(ctx, at.x, at.y, at.r, time);
      continue;
    }
    drawMarkTheirs(ctx, at.x, at.y, at.r, time);
    drawMarkWait(ctx, at.x, at.y, at.r, time);
  }
}

/** The verdict round each mark, last of all. */
export function drawSurgeVerdicts(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  c: Point,
  rx: number,
  ry: number,
  verdicts: GripVerdicts,
  roll = 0,
): void {
  for (const side of [-1, 1] as const) {
    const v = verdicts.at(surgeGripSeat(side));
    if (v === null) continue;
    const at = surgeGripCircle(l, world.cfg, c, rx, ry, side, roll);
    drawVerdictRing(ctx, at.x, at.y, at.r, v);
  }
}
