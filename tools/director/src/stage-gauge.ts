import type { ControlSet } from "@neon-spore/content";
import { hitSlab, type Layout, slabFor, slabPanel, type ViewRole } from "@neon-spore/render";
import type { Command } from "@neon-spore/sim";
import { gaugeHolds, type World } from "@neon-spore/sim";

/**
 * A ROUND THAT IS NOT THE FIELD ANSWERS A MOUSE.
 *
 * `stage-touch.ts` next door routes the canvas through the game's own
 * `touchDown`, and that file knows about the field and nothing else — it is
 * handed a `Field`, whose controls come from the caller's own control set. THE GAUGE
 * draws slabs instead of a band, which `touchDown` cannot answer, so every
 * click on the valve landed there, matched nothing, and returned null. The
 * round was drawn and nothing was listening — the owner reported it as "i
 * cannot test the gauge", and they were right: the keyboard had no valve or
 * call either, so there was no way in at all.
 *
 * The slabs now come out of the wave's own control set through `slabPanel`,
 * which is the same call the draw makes — so the two can no longer disagree
 * about where a button is, which is what caused this file to exist.
 *
 * **Typed out rather than imported, the same as `keys.ts`.** The game binds the
 * identical thing in `apps/game/src/gauge.ts`, and `keys.ts`'s header says why
 * this file does not reach for it: `apps/game` is an application, and a tool
 * that imported one would be a tool that shipped it. If the two ever disagree,
 * the game is right.
 *
 * **The seat is the pilot's, because a mouse is one hand.** That is the same
 * choice `stage-touch.ts` made for the field, and it is why `KeyC` in
 * `keys.ts` sends the navigator's call: the half worth looking at is the one
 * the mouse is not holding.
 */
export interface StageGauge {
  canvas: HTMLCanvasElement;
  /** Read fresh: the panel is resizable and the role switches under it. */
  layout: () => Layout;
  /** Which screen this is, so a seat sees the slabs its own seat is given. */
  role: () => ViewRole;
  /** The live world, for `gaugeHolds` — `rebuild` swaps the object. */
  world: () => World;
  /**
   * The panel this wave is played on. `world().wave` is not enough to answer
   * that on its own — see `ViewState.controls` in `packages/render` for why —
   * so the caller, which knows which wave object is actually playing, states
   * it directly.
   */
  controls: () => ControlSet;
  push: (player: 1 | 2, command: Command) => void;
}

export function bindStageGauge({ canvas, layout, role, world, controls, push }: StageGauge): void {
  /** Which way each held pointer is pushing the valve. */
  const turning = new Map<number, -1 | 1>();

  const at = (e: PointerEvent): { x: number; y: number } => {
    const rect = canvas.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const panel = () => slabPanel(layout(), controls(), role());

  const release = (id: number): void => {
    const dir = turning.get(id);
    if (dir === undefined) return;
    turning.delete(id);
    push(1, { kind: "valve", on: false, dir });
  };

  // Before `stage-touch.ts`'s own listener would matter, but ordering is not
  // what keeps them apart: while the round holds, the field has no controls for
  // `touchDown` to match, and while a wave runs `gaugeHolds` is false. The two
  // are exclusive by state, not by registration order.
  canvas.addEventListener("pointerdown", (e) => {
    if (!gaugeHolds(world())) return;
    const p = at(e);
    const slabs = panel();
    for (const [id, dir] of [
      ["gaugeLeft", -1],
      ["gaugeRight", 1],
    ] as const) {
      const slab = slabFor(slabs, id);
      if (slab && hitSlab(slab, p.x, p.y)) {
        turning.set(e.pointerId, dir);
        push(1, { kind: "valve", on: true, dir });
        return;
      }
    }
    const call = slabFor(slabs, "gaugeCall");
    if (call && hitSlab(call, p.x, p.y)) push(2, { kind: "call" });
  });

  // A pointer that slid off the slab is a hand that stopped turning. Without
  // this the needle travels on while the cursor sits somewhere else, which is
  // the one way a held control can lie.
  canvas.addEventListener("pointermove", (e) => {
    const dir = turning.get(e.pointerId);
    if (dir === undefined) return;
    const slab = slabFor(panel(), dir < 0 ? "gaugeLeft" : "gaugeRight");
    const p = at(e);
    if (!slab || !hitSlab(slab, p.x, p.y)) release(e.pointerId);
  });

  // On the window, not the canvas, for the reason `stage-touch.ts` gives: a
  // hand that leaves the picture still has to let go of what it was holding.
  window.addEventListener("pointerup", (e) => release(e.pointerId));
  window.addEventListener("pointercancel", (e) => release(e.pointerId));
}
