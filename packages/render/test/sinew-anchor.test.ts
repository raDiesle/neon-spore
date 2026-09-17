import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { controlSet } from "@neon-spore/content";
import { createWorld, DEFAULT_CONFIG, sinewBoss, startWave, step } from "@neon-spore/sim";
import { anchorPoint } from "../src/caption-anchor.js";
import { handleCircle } from "../src/handles.js";
import { computeLayout } from "../src/layout.js";
import { sinewHandleCircle } from "../src/sinew-handles.js";
import { FRAME_TIMEOUT_MS, installCanvasGlobals } from "./canvas-stub.js";

// The cap, applied per file because bun applies it to the file it is in
// (`canvas-stub.ts`).
setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * WHERE A CAPTION ABOUT ONE OF THE SINEW'S HANDLES POINTS.
 *
 * THE CHOIR's arrows and THE BALLOON's handles each earned a branch in
 * `handleCircle` because a `DragTarget` with none fell through to the **lid**
 * lookup and answered about a body that was never there (`choir-anchor.test.ts`).
 * THE SINEW's two are the third pair with that shape of risk, and the first
 * hung off a boss rather than a creature; the answer is the drawing's own
 * (`sinewHandleAt`), so the ring, the finger and the caption agree on a place.
 */

const CFG = DEFAULT_CONFIG;
const L = computeLayout({ width: 390, height: 844, dpr: 2 }, CFG, "p1");
const NAVIGATOR = computeLayout({ width: 390, height: 844, dpr: 2 }, CFG, "p2");
const SET = controlSet("default");

beforeAll(installCanvasGlobals);

/** A world with the tendon installed, a beat in. */
function withSinew() {
  const world = createWorld(CFG, 12, []);
  startWave(world, 9, [], [], { kind: "sinew" });
  for (let t = 0; t < 60; t++) step(world, []);
  if (sinewBoss(world) === null) throw new Error("no tendon was installed");
  return world;
}

describe("a caption pointed at one of THE SINEW's handles", () => {
  it("rests where the drawing and the finger both put it, one either side", () => {
    const world = withSinew();
    const s = sinewBoss(world);
    if (s === null) throw new Error("no tendon");
    for (const [target, side] of [
      ["sinewLeft", -1],
      ["sinewRight", 1],
    ] as const) {
      const at = handleCircle(L, world, target, 0);
      const rest = sinewHandleCircle(L, CFG, s, world.beat, 0, side);
      expect(at, target).not.toBeNull();
      expect(at?.x, target).toBe(rest.x);
      expect(at?.y, target).toBe(rest.y);
    }
    expect(handleCircle(L, world, "sinewLeft", 0)?.x).toBeLessThan(
      handleCircle(L, world, "sinewRight", 0)?.x ?? 0,
    );
  });

  it("stands where the hand carried it once one is on", () => {
    const world = withSinew();
    const s = sinewBoss(world);
    if (s === null) throw new Error("no tendon");
    for (const fromYMilli of [0, 500]) {
      const command = {
        kind: "drag",
        target: "sinewRight",
        on: true,
        fromMilli: 0,
        fromYMilli,
      } as const;
      step(world, [{ tick: world.tick, player: 2, command }]);
    }
    expect(s.pullP2Milli).toBe(500);
    // The rest itself follows the mass, which a pull moves; the hand is the
    // pull below wherever the rest now is.
    const rest = sinewHandleCircle(L, CFG, s, world.beat, 0, 1);
    const held = handleCircle(L, world, "sinewRight", 0);
    expect(held?.x).toBe(rest.x);
    expect(held?.y).toBe(rest.y + (500 * L.tile) / 1000);
  });

  it("is nothing at all with no tendon on the field", () => {
    expect(handleCircle(L, createWorld(CFG, 1, []), "sinewLeft", 0)).toBeNull();
  });

  it("is drawn on both screens, so the navigator's caption finds it too", () => {
    expect(handleCircle(NAVIGATOR, withSinew(), "sinewLeft", 0)).not.toBeNull();
  });

  it("reaches a page's caption through the anchor a film would write", () => {
    const world = withSinew();
    const at = anchorPoint(L, world, SET, { at: "handle", target: "sinewLeft" }, 0);
    expect(at).not.toBeNull();
    expect(at?.x).toBe(handleCircle(L, world, "sinewLeft", 0)?.x ?? -1);
  });
});
