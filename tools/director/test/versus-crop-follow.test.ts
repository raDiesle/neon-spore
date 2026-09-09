import { describe, expect, test } from "bun:test";
import { computeLayout, computeStage, tileCX, tileCY } from "@neon-spore/render";
import type { World } from "@neon-spore/sim";
import { poseCropRect } from "../src/pose-art.js";
import type { Pose } from "../src/pose-kit.js";
import { SURFACE_POSES } from "../src/poses-surface.js";
import { CropWindow } from "../src/versus-crop.js";
import { advance } from "../src/versus-pair.js";

/**
 * A `tile` crop is a window a few tiles across, and it used to be worked out
 * once — from the world as the pose handed it over. That was right for as long
 * as every pose replayed every two seconds, in which a body falls a third of a
 * tile. The surface poses are held for a whole fall instead, and the body drops
 * straight out of the window it started in: the page showed an empty lane for
 * eight of its ten seconds, and both poses had to be widened to the whole
 * field to be watchable at all.
 *
 * `versus-crop.ts`'s `CropWindow` re-derives the rectangle from the world each
 * frame is about to be drawn from. This is that promise as a test: step each
 * tile-cropped pose for its whole cadence and require the body the pose is
 * named after to stay inside the rectangle the whole way down. It needs no
 * canvas: `CropWindow` is given no sides at all, so `fitCrop` has nothing to
 * write styles on and what is left is the arithmetic under test.
 */

const PHONE = { width: 380, height: 820, dpr: 1 };

/** The body's centre in the phone's own CSS pixels — `stage.left` added back,
 * exactly as `cropRect` adds it to the rectangle. Called through `tileCX` and
 * `tileCY` rather than spelled out, so one file owns where a tile is. */
function bodyCentre(pose: Pose, world: World): { x: number; y: number } {
  const role = pose.role ?? "test";
  const stage = computeStage(PHONE, world.cfg, role);
  const layout = computeLayout(
    { width: stage.width, height: stage.height, dpr: PHONE.dpr },
    world.cfg,
    role,
  );
  const at = pose.at?.(world) ?? { col: 0, row: 0 };
  return { x: stage.left + tileCX(layout, at.col), y: tileCY(layout, at.row) };
}

const tilePoses = SURFACE_POSES.filter((p) => p.crop === "tile");

describe("a tile crop follows the body it is about", () => {
  test("the surface poses are cropped to a tile", () => {
    expect(tilePoses.map((p) => p.name)).toEqual(SURFACE_POSES.map((p) => p.name));
    for (const pose of tilePoses) expect(pose.at).toBeDefined();
  });

  for (const pose of tilePoses) {
    test(`${pose.name} stays inside its window for a whole fall`, () => {
      let world = pose.build();
      const tickHz = world.cfg.tickHz;
      const ticks = Math.round((pose.cadenceSeconds ?? 2) * tickHz);
      // The first frame is inside by construction; the point is the last one.
      let rowsFallen = 0;
      const startRow = pose.at?.(world)?.row ?? 0;
      // The rectangle as it was handed over, kept to prove the follow is what
      // is doing the work: a window that never moved does not contain this
      // body at the bottom of its fall, which is the defect being fixed.
      const stuck = poseCropRect(pose, world, pose.role ?? "test", PHONE);
      const win = new CropWindow([], PHONE, pose, pose.role ?? "test", world);
      for (let i = 0; i < ticks; i++) {
        world = advance(world, () => pose.build(), pose).world;
        win.follow(world);
        const rect = win.window;
        const c = bodyCentre(pose, world);
        expect(c.x, `${pose.name} left the window sideways at tick ${i}`).toBeGreaterThanOrEqual(
          rect.x,
        );
        expect(c.x).toBeLessThanOrEqual(rect.x + rect.w);
        expect(c.y, `${pose.name} fell out of the window at tick ${i}`).toBeGreaterThanOrEqual(
          rect.y,
        );
        expect(c.y).toBeLessThanOrEqual(rect.y + rect.h);
        rowsFallen = Math.max(rowsFallen, (pose.at?.(world)?.row ?? 0) - startRow);
      }
      // And the body really did travel — a window that follows a body that
      // never moved would pass this saying nothing.
      expect(rowsFallen, `${pose.name} never fell`).toBeGreaterThan(3);
      const last = bodyCentre(pose, world);
      expect(last.y, `${pose.name} would have stayed in a fixed window`).toBeGreaterThan(
        stuck.y + stuck.h,
      );
    });
  }
});
