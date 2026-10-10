import { type PinballState, pinPlungerAsks, type SimConfig, type SimEvent } from "@neon-spore/sim";
import { drawVerdictRing, GripVerdicts } from "./grip-verdict.js";
import type { Circle, Layout } from "./layout.js";
import { drawMarkHalo, drawMarkTheirs, drawMarkWait } from "./mark-feedback.js";
import { pinAfoot, pinPlungerCircle } from "./pinball-grip.js";

/**
 * **PINBALL's plunger answering a touch the way every mark does**
 * (`mark-feedback.ts`, `grip-verdict.ts`; the owner, 27 September 2026: *the
 * consistent visual across all waves*).
 *
 * Whether it is asked is the simulation's (`sim/pinball-hand.ts`
 * `pinPlungerAsks`), and whose it is never changes: the wind is the pilot's.
 * It is a lift measured on the way up, so nothing in the simulation says a
 * thumb is down, and the halo stands for as long as the plunger is asked —
 * the wind ends the asking. On the driver's screen it wears the partner's
 * turning ring and the clock. The test screen is both seats', so it is its.
 *
 * The verdicts come last, over everything: the green of the wind (`pinWind`)
 * and the red of a press from the driver's seat (`pinRefuse`). The table's
 * shove is ◀ and ▶ on the band since 10 October 2026, and answers there
 * (`pinball-button.ts`). A round, so fed by the takeover
 * (`effects-round-marks.ts`).
 */
export class PinballMarks {
  /** Was the last touch on each part right. */
  readonly verdicts = new GripVerdicts();

  ingest(events: readonly SimEvent[]): void {
    for (const e of events) {
      if (e.type === "pinWind") this.verdicts.mark(PLUNGER, true);
      if (e.type === "pinRefuse") this.verdicts.mark(PLUNGER, false);
    }
  }

  update(dt: number): void {
    this.verdicts.update(dt);
  }

  clear(): void {
    this.verdicts.clear();
  }
}

const PLUNGER = 0;

interface Part {
  key: number;
  c: Circle;
  seat: 1 | 2;
  asked: boolean;
}

/** The one part: where it stands, whose it is, and whether it is asked. */
function parts(l: Layout, cfg: SimConfig, state: PinballState): Part[] {
  return [{ key: PLUNGER, c: pinPlungerCircle(l, cfg), seat: 1, asked: pinPlungerAsks(state) }];
}

/** Whether this screen's seat is the part's — the test screen is both. */
const mine = (l: Layout, seat: 1 | 2): boolean =>
  l.role === "test" || (l.role === "p1") === (seat === 1);

/** The asking, drawn under the ring. */
export function drawPinballAsked(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  cfg: SimConfig,
  state: PinballState,
  time: number,
): void {
  for (const p of parts(l, cfg, state)) {
    if (!p.asked) continue;
    if (mine(l, p.seat)) {
      drawMarkHalo(ctx, p.c.x, p.c.y, p.c.r, time);
    } else {
      drawMarkTheirs(ctx, p.c.x, p.c.y, p.c.r, time);
      drawMarkWait(ctx, p.c.x, p.c.y, p.c.r, time);
    }
  }
}

/** The verdict round the part, last of all — and none outside the play. */
export function drawPinballVerdicts(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  cfg: SimConfig,
  state: PinballState,
  verdicts: GripVerdicts,
): void {
  if (!pinAfoot(state)) return;
  for (const p of parts(l, cfg, state)) {
    const v = verdicts.at(p.key);
    if (v !== null) drawVerdictRing(ctx, p.c.x, p.c.y, p.c.r, v);
  }
}
