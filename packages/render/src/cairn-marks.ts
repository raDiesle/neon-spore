import { type Creature, gripsCreature, type SimEvent, type World } from "@neon-spore/sim";
import { pileRing } from "./cairn-hand.js";
import { drawVerdictRing, GripVerdicts } from "./grip-verdict.js";
import type { Layout } from "./layout.js";

/**
 * **THE CAIRN's pile answering a touch the way every mark does**
 * (`grip-verdict.ts`; the owner, 27 September 2026: *the consistent visual
 * across all waves*).
 *
 * The pile's mark is the ring a hand closes on it (`cairn-hand.ts`), and it
 * is **drawn only while a thumb is down** — the pile is the body, and every
 * body on the field is a thing a thumb may take — so there is no open mark to
 * halo before the touch, and nobody waits on a partner's. Either seat may take
 * it and one is as good as two (`sim/cairn-hold.ts` `cairnHeldNow`), so no
 * thumb on it is the wrong one and nothing is refused.
 *
 * What is left is the verdict, and the pile gives two: **a unit hauled out**
 * (`cairnPulled`), and **a beat bought off the clock** (`cairnHeld`), which the
 * simulation says every beat the hold lasts — so a thumb resting on the pile
 * is washed green once a beat while it is buying, and the green stops the
 * beat the hold runs out. One ring, so one key. Held in `BossBlows`, the fx
 * class of the bosses with none of their own (`boss-blows.ts`).
 */
export class CairnMarks {
  /** Was the last touch on the pile right. */
  readonly verdicts = new GripVerdicts();

  ingest(events: readonly SimEvent[]): void {
    for (const e of events) {
      if (e.type === "cairnPulled" || e.type === "cairnHeld") this.verdicts.mark(PILE, true);
    }
  }

  update(dt: number): void {
    this.verdicts.update(dt);
  }

  clear(): void {
    this.verdicts.clear();
  }
}

const PILE = 0;

/** The verdict round the pile's ring, over it — and only while a hand is on
 * the pile, since the ring it stands on is only drawn then. */
export function drawCairnVerdict(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  body: Creature,
  units: number,
  time: number,
  hush: number,
  verdicts: GripVerdicts,
): void {
  const v = verdicts.at(PILE);
  if (v === null || l.tile <= 0) return;
  if (!gripsCreature(world, 1, body.id) && !gripsCreature(world, 2, body.id)) return;
  const ring = pileRing(l, body, units, time, hush);
  if (ring !== null) drawVerdictRing(ctx, ring.x, ring.y, ring.r, v);
}
