import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { controlSet } from "@neon-spore/content";
import { createWorld, DEFAULT_CONFIG, startWave, step, surgeBoss } from "@neon-spore/sim";
import { anchorPoint } from "../src/caption-anchor.js";
import { handleCircle } from "../src/handles.js";
import { computeLayout } from "../src/layout.js";
import { surgeBulbCircle } from "../src/surge-shape.js";
import { FRAME_TIMEOUT_MS, installCanvasGlobals } from "./canvas-stub.js";

// The cap, applied per file because bun applies it to the file it is in
// (`canvas-stub.ts`).
setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * WHERE A CAPTION ABOUT THE SURGE'S BULB POINTS.
 *
 * The bulb is the one handle both seats hold, and a `DragTarget` with no
 * branch in `handleCircle` falls through to the **lid** lookup and answers
 * about a body that was never there (`choir-anchor.test.ts`). Its answer is
 * the hit test's own circle (`surge-grip.ts`), on the row the bulb hangs at
 * — a row lower per notch open — so the caption follows the bulb down.
 */

const CFG = DEFAULT_CONFIG;
const L = computeLayout({ width: 390, height: 844, dpr: 2 }, CFG, "p1");
const NAVIGATOR = computeLayout({ width: 390, height: 844, dpr: 2 }, CFG, "p2");
const SET = controlSet("default");

beforeAll(installCanvasGlobals);

/** A world with the bulb installed, a beat in. */
function withSurge() {
  const world = createWorld(CFG, 1, []);
  startWave(world, 9, [], [], { kind: "surge" });
  for (let t = 0; t < 60; t++) step(world, []);
  if (surgeBoss(world) === null) throw new Error("no bulb was installed");
  return world;
}

describe("a caption pointed at THE SURGE's bulb", () => {
  it("is the circle a thumb is tested against, and follows the bulb down a notch", () => {
    const world = withSurge();
    const s = surgeBoss(world);
    if (s === null) throw new Error("no bulb");
    const at = handleCircle(L, world, "surgeBulb", 0);
    expect(at).toEqual(surgeBulbCircle(L, CFG, s));
    s.notches = 2;
    const lower = handleCircle(L, world, "surgeBulb", 0);
    expect(lower?.x).toBe(at?.x ?? -1);
    expect(lower?.y ?? 0).toBeGreaterThan(at?.y ?? 0);
  });

  it("is nothing at all with no bulb on the field", () => {
    expect(handleCircle(L, createWorld(CFG, 1, []), "surgeBulb", 0)).toBeNull();
  });

  it("is on both screens, so either seat's caption finds it", () => {
    expect(handleCircle(NAVIGATOR, withSurge(), "surgeBulb", 0)).not.toBeNull();
  });

  it("reaches a page's caption through the anchor a film would write", () => {
    const world = withSurge();
    const at = anchorPoint(L, world, SET, { at: "handle", target: "surgeBulb" }, 0);
    expect(at).not.toBeNull();
    expect(at?.x).toBe(handleCircle(L, world, "surgeBulb", 0)?.x ?? -1);
  });
});
