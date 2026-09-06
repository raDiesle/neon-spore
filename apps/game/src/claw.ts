import { type ControlId, controlPress, controlSetForWave } from "@neon-spore/content";
import { hitSlab, type Layout, slabFor, slabPanel, type ViewRole } from "@neon-spore/render";
import { clawHolds, type World } from "@neon-spore/sim";
import type { InputBuffer } from "./input.js";

/**
 * The host's half of THE CLAW: the three thumbs that play it, all on one seat.
 *
 * A fourth round listener on the same canvas, exactly as THE GAUGE's, SNAKE's
 * and PINBALL's are. The presses underneath are not control presses — the
 * simulation refuses everything but these while the round is up — so whatever
 * `bindControls` makes of the same touch is dropped before it reaches the ship.
 *
 * **Nothing here is held**, which makes it the simplest of the four. A step is
 * one socket and a grab is one drop: a thumb that could rest on an arrow and
 * walk the claw along the rail would take the counting out of the round, and
 * the counting is the round — there being nothing on either screen with a name
 * on it to count to instead (`sim/claw.ts`).
 *
 * **And every one of them is player 1's.** Player 2 has no slab on this panel
 * at all, so there is nothing to look for on her half and nothing to answer:
 * her seat's contribution is the wreck field on her screen and her own voice.
 *
 * The slabs come from the wave's control set through `slabPanel`, which is the
 * same call the draw makes, so a button is never drawn where it is not
 * answered.
 */

export interface ClawBinding {
  canvas: HTMLCanvasElement;
  buffer: InputBuffer;
  world: World;
  layout: () => Layout;
  /** A pointer event on the stage, or null beside it — one conversion for
   * every listener in the app (`viewport.ts`, `render/stage-point.ts`). */
  inStage: (e: { clientX: number; clientY: number }) => { x: number; y: number } | null;
  role: () => ViewRole;
}

/** The three, in the order the panel lists them. */
const SLABS: readonly ControlId[] = ["clawLeft", "clawGrab", "clawRight"];

export function bindClaw({ canvas, buffer, world, layout, inStage, role }: ClawBinding): void {
  canvas.addEventListener("pointerdown", (e) => {
    if (!clawHolds(world)) return;
    const p = inStage(e);
    if (!p) return;
    const slabs = slabPanel(layout(), controlSetForWave(world.wave), role());
    for (const id of SLABS) {
      const slab = slabFor(slabs, id);
      if (slab && hitSlab(slab, p.x, p.y)) {
        buffer.push(1, controlPress(id).down);
        return;
      }
    }
  });
}
