import type { ControlSet } from "@neon-spore/content";
import type { Field } from "@neon-spore/render";
import { pointerSeat, showsWell, type ViewRole } from "@neon-spore/render";
import { faultsNow, framePhase, type World } from "@neon-spore/sim";

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
  /** The seat key held at the desk, if one is (`render/desk-seat.ts`). */
  seatKey: 1 | 2 | undefined,
  /** The skin the stage's last frame stood on (`Canvas2DRenderer.skinY`). */
  skinY: Field["skinY"],
): Field {
  return {
    creatures: world.creatures,
    // The hull's two lobes do **not** answer the mouse here: the owner, 25
    // September 2026 — *in director, disable the in screen controls for
    // cannon and shield.* The strips are the stage's way to both, which is
    // also the game's default (SETTINGS' TOUCH THE SHIP, `Field.ship`).
    ship: false,
    cannonCol: world.cannonCol,
    shieldCol: world.shieldCol,
    beatPhase: framePhase(world),
    skinY,
    beat: world.beat,
    // The wave's own beat, which is the vane's cycle (`render/touch-field.ts`).
    waveBeat: world.waveBeat,
    // And the tick, which is where a sliding body really is (`snake-grip.ts`).
    tick: world.tick,
    // Whose hand the mouse is: the role's, or under TEST the held seat key's.
    seat: pointerSeat(role, seatKey),
    cfg,
    boss: world.boss,
    controls,
    faults: faultsNow(world),
    well: world.boss?.kind === "well" && showsWell(role),
  };
}
