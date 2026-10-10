import {
  type ScoutState,
  type SimConfig,
  type SimEvent,
  scoutLineAsks,
  scoutNavigator,
  scoutPilot,
  scoutPrimeAsks,
} from "@neon-spore/sim";
import { drawVerdictRing, GripVerdicts } from "./grip-verdict.js";
import type { Circle, Layout } from "./layout.js";
import { drawMarkHalo, drawMarkTheirs, drawMarkWait } from "./mark-feedback.js";
import { scoutLineCircle, scoutPrimeCircle } from "./scout-grip.js";

/**
 * **THE SCOUT's line and prime answering a touch the way every mark does**
 * (`mark-feedback.ts`, `grip-verdict.ts`; the owner, 27 September 2026: *the
 * consistent visual across all waves*).
 *
 * Whether each is asked is the simulation's (`sim/scout-hand.ts`
 * `scoutLineAsks`, `scoutPrimeAsks`), and whose it is never changes: the line
 * is the navigator's and the prime the pilot's. The halo stands under this
 * seat's ring while it is asked — the line until her thumb is down, the prime
 * until a window is running, and again the moment it runs out.
 *
 * **The partner's clock stands on the prime alone.** The ship will not answer
 * the burn she is about to ask for until he primes it, so she is waiting on
 * him; nobody waits on the line, which is hers to put on *when* she chooses,
 * and a clock over the middle of the pilot's own little ship would be the
 * hole `scout-grip.ts` took out of it on 22 September 2026.
 *
 * The verdicts come last, over everything: the green of the line going on
 * (`scoutReel`) and of the prime (`scoutPrime`), and the red of a press from
 * the seat the ring is not (`scoutRefuse`). Keys are 0 for the line and 1 for
 * the prime. A round, so fed by the takeover (`effects-round-marks.ts`).
 */
export class ScoutMarks {
  /** Was the last touch on each ring right. */
  readonly verdicts = new GripVerdicts();

  ingest(events: readonly SimEvent[]): void {
    for (const e of events) {
      if (e.type === "scoutReel") this.verdicts.mark(LINE, true);
      if (e.type === "scoutPrime") this.verdicts.mark(PRIME, true);
      if (e.type === "scoutRefuse") this.verdicts.mark(e.part === "line" ? LINE : PRIME, false);
    }
  }

  update(dt: number): void {
    this.verdicts.update(dt);
  }

  clear(): void {
    this.verdicts.clear();
  }
}

const LINE = 0;
const PRIME = 1;

/** Whether this screen's seat is `seat` — the test screen is both. */
const mine = (l: Layout, seat: 1 | 2): boolean =>
  l.role === "test" || (l.role === "p1") === (seat === 1);

/** The asking, drawn under the two rings. */
export function drawScoutAsked(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  cfg: SimConfig,
  scout: ScoutState,
  time: number,
): void {
  if (scoutLineAsks(cfg, scout) && mine(l, scoutNavigator(scout)))
    halo(ctx, scoutLineCircle(l, cfg, scout), time);
  if (!scoutPrimeAsks(cfg, scout)) return;
  const c = scoutPrimeCircle(l, cfg, scout);
  if (mine(l, scoutPilot(scout))) {
    halo(ctx, c, time);
  } else {
    drawMarkTheirs(ctx, c.x, c.y, c.r, time);
    drawMarkWait(ctx, c.x, c.y, c.r, time);
  }
}

const halo = (ctx: CanvasRenderingContext2D, c: Circle, time: number): void =>
  drawMarkHalo(ctx, c.x, c.y, c.r, time);

/** The verdict round each ring, last of all — and none outside the play. */
export function drawScoutVerdicts(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  cfg: SimConfig,
  scout: ScoutState,
  verdicts: GripVerdicts,
): void {
  if (scout.phase !== "play") return;
  const rings = [scoutLineCircle(l, cfg, scout), scoutPrimeCircle(l, cfg, scout)];
  rings.forEach((c, key) => {
    const v = verdicts.at(key);
    if (v !== null) drawVerdictRing(ctx, c.x, c.y, c.r, v);
  });
}
