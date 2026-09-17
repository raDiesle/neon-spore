import type { ControlSet } from "@neon-spore/content";
import type { Field } from "@neon-spore/render";
import { showsWell, type ViewRole } from "@neon-spore/render";
import { faultsNow, framePhase, mazeRound, type World } from "@neon-spore/sim";
import { pointerSeat } from "./stage-touch.js";

/**
 * **What the stage hands a hit test**, and nothing else.
 *
 * Cut out of `stage.ts` when THE ORRERY's ring took that file one line over
 * its limit, along a seam that was already there: the rest of that function is
 * bindings and a loop, and this is a *shape* — the same split
 * `touch-field.ts` is on the other side of the call, and for the same reason.
 * Every line of it is one boss or one fact about the wave that some circle on
 * the field needs, and the list grows by one every time a control is drawn
 * where a creature falls.
 *
 * It is read fresh on every press, which is why it is a function here as well
 * as there: the stage steps a world under the pointer, and a field captured
 * once would answer yesterday's boss.
 */
export function stageField(
  world: World,
  role: ViewRole,
  controls: ControlSet,
  cfg: World["cfg"],
): Field {
  return {
    creatures: world.creatures,
    // The ship answers a finger where it is drawn (`render/touch-ship.ts`).
    cannonCol: world.cannonCol,
    shieldCol: world.shieldCol,
    beatPhase: framePhase(world),
    beat: world.beat,
    seat: pointerSeat(role),
    cfg,
    maze: mazeRound(world),
    warden: world.boss?.kind === "warden" ? world.boss : null,
    orrery: world.boss?.kind === "orrery" ? world.boss : null,
    sinew: world.boss?.kind === "sinew" ? world.boss : null,
    surge: world.boss?.kind === "surge" ? world.boss : null,
    controls,
    faults: faultsNow(world),
    well: world.boss?.kind === "well" && showsWell(role),
  };
}
