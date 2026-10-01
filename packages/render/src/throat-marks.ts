import type { SimConfig, SimEvent, ThroatState } from "@neon-spore/sim";
import { drawVerdictRing, GripVerdicts } from "./grip-verdict.js";
import type { Circle, Layout } from "./layout.js";
import { drawMarkHalo } from "./mark-feedback.js";
import { throatAimCircle, throatCarrying, throatPumpCircle, throatPumping } from "./throat-grip.js";

/**
 * **THE THROAT's mouth and pump answering a touch the way every mark does**
 * (`mark-feedback.ts`, `grip-verdict.ts`; the owner, 27 September 2026: *the
 * consistent visual across all waves*).
 *
 * Whose each is never changes: the mouth is the navigator's to carry and the
 * pump the pilot's to work (`throat-grip.ts`). The halo stands under this
 * seat's handle while it is free — the mouth until her thumb is on it, the
 * pump until a stroke is under way — for the whole of `sucks`.
 *
 * **No partner's clock.** Both are a seat's own, taken when that seat
 * chooses: the mouth can be carried unpumped and pumped where it stands.
 * Nobody is waiting on either.
 *
 * The verdicts come last, over everything: the green of a swallow on the
 * mouth (`throatSwallow`), and the red of a refusal (`throatRefuse`) on the
 * handle of the seat it names — a body in the wrong colour is the colour's
 * seat's, a colour pressed on the seat it is not is the presser's. Keys are 0
 * for the mouth and 1 for the pump. Held in `BossBlows`, the fx class of the bosses with none of their
 * own (`boss-blows.ts`).
 */
export class ThroatMarks {
  /** Was the last touch on each handle right. */
  readonly verdicts = new GripVerdicts();

  ingest(events: readonly SimEvent[]): void {
    for (const e of events) {
      if (e.type === "throatSwallow") this.verdicts.mark(AIM, true);
      if (e.type === "throatRefuse") this.verdicts.mark(e.player === 1 ? PUMP : AIM, false);
    }
  }

  update(dt: number): void {
    this.verdicts.update(dt);
  }

  clear(): void {
    this.verdicts.clear();
  }
}

const AIM = 0;
const PUMP = 1;

/** Whether this screen's seat is `seat` — the test screen is both. */
const mine = (l: Layout, seat: 1 | 2): boolean =>
  l.role === "test" || (l.role === "p1") === (seat === 1);

const halo = (ctx: CanvasRenderingContext2D, c: Circle, time: number): void =>
  drawMarkHalo(ctx, c.x, c.y, c.r, time);

/** The asking, drawn under the two handles (`throat-draw.ts`). */
export function drawThroatAsked(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  cfg: SimConfig,
  b: ThroatState,
  time: number,
): void {
  if (b.phase !== "sucks") return;
  if (mine(l, 2) && !throatCarrying(b)) halo(ctx, throatAimCircle(l, cfg, b), time);
  if (mine(l, 1) && !throatPumping(b)) halo(ctx, throatPumpCircle(l, cfg), time);
}

/**
 * The verdict round each handle, last of all — and none once the tube everts,
 * where neither is drawn.
 */
export function drawThroatVerdicts(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  cfg: SimConfig,
  b: ThroatState,
  verdicts: GripVerdicts,
): void {
  if (b.phase === "everts") return;
  const aim = verdicts.at(AIM);
  if (aim !== null) {
    const c = throatAimCircle(l, cfg, b);
    drawVerdictRing(ctx, c.x, c.y, c.r, aim);
  }
  const pump = verdicts.at(PUMP);
  if (pump === null) return;
  const c = throatPumpCircle(l, cfg);
  drawVerdictRing(ctx, c.x, c.y, c.r, pump);
}
