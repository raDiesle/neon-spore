import { beforeAll, describe, expect, it } from "bun:test";
import { clearBakedCaches } from "../src/baked.js";
import { groundSheet } from "../src/band-ground.js";
import { haloSprite } from "../src/glow.js";
import { navBlob } from "../src/nav-button.js";
import { installCanvasGlobals } from "./canvas-stub.js";

/**
 * The caches render bakes sprites, sheets and contours into, and the one thing
 * a test needs of them: that a run can start cold.
 *
 * They are module state, so whichever test first asked for a size paid for the
 * bake and every test after it was handed one free. `frame-budget.test.ts`'s
 * first row carried fourteen `new Path2D` for the panel's sheet that the
 * second seat — same size, same sheet — did not, so the rows were true for the
 * order the loop happened to run in and reordering the seats would have failed
 * the test for a reason that had nothing to do with the frame.
 */

beforeAll(installCanvasGlobals);

const SHEET = [390, 180, 3] as const;
const HALO = ["#ff8800", 24] as const;
const BLOB = [96, 40] as const;

describe("the caches render bakes into", () => {
  it("hands back the same thing until it is emptied", () => {
    const sheet = groundSheet(...SHEET);
    const halo = haloSprite(...HALO);
    const blob = navBlob(...BLOB);
    expect(groundSheet(...SHEET)).toBe(sheet);
    expect(haloSprite(...HALO)).toBe(halo);
    expect(navBlob(...BLOB)).toBe(blob);

    clearBakedCaches();
    expect(groundSheet(...SHEET)).not.toBe(sheet);
    expect(haloSprite(...HALO)).not.toBe(halo);
    expect(navBlob(...BLOB)).not.toBe(blob);
  });

  it("is emptied by installing the canvas globals, so every run starts cold", () => {
    // This is what makes a frame budget a budget rather than a note about the
    // order the file's tests happen to run in — and it is also what stops a
    // sprite baked on one test's stub canvas being blitted onto the next
    // one's.
    const sheet = groundSheet(...SHEET);
    const halo = haloSprite(...HALO);
    installCanvasGlobals();
    expect(groundSheet(...SHEET)).not.toBe(sheet);
    expect(haloSprite(...HALO)).not.toBe(halo);
  });
});
