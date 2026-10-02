import { type FlueState, flueLitStep, flueTapper, type SimConfig } from "@neon-spore/sim";
import { fieldCol } from "./field-flip.js";
import { flueCentre, flueEmberAt, flueEmberR, flueSlotHalf, flueUnitR } from "./flue-shape.js";
import { hitReach } from "./hit.js";
import { type Circle, colFromX, type Layout } from "./layout.js";
import type { Field, Touch } from "./touch.js";
import { bossOf } from "./touch-field.js";

/**
 * **THE FLUE's tap as a control**: `flueTap`, pressed anywhere along the
 * flue's row while a vent is lit, on both screens and from either seat
 * (`sim/flue-hand.ts`, `docs/spec/bosses.md` §11.57).
 *
 * **The column is the answer**, so the press carries it as `id`: the column
 * the thumb came down over, turned back through `fieldCol` on a turned field.
 * The ember moves between taps, and where the thumb landed is what the
 * simulation judges — on the steady ember's column it lands, anywhere else it
 * skids. The whole row answers rather than the ember's own ring, or a tap a
 * column wide of the ember would fall through to nothing and never be heard
 * to miss.
 *
 * **Either seat's press is sent**, the rester's too: every command either
 * seat sends is heard, and a rester's thumb on the flue costing the taps is
 * the fight's own rule, not a press this file should swallow.
 *
 * **It is an edge**, THE VALVE's pin: the press sends `on: true` and the lift
 * `on: false`, carrying the same `id`, so a thumb left on the glass has to lift
 * and come down again to tap twice.
 */

/** How far above and below the slot a thumb is answered, in unit radii, before `hitReach`. */
const ROW_R = 1;

/** Whether a vent is lit, the only step a tap is for. */
function venting(s: FlueState): boolean {
  return flueLitStep(s)?.ask === "vent";
}

/** Where a thumb is shown to tap while a vent is lit: on the ember, where the simulation holds it. */
export function flueTapCircle(l: Layout, cfg: SimConfig, s: FlueState): Circle | null {
  if (!venting(s)) return null;
  const at = flueEmberAt(l, cfg, s.emberMilli);
  return { x: at.x, y: at.y, r: flueEmberR(l) * 3 };
}

/** Whether a point is on the flue's row, the whole of what a tap answers. */
function onRow(l: Layout, cfg: SimConfig, x: number, y: number): boolean {
  const c = flueCentre(l, cfg);
  const reach = hitReach(ROW_R * flueUnitR(l));
  return Math.abs(y - c.y) <= reach && Math.abs(x - c.x) <= flueSlotHalf(l) + reach;
}

/**
 * **Whose a desk press on the row is** (`desk-grab.ts` `markSeat`): the lit
 * vent's tapper. Both seats' presses answer here, so the test screen's mouse,
 * tried as player 1 first, was the pilot's on every vent — a skid when the
 * navigator was asked to tap, and the rester's stir that costs the taps.
 */
export function flueGripSeat(l: Layout, x: number, y: number, field: Field): 1 | 2 | undefined {
  const s = bossOf(field, "flue");
  if (s === null || !venting(s) || !onRow(l, field.cfg, x, y)) return undefined;
  return flueTapper(s) ?? undefined;
}

export function flueTapUnder(l: Layout, x: number, y: number, field: Field): Touch | null {
  const s = bossOf(field, "flue");
  if (s === null || !venting(s) || !onRow(l, field.cfg, x, y)) return null;
  const col = fieldCol(l, colFromX(l, x));
  return {
    player: field.seat,
    command: { kind: "drag", target: "flueTap", on: true, fromMilli: 0, id: col },
    hold: { kind: "drag", target: "flueTap", player: field.seat, originX: x, originY: y, id: col },
  };
}
