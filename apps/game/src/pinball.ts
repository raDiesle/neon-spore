import { controlHold, controlPress, controlSetForWave } from "@neon-spore/content";
import {
  hitSlab,
  type Layout,
  type Stage,
  slabFor,
  slabPanel,
  type ViewRole,
} from "@neon-spore/render";
import { pinballHolds, type World } from "@neon-spore/sim";
import type { InputBuffer } from "./input.js";

/**
 * The host's half of PINBALL: the four thumbs that play it.
 *
 * A third round listener on the same canvas, exactly as THE GAUGE's and
 * SNAKE's are. The presses underneath are not control presses — the simulation
 * refuses everything but these while the round is up — so whatever
 * `bindControls` makes of the same touch is dropped before it reaches the ship.
 *
 * **Two of the four are held, and they are the bucket's.** A thing that has to
 * be *under* a falling ball cannot be stepped: THE FLEET's arrows are steps
 * because counting squares out loud is that round's whole content, and this
 * one's content is a ball in the air, which nobody has time to count at. So
 * the bucket takes THE GAUGE's valve contract, pointerup and all — nothing in
 * the simulation lets go of it on its own.
 *
 * The slabs come from the wave's control set through `slabPanel`, which is the
 * same call the draw makes, so a button is never drawn where it is not
 * answered.
 */

export interface PinballBinding {
  canvas: HTMLCanvasElement;
  buffer: InputBuffer;
  world: World;
  layout: () => Layout;
  stage: () => Stage;
  role: () => ViewRole;
}

/** This slab's two commands, from the one table that knows what a control
 * says (`content/src/control-command.ts`). */
const slideOf = (dir: -1 | 1) => controlHold(dir < 0 ? "pinLeft" : "pinRight");

export function bindPinball({ canvas, buffer, world, layout, stage, role }: PinballBinding): void {
  /** Pointers currently holding the bucket, and which way each pushes. */
  const sliding = new Map<number, -1 | 1>();

  const at = (e: PointerEvent): { x: number; y: number } | null => {
    const s = stage();
    const x = e.clientX - s.left;
    const y = e.clientY - s.top;
    if (x < 0 || y < 0 || x > s.width || y > s.height) return null;
    return { x, y };
  };

  const panel = () => slabPanel(layout(), controlSetForWave(world.wave), role());

  const release = (id: number): void => {
    const dir = sliding.get(id);
    if (dir === undefined) return;
    sliding.delete(id);
    buffer.push(1, slideOf(dir).up);
  };

  canvas.addEventListener("pointerdown", (e) => {
    if (!pinballHolds(world)) return;
    const p = at(e);
    if (!p) return;
    const slabs = panel();
    for (const [id, dir] of [
      ["pinLeft", -1],
      ["pinRight", 1],
    ] as const) {
      const slab = slabFor(slabs, id);
      if (slab && hitSlab(slab, p.x, p.y)) {
        sliding.set(e.pointerId, dir);
        buffer.push(1, slideOf(dir).down);
        return;
      }
    }
    const latch = slabFor(slabs, "pinLatch");
    if (latch && hitSlab(latch, p.x, p.y)) {
      buffer.push(1, controlPress("pinLatch").down);
      return;
    }
    const launch = slabFor(slabs, "pinLaunch");
    if (launch && hitSlab(launch, p.x, p.y)) buffer.push(2, controlPress("pinLaunch").down);
  });

  // A thumb that slid off the slab is a thumb that stopped pushing. Without
  // this the bucket would keep travelling while the finger sat somewhere else
  // on the screen, which is the one way a held control can lie — and on this
  // round it would carry the bucket into a wall while a ball came down.
  canvas.addEventListener("pointermove", (e) => {
    const dir = sliding.get(e.pointerId);
    if (dir === undefined) return;
    const p = at(e);
    const slab = slabFor(panel(), dir < 0 ? "pinLeft" : "pinRight");
    if (!p || !slab || !hitSlab(slab, p.x, p.y)) release(e.pointerId);
  });
  canvas.addEventListener("pointerup", (e) => release(e.pointerId));
  canvas.addEventListener("pointercancel", (e) => release(e.pointerId));
}
