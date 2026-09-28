import {
  type SimConfig,
  type SimEvent,
  type TasterState,
  tasterPinnable,
  tasterPryable,
  tasterWipable,
} from "@neon-spore/sim";
import { drawVerdictRing, GripVerdicts } from "./grip-verdict.js";
import type { Circle, Layout } from "./layout.js";
import { drawMarkHalo, drawMarkTheirs, drawMarkWait } from "./mark-feedback.js";
import { tasterBladeCircle, tasterGapCircle, tasterLockCircle } from "./taster-grip.js";
import { seatOf } from "./view-role.js";

/**
 * **THE TASTER's three thumbs answering a touch the way every mark does**
 * (`mark-feedback.ts`, `grip-verdict.ts`; the owner, 27 September 2026: *the
 * consistent visual across all waves*).
 *
 * Whether each is offered is the simulation's (`sim/taster-hand.ts`
 * `tasterPinnable`, `tasterWipable`, `tasterPryable`), and whose it is never
 * changes: the pin and the pry are the pilot's, the wipe the navigator's. All
 * three are drawn on both screens (`taster-grip.ts`), so it is THE VANE's
 * case: the ring offered to this seat wears the halo under it, and the one
 * offered to the partner their ring and the clock — *not your thumb, theirs*.
 *
 * The verdicts come last, on every screen: green for a pin down, a wipe that
 * spent its cut and an interlock carried apart (`tasterPin`, `tasterWipe`,
 * `tasterPry`), red for a press on the other seat's ring
 * (`tasterHandRefuse`). Keyed by the part and its column.
 *
 * Held in `TasterFx`, the boss's own (`taster-fx.ts`).
 */
export class TasterMarks {
  /** Was the last touch on each ring right. */
  readonly verdicts = new GripVerdicts();

  ingest(events: readonly SimEvent[]): void {
    for (const e of events) {
      if (e.type === "tasterPin") this.verdicts.mark(bladeKey(e.col), true);
      if (e.type === "tasterWipe") this.verdicts.mark(gapKey(e.col), true);
      if (e.type === "tasterPry") this.verdicts.mark(LOCK, true);
      if (e.type === "tasterHandRefuse") {
        const key = e.part === "lock" ? LOCK : e.part === "gap" ? gapKey(e.col) : bladeKey(e.col);
        this.verdicts.mark(key, false);
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

/** The keys: a blade's column, a gap's column past every blade, the one lock. */
export const LOCK = -1;
export const bladeKey = (col: number): number => col;
export const gapKey = (col: number): number => 1000 + col;

interface Ring {
  key: number;
  at: Circle;
  seat: 1 | 2;
  offered: boolean;
}

/** Every ring this fan could draw, and whether it is being offered this tick. */
function rings(l: Layout, cfg: SimConfig, t: TasterState, beat: number): Ring[] {
  const out: Ring[] = [
    { key: LOCK, at: tasterLockCircle(l, cfg, t), seat: 1, offered: tasterPryable(t, beat, cfg) },
  ];
  for (let i = 0; i < t.blades.length; i++) {
    const col = t.col + i;
    const blade = tasterBladeCircle(l, cfg, col);
    out.push({ key: bladeKey(col), at: blade, seat: 1, offered: tasterPinnable(t, cfg, i) });
    const gap = tasterGapCircle(l, cfg, col);
    out.push({ key: gapKey(col), at: gap, seat: 2, offered: tasterWipable(t, cfg, i) });
  }
  return out;
}

/** The asking, drawn over the fan and under the grip's rings. */
export function drawTasterAsked(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  cfg: SimConfig,
  t: TasterState,
  beat: number,
  time: number,
): void {
  const seat = seatOf(l.role);
  for (const { at, seat: owner, offered } of rings(l, cfg, t, beat)) {
    if (!offered) continue;
    if (owner === seat) {
      drawMarkHalo(ctx, at.x, at.y, at.r, time);
      continue;
    }
    drawMarkTheirs(ctx, at.x, at.y, at.r, time);
    drawMarkWait(ctx, at.x, at.y, at.r, time);
  }
}

/** The verdict round each ring, last of all, whether it is still offered or not. */
export function drawTasterVerdicts(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  cfg: SimConfig,
  t: TasterState,
  beat: number,
  verdicts: GripVerdicts,
): void {
  for (const { key, at } of rings(l, cfg, t, beat)) {
    const v = verdicts.at(key);
    if (v !== null) drawVerdictRing(ctx, at.x, at.y, at.r, v);
  }
}
