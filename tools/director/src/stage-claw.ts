import type { ControlSet } from "@neon-spore/content";
import { hitSlab, type Layout, slabFor, slabPanel, type ViewRole } from "@neon-spore/render";
import { type Command, clawHolds, type World } from "@neon-spore/sim";
import type { StagePoint } from "./stage-point.js";

/**
 * THE CLAW'S SLABS, ANSWERED BY THE DIRECTOR'S MOUSE.
 *
 * The fourth of these, and it is written on the day the round is, rather than
 * after the owner has reported the buttons doing nothing — which is what
 * happened with THE GAUGE and then again with PINBALL.
 * `test/stage-rounds.test.ts` is what actually holds the line now, and it
 * walks every slab of every round's panel and fails on one nobody answers.
 *
 * **Typed out rather than imported**, the same as `keys.ts`, `stage-gauge.ts`,
 * `stage-snake.ts` and `stage-pinball.ts`: `apps/game` is an application, and
 * a tool that imported one would be a tool that shipped it. If the two ever
 * disagree, the game is right.
 *
 * **One seat, three buttons, and nothing held.** THE CLAW is the round where
 * player 2 has no control at all, so there is no alternation to reach across —
 * a person at a desk is playing the only half that has any buttons in it, and
 * the other half is the wreck field on the `test` screen beside them.
 */
export interface StageClaw {
  canvas: HTMLCanvasElement;
  /**
   * A pointer event, in the coordinates the renderer drew in. Handed down
   * rather than worked out here — see `stage-point.ts` for the four copies
   * this replaced and the miss they caused.
   */
  at: StagePoint["at"];
  /** Read fresh: the panel is resizable and the role switches under it. */
  layout: () => Layout;
  role: () => ViewRole;
  /** The live world, for `clawHolds` — `rebuild` swaps the object. */
  world: () => World;
  /** The panel this wave is played on — see `ViewState.controls` for why it is stated. */
  controls: () => ControlSet;
  push: (player: 1 | 2, command: Command) => void;
}

/** All three, and all of them the pilot's. */
const PRESSES: readonly {
  id: "clawLeft" | "clawRight" | "clawGrab";
  command: Command;
}[] = [
  { id: "clawLeft", command: { kind: "clawStep", dir: -1 } },
  { id: "clawRight", command: { kind: "clawStep", dir: 1 } },
  { id: "clawGrab", command: { kind: "clawGrab" } },
];

export function bindStageClaw({
  canvas,
  at,
  layout,
  role,
  world,
  controls,
  push,
}: StageClaw): void {
  // This listener and its three siblings cannot both fire: the simulation
  // holds one boss at a time and each asks whether the round running is its
  // own. They are exclusive by state, not by registration order.
  canvas.addEventListener("pointerdown", (e) => {
    if (!clawHolds(world())) return;
    const p = at(e);
    const slabs = slabPanel(layout(), controls(), role());
    for (const entry of PRESSES) {
      const slab = slabFor(slabs, entry.id);
      if (slab && hitSlab(slab, p.x, p.y)) {
        push(1, entry.command);
        return;
      }
    }
  });
}
