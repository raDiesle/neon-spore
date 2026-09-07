import { beforeAll, describe, expect, it } from "bun:test";
import { controlSet } from "@neon-spore/content";
import { createWorld, DEFAULT_CONFIG, type SpawnEntry, step } from "@neon-spore/sim";
import { anchorPoint } from "../src/caption-anchor.js";
import { choirArrowCircle } from "../src/choir-arrows.js";
import { handleCircle } from "../src/handles.js";
import { computeLayout } from "../src/layout.js";
import { installCanvasGlobals } from "./canvas-stub.js";

/**
 * WHERE A CAPTION ABOUT THE TWO ARROWS POINTS.
 *
 * `SceneAnchor` has taken a `DragTarget` since THE LID's cord, and THE CHOIR's
 * two arrows are `DragTarget`s — so a film could name one and `handleCircle`
 * would fall through its two boss branches into the **lid** lookup and answer
 * about a body that was never there. Silent both ways: no lid, no caption at
 * all; a lid on the field, and a ring round it under words about an arrow.
 *
 * The arrows are also the one handle that is *placed* rather than found. There
 * is no held state to read — an arrow does not travel, it is a switch a hand
 * throws — so the answer is the same circle the drawing and the hit test use,
 * behind the same gate, and it is nothing at all when no membrane is up.
 */

const CFG = DEFAULT_CONFIG;
const L = computeLayout({ width: 390, height: 844, dpr: 2 }, CFG, "p1");
const NAVIGATOR = computeLayout({ width: 390, height: 844, dpr: 2 }, CFG, "p2");
const SET = controlSet("default");

beforeAll(installCanvasGlobals);

/** A world with a membrane on the field, stepped until it has arrived. */
function withChoir() {
  const queue: SpawnEntry[] = [{ beat: 0, col: 2, kind: "choir", color: "red" }];
  const world = createWorld(CFG, 1, queue);
  for (let t = 0; t < 120 && world.creatures.length === 0; t++) step(world, []);
  if (world.creatures.length === 0) throw new Error("no membrane ever arrived");
  return world;
}

describe("a caption pointed at one of THE CHOIR's arrows", () => {
  it("lands on the arrow the drawing and the finger both use", () => {
    const world = withChoir();
    for (const [target, side] of [
      ["choirLeft", -1],
      ["choirRight", 1],
    ] as const) {
      const at = handleCircle(L, world, target, 0);
      expect(at, target).not.toBeNull();
      expect(at?.x, target).toBe(choirArrowCircle(L, side).x);
      expect(at?.y, target).toBe(choirArrowCircle(L, side).y);
    }
    // And the two are not the same place, which is the whole of the gesture.
    expect(handleCircle(L, world, "choirLeft", 0)?.x).not.toBe(
      handleCircle(L, world, "choirRight", 0)?.x,
    );
  });

  it("is nothing at all with no membrane on the field", () => {
    // The gate the drawing asks, so a ring can never be put round an arrow
    // nobody was shown — rather than the lid lookup this used to fall into.
    const empty = createWorld(CFG, 1, []);
    expect(handleCircle(L, empty, "choirLeft", 0)).toBeNull();
  });

  it("is nothing on the navigator's screen, which draws none", () => {
    expect(handleCircle(NAVIGATOR, withChoir(), "choirRight", 0)).toBeNull();
  });

  it("reaches a page's caption through the anchor a film would write", () => {
    const world = withChoir();
    const at = anchorPoint(L, world, SET, { at: "handle", target: "choirLeft" }, 0);
    expect(at).not.toBeNull();
    expect(at?.x).toBe(choirArrowCircle(L, -1).x);
  });
});
