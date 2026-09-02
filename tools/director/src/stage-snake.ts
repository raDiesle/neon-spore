import type { ControlSet } from "@neon-spore/content";
import { hitSlab, type Layout, slabFor, slabPanel, type ViewRole } from "@neon-spore/render";
import { type Command, snakeHolds, type World } from "@neon-spore/sim";

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
 * on screen in `test` and a mouse can reach all six — which is the only way
 * one person at a desk can drive a body that needs two seats to turn.
 */
export interface StageSnake {
  canvas: HTMLCanvasElement;
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
  id: "snakeLeft" | "snakeRight" | "snakeFlip" | "snakeUp" | "snakeDown" | "snakeSlow";
  player: 1 | 2;
  command: Command;
}[] = [
  { id: "snakeLeft", player: 1, command: { kind: "snakeTurn", dir: "left" } },
  { id: "snakeRight", player: 1, command: { kind: "snakeTurn", dir: "right" } },
  { id: "snakeFlip", player: 1, command: { kind: "snakeFlip" } },
  { id: "snakeUp", player: 2, command: { kind: "snakeTurn", dir: "up" } },
  { id: "snakeDown", player: 2, command: { kind: "snakeTurn", dir: "down" } },
  { id: "snakeSlow", player: 2, command: { kind: "snakeSlow" } },
];

export function bindStageSnake({ canvas, layout, role, world, controls, push }: StageSnake): void {
  canvas.addEventListener("pointerdown", (e) => {
    if (!snakeHolds(world())) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
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
