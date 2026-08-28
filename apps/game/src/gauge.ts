import { controlSetForWave } from "@neon-spore/content";
import {
  hitSlab,
  type Layout,
  type Stage,
  slabFor,
  slabPanel,
  type ViewRole,
} from "@neon-spore/render";
import { gaugeHolds, type World } from "@neon-spore/sim";
import type { InputBuffer } from "./input.js";

/**
 * The host's half of THE GAUGE: the two thumbs that play it.
 *
 * There used to be another half — which gap between two waves carried a round,
 * and a `needWave` that had to be asked twice. That is gone. THE GAUGE is a
 * boss wave, so it is reached the way every other boss is: `waves.ts` builds
 * it from `content` when the sim asks for its number, and nothing here has an
 * opinion about when.
 */

export interface GaugeBinding {
  canvas: HTMLCanvasElement;
  buffer: InputBuffer;
  world: World;
  layout: () => Layout;
  stage: () => Stage;
  role: () => ViewRole;
}

/**
 * The round's own thumbs. A second listener on the same canvas, exactly as the
 * briefing card has one: the presses underneath are not control presses, the
 * simulation refuses everything but these two while the round is up, and
 * whatever `bindControls` makes of the same touch is dropped before it reaches
 * the ship.
 *
 * The valve is **held**, so it needs the pointer up as well — nothing in the
 * simulation lets go of it on its own, the same contract the lance has. The
 * call is a press and nothing else.
 *
 * The slabs come from the wave's control set through `slabPanel`, which is the
 * same call the draw makes, so a button is never drawn where it is not
 * answered.
 *
 * Both halves are pushed with the seat they belong to whatever this device is
 * showing. In a room the lockstep scheduler drops the half this device is not
 * sitting in; alone, one person plays both, which is the test view.
 */
export function bindGauge({ canvas, buffer, world, layout, stage, role }: GaugeBinding): void {
  /** Pointers currently holding a valve, and which way each pushes. */
  const turning = new Map<number, -1 | 1>();

  const at = (e: PointerEvent): { x: number; y: number } | null => {
    const s = stage();
    const x = e.clientX - s.left;
    const y = e.clientY - s.top;
    if (x < 0 || y < 0 || x > s.width || y > s.height) return null;
    return { x, y };
  };

  const panel = () => slabPanel(layout(), controlSetForWave(world.wave), role());

  const release = (id: number): void => {
    const dir = turning.get(id);
    if (dir === undefined) return;
    turning.delete(id);
    buffer.push(1, { kind: "valve", on: false, dir });
  };

  canvas.addEventListener("pointerdown", (e) => {
    if (!gaugeHolds(world)) return;
    const p = at(e);
    if (!p) return;
    const slabs = panel();
    for (const [id, dir] of [
      ["gaugeLeft", -1],
      ["gaugeRight", 1],
    ] as const) {
      const slab = slabFor(slabs, id);
      if (slab && hitSlab(slab, p.x, p.y)) {
        turning.set(e.pointerId, dir);
        buffer.push(1, { kind: "valve", on: true, dir });
        return;
      }
    }
    const call = slabFor(slabs, "gaugeCall");
    if (call && hitSlab(call, p.x, p.y)) buffer.push(2, { kind: "call" });
  });

  // A thumb that slid off the slab is a thumb that stopped turning. Without
  // this the needle would keep travelling while the finger sat somewhere else
  // on the screen, which is the one way a held control can lie.
  canvas.addEventListener("pointermove", (e) => {
    const dir = turning.get(e.pointerId);
    if (dir === undefined) return;
    const p = at(e);
    const slab = slabFor(panel(), dir < 0 ? "gaugeLeft" : "gaugeRight");
    if (!p || !slab || !hitSlab(slab, p.x, p.y)) release(e.pointerId);
  });
  canvas.addEventListener("pointerup", (e) => release(e.pointerId));
  canvas.addEventListener("pointercancel", (e) => release(e.pointerId));
}
