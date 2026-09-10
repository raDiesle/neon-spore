import { describe, expect, test } from "bun:test";
import {
  computeLayout,
  computeStage,
  drawnCol,
  drawnRow,
  tileCX,
  tileCY,
} from "@neon-spore/render";
import { beatPhase, ticksPerBeat, type World } from "@neon-spore/sim";
import { VARIANTS } from "../../versus/candidates/index.js";
import { poseCropRect } from "../src/pose-art.js";
import type { Pose } from "../src/pose-kit.js";
import { SURFACE_POSES } from "../src/poses-surface.js";
import { VERSUS_POSES } from "../src/poses-versus.js";
import { CropWindow } from "../src/versus-crop.js";
import { advance } from "../src/versus-pair.js";
import { poseForSlot } from "../src/versus-pose.js";

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
  /**
   * The two that were widened are named, because that is the regression: a
   * later lane putting either back on `crop: "field"` would otherwise pass
   * this file by having nothing left in it to check. The rest of the group is
   * not required to be tile-cropped — a gyre is five columns wide with its
   * mounts counted, and a window fitted to one tile of it cuts off the wheel.
   */
  test("the two poses that were widened are back on a tile", () => {
    for (const name of ["CHOIR · TWO VOICES", "THROB · TURNING"]) {
      const pose = SURFACE_POSES.find((p) => p.name === name);
      expect(pose?.crop, `${name} is not cropped to a tile`).toBe("tile");
      expect(pose?.at, `${name} has no body to centre on`).toBeDefined();
    }
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

/**
 * The test above measures the body by `pose.at()` — which is also what the
 * window is centred on, so it could never notice `at` being the wrong place.
 * It was: `firstOfKind` answered with the tile the body was **stepping to**,
 * and the renderer draws the body gliding there from where it was
 * (`drawnCol`, `drawnRow`), so a dart two columns a beat and a chute four
 * rows a beat spent most of every beat outside their own windows. This holds
 * the fix from the other side: at the middle of a beat, where a moving body
 * is furthest from either tile, the centre of every tile-cropped pose the
 * pair can open is where some creature is *drawn* — never a tile it has not
 * reached.
 *
 * The pair's poses and not the whole gallery, on purpose: a reference card
 * is one frame drawn at handover and never stepped, and several of those
 * centre on a fixed tile — a pod, a boss, a rock at rest — which is right
 * for a still and would fail this for no defect. The pair is where a pose
 * runs, so the pair's poses are the ones whose centre has to keep up.
 */
describe("a tile crop is centred on a body as it is drawn", () => {
  const opened = new Set(VARIANTS.map((v) => poseForSlot(v.slot)));
  const paired = [...new Set([...VERSUS_POSES, ...opened])].filter(
    (p) => p.crop === "tile" && p.at,
  );
  test("there are tile poses to check", () => {
    expect(paired.length).toBeGreaterThan(0);
  });
  for (const pose of paired) {
    test(`${pose.name} is centred on a drawn body mid-beat`, () => {
      const world = pose.build();
      const tpb = ticksPerBeat(world.cfg);
      // Step to the middle of a beat, so a striding body is between tiles.
      // Through `advance`, so a pose with a hand on the world keeps it.
      let w = world;
      const target = Math.floor(w.tick / tpb) * tpb + Math.floor(tpb / 2);
      const stop = target <= w.tick ? target + tpb : target;
      while (w.tick < stop) w = advance(w, () => pose.build(), pose).world;
      const at = pose.at?.(w);
      expect(at).toBeDefined();
      const phase = beatPhase(w.cfg, w.tick);
      // The nearest body as drawn, and how far the centre sits from where it
      // is drawn against where it is stepping to. A centre on the target tile
      // of a striding body is nearer the target than the picture; one that
      // follows the picture is not. A fixture that never moves, or a pose that
      // deliberately centres a tile off its body (the queen's), passes both
      // ways, because for it the two distances are the same.
      const gap = (col: number, row: number) => Math.hypot(col - at!.col, row - at!.row);
      const nearest = w.creatures
        .map((c) => ({
          drawn: gap(drawnCol(c, phase), drawnRow(c, phase)),
          target: gap(c.col, c.row),
        }))
        .sort((a, b) => a.drawn - b.drawn)[0];
      expect(nearest, `${pose.name}: no creature on the field`).toBeDefined();
      expect(
        nearest!.drawn,
        `${pose.name}: the window is centred nearer where its body is going than where it is drawn`,
      ).toBeLessThanOrEqual(nearest!.target + 1e-6);
    });
  }
});
