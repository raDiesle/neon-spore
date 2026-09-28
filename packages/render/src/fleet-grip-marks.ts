import type { FleetState, SimEvent, World } from "@neon-spore/sim";
import { chartOf } from "./fleet-chart.js";
import { fleetSeatRing } from "./fleet-grip.js";
import { drawVerdictRing, GripVerdicts } from "./grip-verdict.js";
import type { Layout } from "./layout.js";
import { seatOf } from "./view-role.js";

/**
 * **THE FLEET's wound answering a touch the way every mark does**
 * (`mark-feedback.ts`, `grip-verdict.ts`; the owner, 27 September 2026: *the
 * consistent visual across all waves*).
 *
 * Both thumbs are asked while the wound is open (`sim/fleet-hand.ts`
 * `fleetWoundAsks`): in the flood hers on the plume and his raking the hull,
 * in the wreck his holding it and hers pulling it under. The halo stands under
 * this seat's ring until its thumb is down (`fleet-grip-draw.ts`), and the
 * thumb landing washes that ring green — `fleetBreach` on for hers on the
 * plume, `fleetHold` for his on the hull and for her pull taking.
 *
 * **No partner's ring, clock or red.** Both rings stand on the one circle of
 * the wound, so the partner's would sit inside this seat's own — the reason
 * THE MIRROR draws none there — and neither screen draws the other seat's
 * ring at all, so there is nothing a wrong thumb could land on to be refused.
 * Keys are the seat whose ring it is. Held in `FleetGripFx`, beside the rings
 * the wound throws.
 */
export class FleetGripMarks {
  /** Was the last touch on each seat's ring right. */
  readonly verdicts = new GripVerdicts();

  ingest(events: readonly SimEvent[]): void {
    for (const e of events) {
      if (e.type === "fleetBreach" && e.on) this.verdicts.mark(2, true);
      else if (e.type === "fleetHold") this.verdicts.mark(e.part === "rake" ? 1 : 2, true);
    }
  }

  update(dt: number): void {
    this.verdicts.update(dt);
  }

  clear(): void {
    this.verdicts.clear();
  }
}

/** This seat's verdict round its own ring, last of all the fleet draws. */
export function drawFleetVerdict(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  b: FleetState,
  verdicts: GripVerdicts,
): void {
  if (b.phase === "hunt") return;
  const seat = seatOf(l.role);
  const v = verdicts.at(seat);
  if (v === null) return;
  const c = chartOf(l, world);
  if (c.tile <= 0) return;
  const ring = fleetSeatRing(c, b, seat);
  drawVerdictRing(ctx, ring.x, ring.y, ring.r, v);
}
