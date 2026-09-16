import type { ControlSet } from "@neon-spore/content";
import { hitSlab, type Layout, slabFor, slabPanel } from "@neon-spore/render";
import { type Command, scoutHolds, type World } from "@neon-spore/sim";
import type { StagePoint } from "./stage-point.js";

/**
 * THE SCOUT'S SLABS, ANSWERED BY THE DIRECTOR'S MOUSE.
 *
 * `stage-snake.ts` next door says why this file has to exist at all, and
 * `test/stage-rounds.test.ts` is what made it exist *before* the owner could
 * report that the buttons do nothing: the canvas is routed through the game's
 * own `touchDown`, which knows about the field and nothing else, so a round's
 * own slabs are answered by nobody unless a listener here names them.
 *
 * **Typed out rather than imported**, the same as `keys.ts` and
 * `stage-snake.ts`: `apps/game` is an application, and a tool that imported
 * one would be a tool that shipped it. If the two ever disagree, the game is
 * right.
 *
 * **Two of the four are held**, which is what makes this listener longer than
 * SNAKE's by exactly one event. A turn keeps swinging the nose and a burn
 * keeps pushing until the finger comes off, so a mouse that only ever sent the
 * press would leave the director's ship turning for the rest of the round —
 * `pointerup` sends the release, and it is on the window rather than on the
 * canvas so a button dragged off the edge still lets go.
 */
export interface StageScout {
  canvas: HTMLCanvasElement;
  /** A pointer event, in the coordinates the renderer drew in (`stage-point.ts`). */
  at: StagePoint["at"];
  /** Read fresh: the panel is resizable and the role switches under it. */
  layout: () => Layout;
  /** The live world, for `scoutHolds` — `rebuild` swaps the object. */
  world: () => World;
  /** The panel this wave is played on — see `ViewState.controls` for why it is stated. */
  controls: () => ControlSet;
  push: (player: 1 | 2, command: Command) => void;
}

/**
 * The four, with what a press and a release each send.
 *
 * `up` is absent on the mouth, which is a moment rather than a hold: the
 * mother ship's mouth stands open for `scoutMawTicks` from the press and
 * closes on its own (`sim/scout-round.ts`).
 */
const SLABS: readonly {
  id: "scoutTurnLeft" | "scoutTurnRight" | "scoutBurn" | "scoutMaw";
  player: 1 | 2;
  down: Command;
  up?: Command;
}[] = [
  {
    id: "scoutTurnLeft",
    player: 1,
    down: { kind: "scoutTurn", on: true, dir: -1 },
    up: { kind: "scoutTurn", on: false, dir: -1 },
  },
  {
    id: "scoutTurnRight",
    player: 1,
    down: { kind: "scoutTurn", on: true, dir: 1 },
    up: { kind: "scoutTurn", on: false, dir: 1 },
  },
  {
    id: "scoutBurn",
    player: 1,
    down: { kind: "scoutBurn", on: true },
    up: { kind: "scoutBurn", on: false },
  },
  { id: "scoutMaw", player: 2, down: { kind: "scoutMaw" } },
];

export function bindStageScout({ canvas, at, layout, world, controls, push }: StageScout): void {
  // What the last press was holding, so the release can send its own command
  // rather than guessing from where the mouse happens to be when it lifts.
  let held: (typeof SLABS)[number] | null = null;

  canvas.addEventListener("pointerdown", (e) => {
    if (!scoutHolds(world())) return;
    const { x, y } = at(e);
    const l = layout();
    const slabs = slabPanel(l, controls(), l.role);
    for (const entry of SLABS) {
      const slab = slabFor(slabs, entry.id);
      if (slab && hitSlab(slab, x, y)) {
        push(entry.player, entry.down);
        if (entry.up) held = entry;
        return;
      }
    }
  });

  window.addEventListener("pointerup", () => {
    const entry = held;
    held = null;
    if (entry?.up && scoutHolds(world())) push(entry.player, entry.up);
  });
}
