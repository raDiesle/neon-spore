import type { ControlSet } from "@neon-spore/content";
import { hitSlab, type Layout, slabFor, slabPanel, type ViewRole } from "@neon-spore/render";
import { type Command, snakeHolds, type World } from "@neon-spore/sim";
import type { StagePoint } from "./stage-point.js";

/**
 * SNAKE'S SLABS, ANSWERED BY THE DIRECTOR'S MOUSE.
 *
 * The file next door says why this exists at all: `stage-touch.ts` routes the
 * canvas through the game's own `touchDown`, which knows about the field and
 * nothing else, so a round's own buttons are answered by nobody unless
 * somebody answers them here. THE GAUGE shipped without that once and the
 * owner reported it as "i cannot test the gauge"; this is the same six lines,
 * written before the same thing can be said about this round.
 *
 * **Typed out rather than imported**, the same as `keys.ts` and
 * `stage-gauge.ts`: `apps/game` is an application, and a tool that imported
 * one would be a tool that shipped it. If the two ever disagree, the game is
 * right.
 *
 * **Both seats, from one mouse.** Unlike THE GAUGE, where the pointer is the
 * pilot's and the keyboard holds the navigator's one verb, every slab here is
 * on screen in `test` and a mouse can reach all four — which is the only way
 * one person at a desk can both drive the body and work it.
 */
export interface StageSnake {
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
  /** The live world, for `snakeHolds` — `rebuild` swaps the object. */
  world: () => World;
  /** The panel this wave is played on — see `ViewState.controls` for why it is stated. */
  controls: () => ControlSet;
  push: (player: 1 | 2, command: Command) => void;
}

const SLABS: readonly {
  id: "snakeLeft" | "snakeRight" | "snakeFire" | "snakeMaw";
  player: 1 | 2;
  command: Command;
}[] = [
  { id: "snakeLeft", player: 2, command: { kind: "snakeTurn", dir: "left" } },
  { id: "snakeRight", player: 2, command: { kind: "snakeTurn", dir: "right" } },
  { id: "snakeFire", player: 1, command: { kind: "snakeFire" } },
  { id: "snakeMaw", player: 1, command: { kind: "snakeMaw" } },
];

export function bindStageSnake({
  canvas,
  at,
  layout,
  role,
  world,
  controls,
  push,
}: StageSnake): void {
  canvas.addEventListener("pointerdown", (e) => {
    if (!snakeHolds(world())) return;
    const { x, y } = at(e);
    const slabs = slabPanel(layout(), controls(), role());
    for (const entry of SLABS) {
      const slab = slabFor(slabs, entry.id);
      if (slab && hitSlab(slab, x, y)) {
        push(entry.player, entry.command);
        return;
      }
    }
  });
}
