import { NO_CATCH, type RatchetState, type SimConfig } from "@neon-spore/sim";
import { handleRadius } from "./handle-draw.js";
import { type Circle, hitCircle, type Layout } from "./layout.js";
import { ratchetBarAt, ratchetPawl } from "./ratchet-shape.js";
import type { Field, Touch } from "./touch.js";
import { bossOf } from "./touch-field.js";
import { showsRatchetCatch, showsRatchetPawl } from "./view-role-clocks-c.js";

/**
 * **The two thumbs on THE RATCHET**: half two of the look lane, and the half
 * that makes the rack answer a hand at all.
 *
 * Its own page beside `ratchet-parts.ts` for `hasp-grip.ts`' reason: the bar
 * and the pad a finger is answered at are the same `ratchetBarAt` and
 * `ratchetPawl` the drawing paints, and all this file adds is *whether* the
 * press counts. A seat is answered on its own half and on no other, the
 * split the drawing keeps (`showsRatchetCatch`, `showsRatchetPawl`), and the
 * simulation refuses the wrong seat regardless (`sim/ratchet-hand.ts`).
 *
 * **The catch is carried; the pawl is pressed.** Her press is the bar at the
 * top of its rail and every move after it a depth down the rail in
 * thousandths of a tile, which is the rail's own length (`ratchetCatchRail`),
 * so the bar stays under the thumb. His press is the pad on the pawl's pivot,
 * and the simulation reads only the tick it goes down: moves after it send
 * the same `on` again and are ignored as a thumb still on the glass.
 *
 * **Both take a hand in every phase but the two ends.** The simulation
 * refuses the catch once the rack is open or jammed, and the drawing takes
 * the rail away then. The pawl takes a press in the still and the climb as
 * well as the lit window. A press there spends nothing, but it is swallowed
 * here rather than falling through to a cannon behind the pad.
 */

/** Whether the rack will take a hand at all: every phase but the open and the jam. */
export function ratchetTakesHand(s: RatchetState): boolean {
  return s.phase !== "open" && s.phase !== "jam";
}

/**
 * The catch's bar where it stands: at the top of its rail with no hand on
 * it, and at the thumb's depth with one. The top is what a press is answered
 * at, because by the time a hand has carried it anywhere the pointer is
 * captured and nothing is hit-tested again (`handles.ts`).
 */
export function ratchetCatchCircle(l: Layout, cfg: SimConfig, s: RatchetState): Circle {
  const bar = ratchetBarAt(l, cfg, s.catchMilli === NO_CATCH ? 0 : s.catchMilli);
  return { x: bar.x, y: bar.y, r: handleRadius(l, cfg) };
}

/** The pad on the pawl's pivot, which does not move. */
export function ratchetPadCircle(l: Layout, cfg: SimConfig): Circle {
  const pad = ratchetPawl(l, cfg);
  return { x: pad.x, y: pad.y, r: handleRadius(l, cfg) };
}

/**
 * The navigator's press on the catch. `bossOf(field, "ratchet")` is `null` on
 * every wave without the rack, and the press then falls through as if no rail
 * were drawn. The grab reports no depth: the catch is a level, and a hand
 * that landed already reporting one would be holding by touching.
 */
export function ratchetCatchUnder(l: Layout, x: number, y: number, field: Field): Touch | null {
  const s = bossOf(field, "ratchet");
  if (s === null || field.seat !== 2 || !showsRatchetCatch(l.role) || !ratchetTakesHand(s)) {
    return null;
  }
  const top = ratchetCatchCircle(l, field.cfg, { ...s, catchMilli: NO_CATCH });
  if (!hitCircle(top, x, y)) return null;
  return {
    player: 2,
    command: { kind: "drag", target: "ratchetCatch", on: true, fromMilli: 0, fromYMilli: 0 },
    hold: { kind: "drag", target: "ratchetCatch", player: 2, originX: x, originY: y },
  };
}

/** The pilot's press on the pad. The lift is what lets the next press count (`sim/ratchet-hand.ts`). */
export function ratchetPawlUnder(l: Layout, x: number, y: number, field: Field): Touch | null {
  const s = bossOf(field, "ratchet");
  if (s === null || field.seat !== 1 || !showsRatchetPawl(l.role) || !ratchetTakesHand(s)) {
    return null;
  }
  if (!hitCircle(ratchetPadCircle(l, field.cfg), x, y)) return null;
  return {
    player: 1,
    command: { kind: "drag", target: "ratchetPawl", on: true, fromMilli: 0 },
    hold: { kind: "drag", target: "ratchetPawl", player: 1, originX: x, originY: y },
  };
}
