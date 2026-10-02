import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { Canvas2DRenderer } from "../../../packages/render/src/canvas2d.js";
import {
  FRAME_TIMEOUT_MS,
  installCanvasGlobals,
  stubCanvas,
} from "../../../packages/render/test/canvas-stub.js";
import { beatPhase, type World } from "../../../packages/sim/src/index.js";
import { VARIANTS } from "../../versus/candidates/index.js";
import { seedRandom } from "../../versus/seed.js";
import { apply, restore } from "../../versus/variant.js";
import { POSE_GROUPS } from "../src/poses.js";
import { poseForSlot } from "../src/versus-pose.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * `instar:flight`'s pair has to show two different bodies. The serpent's
 * wave runs only while THE INSTAR flies (`instar-serpent.ts`), so on a pose
 * where it stays — `INSTAR · PERCHED`, where the slot used to open — the
 * candidate and the shipped body draw the same frame, and the vote is
 * between two identical pictures. `INSTAR · IN FLIGHT` holds it mid-pass.
 */

beforeAll(installCanvasGlobals);

/** The frame one world draws, every call and its numbers, as one string. */
function drawn(world: World): string {
  const { canvas, ctx } = stubCanvas();
  const log: string[] = [];
  ctx.log = log;
  const renderer = new Canvas2DRenderer(canvas);
  renderer.resize({ width: 380, height: 820, dpr: 1 });
  const unseed = seedRandom(1);
  try {
    renderer.draw({
      world,
      beatPhase: beatPhase(world.cfg, world.tick),
      role: "test",
      time: world.tick / world.cfg.tickHz,
      dt: 1 / world.cfg.tickHz,
      events: [],
      running: true,
    });
  } finally {
    unseed();
  }
  return log.join("|");
}

/** The shipped frame and the serpent's, on one world — after a frame drawn
 * and thrown away, which fills the sprite caches a first frame builds. */
function pair(world: World): [string, string] {
  const serpent = VARIANTS.find((v) => v.slot === "instar:flight" && v.name === "serpent");
  if (!serpent) throw new Error("no instar:flight serpent in VERSUS");
  drawn(world);
  const shipped = drawn(world);
  const applied = apply(serpent);
  try {
    return [shipped, drawn(world)];
  } finally {
    restore(applied);
  }
}

describe("instar:flight's pair", () => {
  it("opens on THE INSTAR in flight", () => {
    expect(poseForSlot("instar:flight").name).toBe("INSTAR · IN FLIGHT");
  });

  it("shows the serpent and the shipped body differing", () => {
    const [shipped, serpent] = pair(poseForSlot("instar:flight").build());
    expect(serpent).not.toBe(shipped);
  });

  it("would not on the perched pose it used to open on", () => {
    const perched = POSE_GROUPS.flatMap((g) => g.poses).find((p) => p.name === "INSTAR · PERCHED");
    if (!perched) throw new Error("no INSTAR · PERCHED pose");
    const [shipped, serpent] = pair(perched.build());
    expect(serpent).toBe(shipped);
  });
});
