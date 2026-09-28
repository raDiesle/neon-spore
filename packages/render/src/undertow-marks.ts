import {
  type SimConfig,
  type SimEvent,
  type UndertowState,
  undertowFreeAsks,
  undertowPinAsks,
} from "@neon-spore/sim";
import { drawVerdictRing, GripVerdicts } from "./grip-verdict.js";
import type { Circle, Layout } from "./layout.js";
import { drawMarkHalo, drawMarkTheirs, drawMarkWait } from "./mark-feedback.js";
import { undertowFreeCircle, undertowPinCircle } from "./undertow-grip-place.js";

/**
 * **THE UNDERTOW's pin and free answering a touch the way every mark does**
 * (`mark-feedback.ts`, `grip-verdict.ts`; the owner, 27 September 2026: *the
 * consistent visual across all waves*).
 *
 * Both rings are the navigator's, and whether each asks is the simulation's
 * (`sim/undertow-hand.ts` `undertowPinAsks`, `undertowFreeAsks`). The halo
 * stands under each on her screen while it asks: every lobe she may pin and is
 * not pinning, and his column while he is unseated and her thumb is off it.
 *
 * **The partner's clock stands on the free alone, on his screen.** He is
 * stuck, every verb refused, until she hauls the plate off him — the one wait
 * in this fight that is one seat's on the other. The pins get none: his screen
 * is shown the pin she has made and never the ones she could
 * (`undertow-grip.ts`), and nobody waits on a pin.
 *
 * The verdicts come last, over everything: the green of a pin taking
 * (`undertowPinned` on) and of the seat given back (`undertowFreed`), and the
 * red of his press on her free (`undertowRefuse`). Keys are the lobe's column
 * for a pin and `FREE` for the free. Held in `UndertowFx`, the boss's own
 * (`undertow-fx.ts`).
 */
export class UndertowMarks {
  /** Was the last touch on each ring right. */
  readonly verdicts = new GripVerdicts();

  ingest(events: readonly SimEvent[]): void {
    for (const e of events) {
      if (e.type === "undertowPinned" && e.on) this.verdicts.mark(e.col, true);
      if (e.type === "undertowFreed") this.verdicts.mark(FREE, true);
      if (e.type === "undertowRefuse") this.verdicts.mark(FREE, false);
    }
  }

  update(dt: number): void {
    this.verdicts.update(dt);
  }

  clear(): void {
    this.verdicts.clear();
  }
}

/** The free's key: no column, since the world knows which one he is in. */
const FREE = -1;

const halo = (ctx: CanvasRenderingContext2D, c: Circle, time: number): void =>
  drawMarkHalo(ctx, c.x, c.y, c.r, time);

/** The asking, drawn under the rings (`undertow-grip.ts`). */
export function drawUndertowAsked(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  cfg: SimConfig,
  u: UndertowState,
  beat: number,
  cannonCol: number,
  time: number,
): void {
  const hers = l.role !== "p1";
  if (hers) {
    for (const b of u.breaches) {
      if (undertowPinAsks(u, b.col)) halo(ctx, undertowPinCircle(l, cfg, b.col), time);
    }
  }
  if (!undertowFreeAsks(u, beat)) return;
  const c = undertowFreeCircle(l, cfg, cannonCol);
  if (hers) {
    halo(ctx, c, time);
  } else {
    drawMarkTheirs(ctx, c.x, c.y, c.r, time);
    drawMarkWait(ctx, c.x, c.y, c.r, time);
  }
}

/**
 * The verdict round each ring, last of all. Not held to the ring still
 * standing: the free ends his wait on the very tick it lands, and that green
 * is the one worth seeing.
 */
export function drawUndertowVerdicts(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  cfg: SimConfig,
  cannonCol: number,
  verdicts: GripVerdicts,
): void {
  for (let col = 0; col < cfg.cols; col++) {
    const v = verdicts.at(col);
    if (v === null) continue;
    const at = undertowPinCircle(l, cfg, col);
    drawVerdictRing(ctx, at.x, at.y, at.r, v);
  }
  const free = verdicts.at(FREE);
  if (free === null) return;
  const at = undertowFreeCircle(l, cfg, cannonCol);
  drawVerdictRing(ctx, at.x, at.y, at.r, free);
}
