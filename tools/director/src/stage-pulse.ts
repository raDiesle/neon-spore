import type { ControlId, ControlSet } from "@neon-spore/content";
import { hitSlab, type Layout, slabFor, slabPanel, type ViewRole } from "@neon-spore/render";
import { type Command, pulseHolds, type World } from "@neon-spore/sim";
import type { StagePoint } from "./stage-point.js";

/**
 * THE PULSE'S EIGHT SLABS, ANSWERED BY THE DIRECTOR'S MOUSE.
 *
 * `stage-rounds.ts` says why this exists at all: `stage-touch.ts` routes the
 * canvas through the game's own `touchDown`, which knows about the field and
 * nothing else, so a round's own buttons are answered by nobody unless
 * somebody answers them here. It has been forgotten twice and both times the
 * owner found it by clicking a dead button.
 *
 * **Typed out rather than imported**, the same as `stage-snake.ts` and
 * `stage-gauge.ts`: `apps/game` is an application, and a tool that imported
 * one would be a tool that shipped it. If the two ever disagree, the game is
 * right.
 *
 * **Eight entries and not four**, because this is the first panel that is the
 * same in both seats: a lane belongs to a *control*, the control belongs to a
 * seat, and the command carries only the lane (`sim/command-types.ts`). One
 * mouse at a desk can reach all eight in `test`, which is the only way one
 * person can play both halves of a chart neither of them can read alone.
 */
export interface StagePulse {
  canvas: HTMLCanvasElement;
  /**
   * A pointer event, in the coordinates the renderer drew in. Handed down
   * rather than worked out here — see `stage-point.ts`.
   */
  at: StagePoint["at"];
  /** Read fresh: the panel is resizable and the role switches under it. */
  layout: () => Layout;
  role: () => ViewRole;
  /** The live world, for `pulseHolds` — `rebuild` swaps the object. */
  world: () => World;
  /** The panel this wave is played on — see `ViewState.controls` for why it is stated. */
  controls: () => ControlSet;
  push: (player: 1 | 2, command: Command) => void;
}

const SLABS: readonly { id: ControlId; player: 1 | 2; command: Command }[] = [
  { id: "pulse1Left", player: 1, command: { kind: "pulseStep", lane: "left" } },
  { id: "pulse1Down", player: 1, command: { kind: "pulseStep", lane: "down" } },
  { id: "pulse1Up", player: 1, command: { kind: "pulseStep", lane: "up" } },
  { id: "pulse1Right", player: 1, command: { kind: "pulseStep", lane: "right" } },
  { id: "pulse2Left", player: 2, command: { kind: "pulseStep", lane: "left" } },
  { id: "pulse2Down", player: 2, command: { kind: "pulseStep", lane: "down" } },
  { id: "pulse2Up", player: 2, command: { kind: "pulseStep", lane: "up" } },
  { id: "pulse2Right", player: 2, command: { kind: "pulseStep", lane: "right" } },
];

export function bindStagePulse({
  canvas,
  at,
  layout,
  role,
  world,
  controls,
  push,
}: StagePulse): void {
  canvas.addEventListener("pointerdown", (e) => {
    if (!pulseHolds(world())) return;
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
