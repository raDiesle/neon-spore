import {
  type FleetState,
  fleetOnBoard,
  fleetRows,
  fleetShipAt,
  fleetStruck,
  shipCol,
  shipRow,
  type World,
} from "@neon-spore/sim";
import type { Hand } from "./hand.js";

/**
 * **The pair's hands on THE FLEET**, a `Hand` (`hand.ts`) —
 * cut out of `boss-hands-field.ts` when the fight's second and third states
 * (`sim/fleet-state.ts`) gave it two more gestures than that file had room
 * for.
 *
 * The hunt is played straight: the navigator walks the sights a square a
 * tick toward the nearest square of a ship not yet fired at, and the pilot's
 * salvo goes the tick they stand on it. The pair cannot see the ships and
 * plays this by calling squares; the hand reads them, because what it is
 * posing is a hit and what follows one, not the search.
 *
 * Under the flood the navigator's thumb is on the plume and the pilot's
 * rakes the hull from the hole toward its next unstruck square, in whole
 * tiles from where it grabbed (`sim/fleet-hand.ts`) — the simulation strikes
 * the square after `fleetRakeBeats` with both thumbs down, so the hand
 * holds still and lets it. On the wreck the pilot's thumb stays on the
 * hull and the navigator's pulls the wreck down its whole reach in one
 * press: the sim sinks it the tick the pull arrives.
 */
export const fleetHand: Hand = (w) => {
  const b = w.boss;
  if (b === null || b.kind !== "fleet") return [];
  if (b.phase === "flood") return flood(w, b);
  if (b.phase === "wreck") return wreck(w);
  return hunt(w, b);
};

function hunt(w: World, b: FleetState): ReturnType<Hand> {
  let best: { col: number; row: number } | null = null;
  for (let row = 0; row < fleetRows(w.cfg); row++) {
    for (let col = 0; col < w.cfg.cols; col++) {
      if (!fleetOnBoard(w.cfg, col, row) || fleetShipAt(b.ships, col, row) === -1) continue;
      if (fleetStruck(w, b, col, row)) continue;
      const d = Math.abs(col - b.aimCol) + Math.abs(row - b.aimRow);
      if (best === null || d < Math.abs(best.col - b.aimCol) + Math.abs(best.row - b.aimRow))
        best = { col, row };
    }
  }
  if (best === null) return [];
  const dcol = Math.sign(best.col - b.aimCol) as -1 | 0 | 1;
  const drow = Math.sign(best.row - b.aimRow) as -1 | 0 | 1;
  if (dcol !== 0 || drow !== 0) return [{ player: 2, command: { kind: "aim", dcol, drow } }];
  return [{ player: 1, command: { kind: "salvo" } }];
}

/** The navigator on the plume, the pilot's thumb over the next square of the holed hull. */
function flood(w: World, b: FleetState): ReturnType<Hand> {
  const ship = b.ships[b.holed];
  if (ship === undefined) return [];
  const out: ReturnType<Hand> = [];
  if (!b.breachHeld) {
    out.push({
      player: 2,
      command: { kind: "drag", target: "fleetBreach", on: true, fromMilli: 0, fromYMilli: 0 },
    });
  }
  for (let i = 0; i < ship.len; i++) {
    const col = shipCol(ship, i);
    const row = shipRow(ship, i);
    if (fleetStruck(w, b, col, row)) continue;
    out.push({
      player: 1,
      command: {
        kind: "drag",
        target: "fleetRake",
        on: true,
        fromMilli: (col - b.holeCol) * 1000,
        fromYMilli: (row - b.holeRow) * 1000,
      },
    });
    return out;
  }
  return out;
}

/** The pilot's thumb kept on the hull, the navigator's pull down its whole reach. */
function wreck(w: World): ReturnType<Hand> {
  return [
    {
      player: 1,
      command: { kind: "drag", target: "fleetRake", on: true, fromMilli: 0, fromYMilli: 0 },
    },
    {
      player: 2,
      command: {
        kind: "drag",
        target: "fleetWreck",
        on: true,
        fromMilli: 0,
        fromYMilli: w.cfg.fleetWreckPullMilli,
      },
    },
  ];
}
