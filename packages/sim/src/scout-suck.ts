import type { SimConfig } from "./config.js";
import type { ScoutState } from "./scout.js";
import { scoutMawOpen } from "./scout-ask.js";
import { scoutHome } from "./scout-open.js";

/**
 * **The mouth takes the ship back**: two tiles round the cannon, and from
 * there the mother ship does the last of it.
 *
 * The owner, 29 September 2026: *when player needs to bring back it should
 * help player, and suck range is around 2 tiles around the suck cannon
 * position*. So a ship carrying a mote, inside `scoutSuckRadiusMilli` of home
 * while the mouth is open, is **had**: `sucking` is set and holds until the
 * ship is home, the mote is banked and the ship is let go again. The pilot
 * brings it near and the navigator's press brings it in, which is THE CLAW's
 * catch — two hands — with the fiddly last half-tile taken off both of them.
 *
 * A distance is asked squared, for `scout-arena.ts`'s reason.
 */

/** Whether the ship is inside the mouth's reach. Nothing about what it carries. */
export function scoutInSuckReach(cfg: SimConfig, scout: ScoutState): boolean {
  const home = scoutHome(cfg.cols, cfg.rows);
  const dCol = scout.colMilli - home.colMilli;
  const dRow = scout.rowMilli - home.rowMilli;
  const reach = cfg.scoutSuckRadiusMilli;
  return dCol * dCol + dRow * dRow <= reach * reach;
}

/**
 * Whether the mouth would take the ship this tick: carrying, in reach, and
 * the mouth open. The round asks it to start the suck, and the field's cue
 * asks the first two halves to tell the navigator to press
 * (`scoutSuckWanted`).
 */
export function scoutSuckTakes(cfg: SimConfig, scout: ScoutState, tick: number): boolean {
  return scoutSuckWanted(cfg, scout) && scoutMawOpen(scout, tick, cfg.scoutMawTicks);
}

/**
 * Whether a press on the mouth is **owed**: a mote aboard, the ship in
 * reach, and no suck already running. What the navigator's cue is lit on.
 */
export function scoutSuckWanted(cfg: SimConfig, scout: ScoutState): boolean {
  return (
    scout.phase === "play" &&
    !scout.sucking &&
    scout.carrying.length > 0 &&
    scoutInSuckReach(cfg, scout)
  );
}

/**
 * One tick of the suck: velocity set straight at home at `scoutSuckMilli`,
 * slowing over the last tile so it settles rather than overshoots. `true`
 * when it ran, and the flight skips the pilot's turn, burn and drag.
 */
export function stepScoutSuck(cfg: SimConfig, scout: ScoutState): boolean {
  if (!scout.sucking) return false;
  const home = scoutHome(cfg.cols, cfg.rows);
  const dCol = home.colMilli - scout.colMilli;
  const dRow = home.rowMilli - scout.rowMilli;
  // The larger leg stands in for the length, as the line's does
  // (`stepScoutReel`): no square root in this package.
  const span = Math.max(1, Math.max(Math.abs(dCol), Math.abs(dRow)));
  const speed = Math.max(600, Math.round((cfg.scoutSuckMilli * Math.min(span, 1000)) / 1000));
  scout.vColMilli = Math.round((dCol * speed) / span);
  scout.vRowMilli = Math.round((dRow * speed) / span);
  return true;
}
