import { controlHold, controlPress, controlSetForWave } from "@neon-spore/content";
import { hitSlab, type Layout, slabFor, slabPanel, type ViewRole } from "@neon-spore/render";
import { type Command, scoutHolds, type World } from "@neon-spore/sim";
import type { InputBuffer } from "./input.js";

/**
 * The host's half of THE SCOUT: the three thumbs that fly it and the one that
 * catches what it brings home.
 *
 * A second listener on the same canvas, exactly as THE GAUGE's and SNAKE's
 * are. The presses underneath are not control presses — the simulation refuses
 * everything but these while the round is up — so whatever `bindControls`
 * makes of the same touch is dropped before it reaches the ship.
 *
 * **Three of the four are held**, which is the one way this differs from
 * SNAKE's listener and the reason it has a `pointerup` at all: a turn keeps
 * swinging the nose and a burn keeps pushing until the finger comes off
 * (`sim/scout-fly.ts`). THE GAUGE's valve needed the same for the same reason,
 * and its file says what a missing release costs — a round that goes on
 * turning after the hand has gone.
 *
 * The release is on the window rather than on the canvas, so a thumb dragged
 * off the button, off the panel or off the screen still lets go. And it is
 * sent for whatever was *pressed* rather than for whatever is under the finger
 * when it lifts, which is the same distinction `touch-lobe.ts` draws for a
 * held lobe.
 *
 * The slabs come from the wave's control set through `slabPanel`, which is the
 * same call the draw makes, so a button is never drawn where it is not
 * answered.
 */

export interface ScoutBinding {
  canvas: HTMLCanvasElement;
  buffer: InputBuffer;
  world: World;
  layout: () => Layout;
  /** A pointer event on the stage, or null beside it (`viewport.ts`). */
  inStage: (e: { clientX: number; clientY: number }) => { x: number; y: number } | null;
  role: () => ViewRole;
}

/**
 * Which seat each slab belongs to. The seat is stated here *and* checked in
 * the simulation, and the two are not a duplication: this one decides which
 * half of a `test` screen a press counts as, and the sim's is what stops a
 * peer sending the other seat's verb (`scout-round.ts`).
 *
 * What each one *says* is not stated here at all — `controlPress` and
 * `controlHold` are the one table, next to the buttons' own labels, and a
 * second copy is how a release ends up meaning something the press did not.
 */
const SLABS: readonly {
  id: "scoutTurnLeft" | "scoutTurnRight" | "scoutBurn" | "scoutMaw";
  player: 1 | 2;
}[] = [
  { id: "scoutTurnLeft", player: 1 },
  { id: "scoutTurnRight", player: 1 },
  { id: "scoutBurn", player: 1 },
  { id: "scoutMaw", player: 2 },
];

export function bindScout({ canvas, buffer, world, layout, inStage, role }: ScoutBinding): void {
  let held: { player: 1 | 2; up: Command } | null = null;

  canvas.addEventListener("pointerdown", (e) => {
    if (!scoutHolds(world)) return;
    const p = inStage(e);
    if (!p) return;
    const slabs = slabPanel(layout(), controlSetForWave(world.wave), role());
    for (const entry of SLABS) {
      const slab = slabFor(slabs, entry.id);
      if (slab && hitSlab(slab, p.x, p.y)) {
        const press = controlPress(entry.id);
        buffer.push(entry.player, press.down);
        held = press.up ? { player: entry.player, up: press.up } : null;
        return;
      }
    }
  });

  window.addEventListener("pointerup", () => {
    const entry = held;
    held = null;
    if (entry && scoutHolds(world)) buffer.push(entry.player, entry.up);
  });
}

/** Whether this control is one a thumb stays on — `controlHold`'s question, asked of a slab. */
export function scoutSlabHeld(id: (typeof SLABS)[number]["id"]): boolean {
  return controlPress(id).up !== undefined && controlHold(id).up !== undefined;
}
