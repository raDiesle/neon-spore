import {
  type PulseState,
  pulseBarAsks,
  pulseHeart,
  type SimConfig,
  type SimEvent,
} from "@neon-spore/sim";
import { drawVerdictRing, GripVerdicts } from "./grip-verdict.js";
import type { Layout } from "./layout.js";
import { drawMarkHalo, drawMarkTheirs, drawMarkWait } from "./mark-feedback.js";
import { pulseGripBox } from "./pulse-grip.js";

/**
 * **THE PULSE's bar answering a touch the way every mark does**
 * (`mark-feedback.ts`, `grip-verdict.ts`; the owner, 27 September 2026: *the
 * consistent visual across all waves*).
 *
 * The bar is both seats', and **each seat's mark is its own end of it** — the
 * pilot's the left, the navigator's the right, the ends the caps already light
 * (`pulse-grip.ts`). An end is a circle a handle's radius across, since the
 * box is a handle's height, so the halo, the ring and the clock stand on it as
 * they stand on any ring.
 *
 * Whether an end is asked is the simulation's (`sim/pulse-hand.ts`
 * `pulseBarAsks`): a bar that is not steady and that seat's thumb not on it.
 * The halo stands under this seat's end until its thumb is down. **The
 * partner's clock is drawn only under `arrest`**, and only once this seat is
 * holding — the one moment the round is waiting on the other thumb, which the
 * word BOTH has been saying alone. Under `flutter` one thumb is the whole
 * gesture and nobody is waited on.
 *
 * The thumb landing washes that end green (`pulseBrace`), and both ends go
 * green together when the pair have the bar (`pulseArrest`). **No red**:
 * either seat may take the bar, so there is no wrong thumb to refuse, and a
 * steady bar has no mark to land on. Keys are the seat. A round, so fed by the
 * takeover (`effects-round-marks.ts`).
 */
export class PulseMarks {
  /** Was the last touch on each seat's end right. */
  readonly verdicts = new GripVerdicts();

  ingest(events: readonly SimEvent[]): void {
    for (const e of events) {
      if (e.type === "pulseBrace") this.verdicts.mark(e.player, true);
      if (e.type === "pulseArrest") {
        this.verdicts.mark(1, true);
        this.verdicts.mark(2, true);
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

/** Seat `seat`'s end of the bar, as the circle its marks stand on. */
export function pulseEnd(
  l: Layout,
  cfg: SimConfig,
  seat: 1 | 2,
): { x: number; y: number; r: number } {
  const b = pulseGripBox(l, cfg);
  const r = b.h / 2;
  return { x: seat === 1 ? b.x + r : b.x + b.w - r, y: b.y + r, r };
}

/** Whether this screen's seat is `seat` — the test screen is both. */
const mine = (l: Layout, seat: 1 | 2): boolean =>
  l.role === "test" || (l.role === "p1") === (seat === 1);

/** This seat's asked end: the halo, drawn under the bar. */
export function drawPulseHalo(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  cfg: SimConfig,
  state: PulseState,
  time: number,
): void {
  for (const seat of [1, 2] as const) {
    if (!mine(l, seat) || !pulseBarAsks(cfg, state, seat)) continue;
    const c = pulseEnd(l, cfg, seat);
    drawMarkHalo(ctx, c.x, c.y, c.r, time);
  }
}

/** The partner's end under `arrest` while this seat holds: over the bar. */
export function drawPulseWaiting(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  cfg: SimConfig,
  state: PulseState,
  time: number,
): void {
  if (pulseHeart(cfg, state) !== "arrest") return;
  for (const seat of [1, 2] as const) {
    const other: 1 | 2 = seat === 1 ? 2 : 1;
    if (mine(l, seat) || !mine(l, other)) continue;
    if (pulseBarAsks(cfg, state, other) || !pulseBarAsks(cfg, state, seat)) continue;
    const c = pulseEnd(l, cfg, seat);
    drawMarkTheirs(ctx, c.x, c.y, c.r, time);
    drawMarkWait(ctx, c.x, c.y, c.r, time);
  }
}

/**
 * The verdict round each end, last of all, and none outside the count and the
 * play. Not held to the bar being offered: the pair's arrest can lift it to
 * steady on the very beat they took it, and that green is the one worth seeing.
 */
export function drawPulseVerdicts(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  cfg: SimConfig,
  state: PulseState,
  verdicts: GripVerdicts,
): void {
  if (state.phase !== "play" && state.phase !== "count") return;
  for (const seat of [1, 2] as const) {
    const v = verdicts.at(seat);
    if (v === null) continue;
    const c = pulseEnd(l, cfg, seat);
    drawVerdictRing(ctx, c.x, c.y, c.r, v);
  }
}
