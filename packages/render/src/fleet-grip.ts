import { type FleetShip, type FleetState, shipCol, shipRow } from "@neon-spore/sim";
import { type Chart, chartFor, chartX, chartY } from "./fleet-chart.js";
import { type Circle, hitCircle, type Layout } from "./layout.js";
import type { Field, Touch } from "./touch.js";
import { bossOf } from "./touch-field.js";

/**
 * **THE FLEET's three thumbs on the chart** — the plume, the rake and the
 * wreck — as one picture and one hit test.
 *
 * The hunt is a panel fight: arrows and a trigger, and nothing on the water
 * answers a finger. The two states after it are the opposite, and they are
 * the reason this file exists (`sim/fleet-hand.ts`, `docs/spec/bosses.md`
 * 11.6). A shell that finds a hull *holes* it; from that beat until the window
 * runs out the navigator's thumb on the plume keeps the hole open while the
 * pilot's thumb rakes the hull square by square, and when the hull is raked
 * end to end the seats change hands — his thumb stays where it is and hers
 * drags the wreck under.
 *
 * **All three rest on one circle: the holed square.** Not three handles in
 * three places — one wound, which both of them are looking at, and what a
 * seat may do to it is the round's state. That is what makes the hand-over
 * legible: nothing moves on the chart when `flood` becomes `wreck`, and each
 * of them simply finds a different word under the same ring.
 *
 * **One ring stands on any one screen**, because the seats split by state:
 * under `flood` the plume is hers and the rake is his, under `wreck` the
 * wreck is hers and the hold is his, and the two are never on the same phone.
 * So each screen draws its own word only. The other seat's word is not said
 * here the way `handle-draw.ts` says it elsewhere — the square would carry
 * two of them at once, and the plume standing on both screens already tells
 * each of them what the other is working on.
 *
 * **The pilot grabs anywhere along the holed hull, not only the hole.** The
 * rake is a carry down a ship, and a carry that has to start in one square is
 * a carry that begins by missing. The hold's origin is the hole's centre
 * rather than the grab, so the square the simulation reads is the square his
 * thumb is actually over (`fleetRake` adds whole tiles to `holeCol`), and the
 * press itself reports the offset rather than nought — the first tick is
 * honest.
 *
 * What is drawn on the wound is `fleet-grip-draw.ts` next door, along the
 * words: the picture is longer than the three touches and neither half needs
 * to be read to follow the other.
 */

/** The wound's circle, as a share of a square. Big enough for a thumb, inside its square. */
const HOLE_R = 0.34;

/** How much of a square past the hull a thumb still counts as on it. */
const HULL_SLOP = 0.3;

/** The holed square, where every one of the three thumbs goes. */
export function fleetHoleCircle(c: Chart, b: FleetState): Circle {
  return { x: chartX(c, b.holeCol), y: chartY(c, b.holeRow), r: c.tile * HOLE_R };
}

/** The grip ring, a shade proud of the wound. Read by the drawing next door. */
export const FLEET_RING_MUL = 1.1;

/**
 * Where a seat's ring stands: on the wound, except that the pilot's has gone
 * wherever his thumb has — which is the square being struck, and the one thing
 * on his screen that says the rake is landing where he means it to.
 *
 * Geometry rather than picture, so it lives here with the wound's own circle
 * and `test/fleet-grip.test.ts` can ask where the ring is without counting
 * canvas calls (`fleet-grip-draw.ts` draws it).
 */
export function fleetRingCentre(c: Chart, b: FleetState, seat: 1 | 2): { x: number; y: number } {
  const hole = fleetHoleCircle(c, b);
  if (seat !== 1 || !b.rakeOn || b.rakeCol < 0 || b.rakeRow < 0) return { x: hole.x, y: hole.y };
  return { x: chartX(c, b.rakeCol), y: chartY(c, b.rakeRow) };
}

/** How far under the water the wreck has been dragged, in pixels, this frame. */
export function fleetWreckPull(c: Chart, b: FleetState): number {
  return b.phase === "wreck" ? (b.wreckPullMilli * c.tile) / 1000 : 0;
}

/** The holed hull's own rectangle, which is what the pilot's thumb may land on. */
function hullBox(c: Chart, ship: FleetShip): { x: number; y: number; w: number; h: number } {
  const last = ship.len - 1;
  const x = chartX(c, ship.col) - c.tile / 2;
  const y = chartY(c, ship.row) - c.tile / 2;
  return {
    x,
    y,
    w: chartX(c, shipCol(ship, last)) + c.tile / 2 - x,
    h: chartY(c, shipRow(ship, last)) + c.tile / 2 - y,
  };
}

/**
 * THE FLEET's chart as a control, or nothing at all while it is hunting.
 *
 * Seat and state together pick at most one of the three, so this is a chain
 * rather than a decision: the navigator's two are a state apart and the
 * pilot's is the only one on his phone.
 */
export function fleetGripUnder(l: Layout, x: number, y: number, field: Field): Touch | null {
  const b = bossOf(field, "fleet");
  if (b === null || b.phase === "hunt") return null;
  // The live screen, where nothing stands over the top: a hit test is never
  // asked about a rehearsal's film (`chartFor`).
  const c = chartFor(l, field.cfg);
  if (c.tile <= 0) return null;
  const hole = fleetHoleCircle(c, b);
  if (field.seat === 2) {
    if (!hitCircle(hole, x, y)) return null;
    return b.phase === "flood" ? breachTouch(x, y) : wreckTouch(x, y);
  }
  return rakeTouch(c, b, hole, x, y);
}

/** The navigator's thumb on the plume: on and off, and where on it says nothing. */
function breachTouch(x: number, y: number): Touch {
  const target = "fleetBreach";
  return {
    player: 2,
    command: { kind: "drag", target, on: true, fromMilli: 0, fromYMilli: 0 },
    hold: { kind: "drag", target, player: 2, originX: x, originY: y },
  };
}

/** Her thumb on the wreck: the origin is the grab, and the pull is how far down it has come. */
function wreckTouch(x: number, y: number): Touch {
  const target = "fleetWreck";
  return {
    player: 2,
    command: { kind: "drag", target, on: true, fromMilli: 0, fromYMilli: 0 },
    hold: { kind: "drag", target, player: 2, originX: x, originY: y },
  };
}

/** His thumb anywhere on the holed hull, measured from the hole and not from the grab. */
function rakeTouch(c: Chart, b: FleetState, hole: Circle, x: number, y: number): Touch | null {
  const ship = b.ships[b.holed];
  if (ship === undefined) return null;
  const box = hullBox(c, ship);
  const slop = c.tile * HULL_SLOP;
  if (x < box.x - slop || x > box.x + box.w + slop) return null;
  if (y < box.y - slop || y > box.y + box.h + slop) return null;
  const target = "fleetRake";
  return {
    player: 1,
    command: {
      kind: "drag",
      target,
      on: true,
      fromMilli: Math.round(((x - hole.x) * 1000) / c.tile),
      fromYMilli: Math.round(((y - hole.y) * 1000) / c.tile),
    },
    hold: { kind: "drag", target, player: 1, originX: hole.x, originY: hole.y },
  };
}
