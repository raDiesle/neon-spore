import type { ControlSet } from "@neon-spore/content";
import { hitSlab, type Layout, slabFor, slabPanel, type ViewRole } from "@neon-spore/render";
import { type Command, pinballHolds, type World } from "@neon-spore/sim";
import type { StagePoint } from "./stage-point.js";

/**
 * PINBALL'S SLABS, ANSWERED BY THE DIRECTOR'S MOUSE.
 *
 * The third of these, and it exists because the round shipped without it: the
 * owner clicked FIRE and SET in the director and the needle swept straight
 * past. `stage-touch.ts` routes the canvas through the game's own `touchDown`,
 * which knows about the field and nothing else, so a round's own buttons are
 * answered by nobody unless somebody answers them here — which is word for
 * word what `stage-snake.ts` was written to prevent happening again after THE
 * GAUGE. `test/stage-rounds.test.ts` is the thing that actually prevents it
 * now, because two prose warnings did not.
 *
 * **Typed out rather than imported**, the same as `keys.ts`, `stage-gauge.ts`
 * and `stage-snake.ts`: `apps/game` is an application, and a tool that
 * imported one would be a tool that shipped it. If the two ever disagree, the
 * game is right.
 *
 * **Both seats, from one mouse.** Every slab is on screen in `test`, and the
 * two presses of a shot alternate between the seats — so one person at a
 * desk has to be able to reach all four, or the round cannot be tried at all.
 *
 * **Two of the four are held**, and they are the bucket's: a thing that has to
 * be *under* a falling ball cannot be stepped. That is THE GAUGE's valve
 * contract, pointerup and all — nothing in the simulation lets go of it.
 */
export interface StagePinball {
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
  /** The live world, for `pinballHolds` — `rebuild` swaps the object. */
  world: () => World;
  /** The panel this wave is played on — see `ViewState.controls` for why it is stated. */
  controls: () => ControlSet;
  push: (player: 1 | 2, command: Command) => void;
}

/** The two that are pressed. The bucket's two are held and are below. */
const PRESSES: readonly {
  id: "pinLatch" | "pinLaunch";
  player: 1 | 2;
  command: Command;
}[] = [
  { id: "pinLatch", player: 1, command: { kind: "latch" } },
  { id: "pinLaunch", player: 2, command: { kind: "launch" } },
];

export function bindStagePinball({
  canvas,
  at,
  layout,
  role,
  world,
  controls,
  push,
}: StagePinball): void {
  /** Which way each held pointer is pushing the bucket. */
  const sliding = new Map<number, -1 | 1>();

  const panel = () => slabPanel(layout(), controls(), role());

  const release = (id: number): void => {
    const dir = sliding.get(id);
    if (dir === undefined) return;
    sliding.delete(id);
    push(1, { kind: "slide", on: false, dir });
  };

  // The two listeners here and next door cannot both fire: the simulation
  // holds one boss at a time and each asks whether the round running is its
  // own. They are exclusive by state, not by registration order.
  canvas.addEventListener("pointerdown", (e) => {
    if (!pinballHolds(world())) return;
    const p = at(e);
    const slabs = panel();
    for (const [id, dir] of [
      ["pinLeft", -1],
      ["pinRight", 1],
    ] as const) {
      const slab = slabFor(slabs, id);
      if (slab && hitSlab(slab, p.x, p.y)) {
        sliding.set(e.pointerId, dir);
        push(1, { kind: "slide", on: true, dir });
        return;
      }
    }
    for (const entry of PRESSES) {
      const slab = slabFor(slabs, entry.id);
      if (slab && hitSlab(slab, p.x, p.y)) {
        push(entry.player, entry.command);
        return;
      }
    }
  });

  // A pointer that slid off the slab is a hand that stopped pushing. Without
  // this the bucket travels on while the cursor sits somewhere else — and on
  // this round that carries it into a wall while a ball is coming down.
  canvas.addEventListener("pointermove", (e) => {
    const dir = sliding.get(e.pointerId);
    if (dir === undefined) return;
    const slab = slabFor(panel(), dir < 0 ? "pinLeft" : "pinRight");
    const p = at(e);
    if (!slab || !hitSlab(slab, p.x, p.y)) release(e.pointerId);
  });

  // On the window, not the canvas, for the reason `stage-touch.ts` gives: a
  // hand that leaves the picture still has to let go of what it was holding.
  window.addEventListener("pointerup", (e) => release(e.pointerId));
  window.addEventListener("pointercancel", (e) => release(e.pointerId));
}
