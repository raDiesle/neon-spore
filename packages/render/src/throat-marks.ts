import {
  type SimConfig,
  type SimEvent,
  type ThroatState,
  throatRingAsks,
  throatTubeAsks,
} from "@neon-spore/sim";
import { drawVerdictRing, GripVerdicts } from "./grip-verdict.js";
import type { Circle, Layout } from "./layout.js";
import { drawMarkHalo } from "./mark-feedback.js";
import { throatRingCircle, throatTubeCircle } from "./throat-grip.js";

/**
 * **THE THROAT's ring and tube answering a touch the way every mark does**
 * (`mark-feedback.ts`, `grip-verdict.ts`; the owner, 27 September 2026: *the
 * consistent visual across all waves*).
 *
 * Whether each is asked is the simulation's (`sim/throat-hand.ts`
 * `throatRingAsks`, `throatTubeAsks`), and whose it is never changes: the ring
 * is the navigator's and the tube the pilot's. The halo stands under this
 * seat's ring while it asks — the ring until her thumb is on it, the tube
 * until a carry has been given.
 *
 * **No partner's clock.** Both are a seat's own bargain, taken when that seat
 * chooses: the gullet goes on breathing whether or not she pinches, and the
 * mouth goes on inhaling whether or not he hauls. Nobody is waiting on either.
 *
 * The verdicts come last, over everything: the green of a cinch
 * (`throatCinch`) and of a haul (`throatHaul`), and the red of a press from the
 * seat the ring is not (`throatRefuse`). Keys are 0 for the ring and 1 for the
 * tube. Held in `BossBlows`, the fx class of the bosses with none of their own
 * (`boss-blows.ts`).
 */
export class ThroatMarks {
  /** Was the last touch on each ring right. */
  readonly verdicts = new GripVerdicts();

  ingest(events: readonly SimEvent[]): void {
    for (const e of events) {
      if (e.type === "throatCinch") this.verdicts.mark(RING, true);
      if (e.type === "throatHaul") this.verdicts.mark(TUBE, true);
      if (e.type === "throatRefuse") this.verdicts.mark(e.part === "ring" ? RING : TUBE, false);
    }
  }

  update(dt: number): void {
    this.verdicts.update(dt);
  }

  clear(): void {
    this.verdicts.clear();
  }
}

const RING = 0;
const TUBE = 1;

/** Whether this screen's seat is `seat` — the test screen is both. */
const mine = (l: Layout, seat: 1 | 2): boolean =>
  l.role === "test" || (l.role === "p1") === (seat === 1);

const halo = (ctx: CanvasRenderingContext2D, c: Circle, time: number): void =>
  drawMarkHalo(ctx, c.x, c.y, c.r, time);

/** The asking, drawn under the two rings (`throat-draw.ts`). */
export function drawThroatAsked(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  cfg: SimConfig,
  b: ThroatState,
  beat: number,
  beatPhase: number,
  time: number,
): void {
  if (throatRingAsks(b) && mine(l, 2)) {
    const c = throatRingCircle(l, cfg, b, beat, beatPhase);
    if (c !== null) halo(ctx, c, time);
  }
  if (throatTubeAsks(b) && mine(l, 1))
    halo(ctx, throatTubeCircle(l, cfg, b, beat, beatPhase), time);
}

/**
 * The verdict round each ring, last of all — and none once the tube everts,
 * where neither ring is drawn. Not held to the ring still asking: a cinch and a
 * haul both stop it asking on the very tick they are made, and that green is
 * the one worth seeing.
 */
export function drawThroatVerdicts(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  cfg: SimConfig,
  b: ThroatState,
  beat: number,
  beatPhase: number,
  verdicts: GripVerdicts,
): void {
  if (b.phase === "everts") return;
  const ring = verdicts.at(RING);
  const at = ring === null ? null : throatRingCircle(l, cfg, b, beat, beatPhase);
  if (ring !== null && at !== null) drawVerdictRing(ctx, at.x, at.y, at.r, ring);
  const tube = verdicts.at(TUBE);
  if (tube === null) return;
  const c = throatTubeCircle(l, cfg, b, beat, beatPhase);
  drawVerdictRing(ctx, c.x, c.y, c.r, tube);
}
