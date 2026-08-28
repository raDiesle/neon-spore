import { hitSlab, interludeControls, type Layout, type ViewRole } from "@neon-spore/render";
import type { Command } from "@neon-spore/sim";
import { interludeHolds, type World } from "@neon-spore/sim";

/**
 * A ROUND THAT IS NOT THE FIELD ANSWERS A MOUSE.
 *
 * `stage-touch.ts` next door routes the canvas through the game's own
 * `touchDown`, and that file knows about the field and nothing else — it is
 * handed a `Field`, whose controls come from `controlSetForWave`. An interlude
 * draws its own three slabs instead (`interludeControls`), which no control set
 * contains and no wave names, so every click on THE GAUGE's valve landed in
 * `touchDown`, matched nothing, and returned null. The round was drawn and
 * nothing was listening — the owner reported it as "i cannot test the gauge",
 * and they were right: the keyboard had no valve or call either, so there was
 * no way in at all.
 *
 * **Typed out rather than imported, the same as `keys.ts`.** The game binds the
 * identical thing in `apps/game/src/interlude.ts`, and `keys.ts`'s header says
 * why this file does not reach for it: `apps/game` is an application, and a
 * tool that imported one would be a tool that shipped it. If the two ever
 * disagree, the game is right.
 *
 * **The seat is the pilot's, because a mouse is one hand.** That is the same
 * choice `stage-touch.ts` made for the field, and it is why `KeyC` in
 * `keys.ts` sends the navigator's call: the half worth looking at is the one
 * the mouse is not holding.
 */
export interface StageInterlude {
  canvas: HTMLCanvasElement;
  /** Read fresh: the panel is resizable and the role switches under it. */
  layout: () => Layout;
  /** Which screen this is, so a seat sees the slabs its own seat is given. */
  role: () => ViewRole;
  /** The live world, for `interludeHolds` — `rebuild` swaps the object. */
  world: () => World;
  push: (player: 1 | 2, command: Command) => void;
}

export function bindStageInterlude({ canvas, layout, role, world, push }: StageInterlude): void {
  /** Which way each held pointer is pushing the valve. */
  const turning = new Map<number, -1 | 1>();

  const at = (e: PointerEvent): { x: number; y: number } => {
    const rect = canvas.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const release = (id: number): void => {
    const dir = turning.get(id);
    if (dir === undefined) return;
    turning.delete(id);
    push(1, { kind: "valve", on: false, dir });
  };

  // Before `stage-touch.ts`'s own listener would matter, but ordering is not
  // what keeps them apart: while a round holds, the field has no controls for
  // `touchDown` to match, and while a wave runs `interludeHolds` is false. The
  // two are exclusive by state, not by registration order.
  canvas.addEventListener("pointerdown", (e) => {
    if (!interludeHolds(world())) return;
    const p = at(e);
    const controls = interludeControls(layout(), role());
    if (controls.down && hitSlab(controls.down, p.x, p.y)) {
      turning.set(e.pointerId, -1);
      push(1, { kind: "valve", on: true, dir: -1 });
      return;
    }
    if (controls.up && hitSlab(controls.up, p.x, p.y)) {
      turning.set(e.pointerId, 1);
      push(1, { kind: "valve", on: true, dir: 1 });
      return;
    }
    if (controls.call && hitSlab(controls.call, p.x, p.y)) push(2, { kind: "call" });
  });

  // A pointer that slid off the slab is a hand that stopped turning. Without
  // this the needle travels on while the cursor sits somewhere else, which is
  // the one way a held control can lie.
  canvas.addEventListener("pointermove", (e) => {
    const dir = turning.get(e.pointerId);
    if (dir === undefined) return;
    const controls = interludeControls(layout(), role());
    const slab = dir < 0 ? controls.down : controls.up;
    const p = at(e);
    if (!slab || !hitSlab(slab, p.x, p.y)) release(e.pointerId);
  });

  // On the window, not the canvas, for the reason `stage-touch.ts` gives: a
  // hand that leaves the picture still has to let go of what it was holding.
  window.addEventListener("pointerup", (e) => release(e.pointerId));
  window.addEventListener("pointercancel", (e) => release(e.pointerId));
}
