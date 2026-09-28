import {
  type PinballState,
  pinPlungerAsks,
  pinTableAsks,
  type SimConfig,
  type SimEvent,
} from "@neon-spore/sim";
import { drawVerdictRing, GripVerdicts } from "./grip-verdict.js";
import type { Circle, Layout } from "./layout.js";
import { drawMarkHalo, drawMarkTheirs, drawMarkWait } from "./mark-feedback.js";
import { pinAfoot, pinPlungerCircle, pinTableCircle } from "./pinball-grip.js";

/**
 * **PINBALL's plunger and table answering a touch the way every mark does**
 * (`mark-feedback.ts`, `grip-verdict.ts`; the owner, 27 September 2026: *the
 * consistent visual across all waves*).
 *
 * Whether each is asked is the simulation's (`sim/pinball-hand.ts`
 * `pinPlungerAsks`, `pinTableAsks`), and whose it is never changes: the wind
 * is the pilot's and the shove the driver's. Both are lifts measured on the
 * way up, so nothing in the simulation says a thumb is down, and the halo
 * stands for as long as the part is asked — the wind ends the asking, and so
 * does the tilt. The part asked of the partner wears their turning ring and
 * the clock. The test screen is both seats', so both are its.
 *
 * The verdicts come last, over everything: the green of the wind and of the
 * shove (`pinWind`, `pinNudge`), and the red of the shove one too many
 * (`pinTilt`), which is her own thumb and the wrong one, and of a press from
 * the seat the part is not asked of (`pinRefuse`). Keys are 0 for the plunger
 * and 1 for the table. A round, so fed by the takeover (`effects-round-marks.ts`).
 */
export class PinballMarks {
  /** Was the last touch on each part right. */
  readonly verdicts = new GripVerdicts();

  ingest(events: readonly SimEvent[]): void {
    for (const e of events) {
      if (e.type === "pinWind") this.verdicts.mark(PLUNGER, true);
      if (e.type === "pinNudge") this.verdicts.mark(TABLE, true);
      if (e.type === "pinTilt") this.verdicts.mark(TABLE, false);
      if (e.type === "pinRefuse") this.verdicts.mark(e.part === "plunger" ? PLUNGER : TABLE, false);
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
const TABLE = 1;

interface Part {
  key: number;
  c: Circle;
  seat: 1 | 2;
  asked: boolean;
}

/** The two parts: where each stands, whose it is, and whether it is asked. */
function parts(l: Layout, cfg: SimConfig, state: PinballState): Part[] {
  return [
    { key: PLUNGER, c: pinPlungerCircle(l, cfg), seat: 1, asked: pinPlungerAsks(state) },
    { key: TABLE, c: pinTableCircle(l, cfg), seat: 2, asked: pinTableAsks(state) },
  ];
}

/** Whether this screen's seat is the part's — the test screen is both. */
const mine = (l: Layout, seat: 1 | 2): boolean =>
  l.role === "test" || (l.role === "p1") === (seat === 1);

/** The asking, drawn under the two rings. */
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

/** The verdict round each part, last of all — and none outside the play. */
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
