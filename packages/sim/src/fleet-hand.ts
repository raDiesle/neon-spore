import { fleetRound } from "./fleet.js";
import { sinkFleetWreck } from "./fleet-flood.js";
import type { FleetState } from "./fleet-state.js";
import type { Command } from "./types.js";
import type { World } from "./world.js";

/**
 * **Three thumbs on THE FLEET's picture**, off the wire, on the tick.
 *
 * The hunt's two controls stay on the panel and in `fleet.ts` — the arrows
 * and the trigger are the fight as it shipped. These are the gestures the
 * second and third states ask for on the chart itself (`fleet-state.ts`, the
 * §6.2 ask), and they are heard here beside THE MAZE's heart and THE WARDEN's
 * eye because a thumb is where it is *now*, on a tick, and a beat only says
 * what that came to (`fleet-flood.ts`).
 *
 * **The seat checks are rules of the simulation**, as they are on the
 * panel: the plume is the navigator's and the rake the pilot's, and the
 * wreck is hers again. A seat's thumb on the other's handle is dropped
 * without a sound — the same silence THE GORGE keeps on a wrong intake.
 *
 * - `fleetBreach` — the navigator's thumb held on the plume. Carries only
 *   `on`; where on the plume it landed says nothing the round wants to know.
 * - `fleetRake` — the pilot's thumb carried along the hull from the hole.
 *   `fromMilli` is how far *across* from where it grabbed and `fromYMilli`
 *   how far *down*, in thousandths of a tile, the way THE SINEW's are read;
 *   the hull's own direction says which of the two is the rake and the
 *   other is ignored, so a thumb drifting off a horizontal hull is still on
 *   it. The square under the thumb is the hole's plus the whole tiles moved.
 * - `fleetWreck` — the navigator's thumb dragging the wreck *down*. A pull
 *   upward is no pull, and reaching `fleetWreckPullMilli` while the pilot's
 *   thumb is still on the hull sinks it on this tick.
 */
export function fleetHandsHeard(world: World, player: 1 | 2, command: Command): void {
  if (command.kind !== "drag") return;
  const b = fleetRound(world);
  if (b === null) return;
  switch (command.target) {
    case "fleetBreach":
      if (player === 2) breach(world, b, command.on);
      return;
    case "fleetRake":
      if (player === 1) rake(b, command.on, command.fromMilli, command.fromYMilli ?? 0);
      return;
    case "fleetWreck":
      if (player === 2) wreck(world, b, command.on, command.fromYMilli ?? 0);
      return;
    default:
      return;
  }
}

function breach(world: World, b: FleetState, on: boolean): void {
  if (on === b.breachHeld) return;
  // A thumb landing on a plume that is not up is a thumb on the water.
  if (on && b.phase !== "flood") return;
  b.breachHeld = on;
  world.events.push({ type: "fleetBreach", col: b.holeCol, row: b.holeRow, on });
}

function rake(b: FleetState, on: boolean, acrossMilli: number, downMilli: number): void {
  if (!on || b.phase === "hunt") {
    b.rakeOn = false;
    b.rakeCol = -1;
    b.rakeRow = -1;
    return;
  }
  const ship = b.ships[b.holed];
  if (ship === undefined) return;
  b.rakeOn = true;
  b.rakeCol = b.holeCol + (ship.dir === "h" ? Math.round(acrossMilli / 1000) : 0);
  b.rakeRow = b.holeRow + (ship.dir === "v" ? Math.round(downMilli / 1000) : 0);
}

function wreck(world: World, b: FleetState, on: boolean, downMilli: number): void {
  if (!on || b.phase !== "wreck") {
    b.wreckPullMilli = 0;
    return;
  }
  const reach = world.cfg.fleetWreckPullMilli;
  b.wreckPullMilli = Math.max(0, Math.min(reach, Math.round(downMilli)));
  if (b.wreckPullMilli >= reach && b.rakeOn) sinkFleetWreck(world, b);
}
