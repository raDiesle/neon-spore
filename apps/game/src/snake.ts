import { controlPress, controlSetForWave } from "@neon-spore/content";
import {
  hitSlab,
  type Layout,
  type Stage,
  slabFor,
  slabPanel,
  type ViewRole,
} from "@neon-spore/render";
import { type Command, snakeHolds, type World } from "@neon-spore/sim";
import type { InputBuffer } from "./input.js";

/**
 * The host's half of SNAKE: the four thumbs that play it.
 *
 * A second listener on the same canvas, exactly as THE GAUGE's and the
 * briefing card's are. The presses underneath are not control presses — the
 * simulation refuses everything but these while the round is up — so whatever
 * `bindControls` makes of the same touch is dropped before it reaches the ship.
 *
 * **Nothing here is held.** THE GAUGE's valve needed a pointerup because
 * nothing in the simulation lets go of it; a turn is a thing that happens once
 * and stands until the next one, and so are the flip and the brake. So this is
 * one listener and one table, and there is no way for a lifted thumb to leave
 * the round holding something.
 *
 * The slabs come from the wave's control set through `slabPanel`, which is the
 * same call the draw makes, so a button is never drawn where it is not
 * answered.
 */

export interface SnakeBinding {
  canvas: HTMLCanvasElement;
  buffer: InputBuffer;
  world: World;
  layout: () => Layout;
  stage: () => Stage;
  role: () => ViewRole;
}

/**
 * Which seat each slab belongs to and what it says. The seat is stated here
 * *and* checked in the simulation, and the two are not a duplication: this one
 * decides which half of a `test` screen a press counts as, and the sim's is
 * what stops a peer sending the other seat's verb (`snake-controls.ts`).
 */
const SLABS: readonly {
  id: "snakeLeft" | "snakeRight" | "snakeFire" | "snakeMaw";
  player: 1 | 2;
  command: Command;
}[] = [
  { id: "snakeLeft", player: 2, command: controlPress("snakeLeft").down },
  { id: "snakeRight", player: 2, command: controlPress("snakeRight").down },
  { id: "snakeFire", player: 1, command: controlPress("snakeFire").down },
  { id: "snakeMaw", player: 1, command: controlPress("snakeMaw").down },
];

export function bindSnake({ canvas, buffer, world, layout, stage, role }: SnakeBinding): void {
  const at = (e: PointerEvent): { x: number; y: number } | null => {
    const s = stage();
    const x = e.clientX - s.left;
    const y = e.clientY - s.top;
    if (x < 0 || y < 0 || x > s.width || y > s.height) return null;
    return { x, y };
  };

  canvas.addEventListener("pointerdown", (e) => {
    if (!snakeHolds(world)) return;
    const p = at(e);
    if (!p) return;
    const slabs = slabPanel(layout(), controlSetForWave(world.wave), role());
    for (const entry of SLABS) {
      const slab = slabFor(slabs, entry.id);
      if (slab && hitSlab(slab, p.x, p.y)) {
        buffer.push(entry.player, entry.command);
        return;
      }
    }
  });
}
