import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildQueue, controlSetForWave, placedFaults, WAVES } from "@neon-spore/content";
import { createWorld, flipSeat, startWave, step, ticksPerBeat, type World } from "@neon-spore/sim";
import { anchorPoint } from "../src/caption-anchor.js";
import { filmLayout, seatLayout } from "../src/guide-film.js";
import { computeLayout, tileCX } from "../src/layout.js";
import { CFG, FRAME_TIMEOUT_MS, installCanvasGlobals } from "./frame-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * **A rehearsal folds the screen THE FLIP has turned, and only that one.**
 *
 * The phone mirrors its bodies through the layout (`field-flip.ts`,
 * `canvas2d.ts`), and until 18 September 2026 the film of the same wave did
 * not: `guide-scene.ts` laid its seats out and never asked the world whose
 * screen was turned, so the one picture of a mirror the pair is ever shown
 * was a picture of nothing happening. What holds here is the composition the
 * film now performs — the seat's layout carries the fold — and the fact that
 * matters on the page: a ring pointed at a body lands where the body is
 * drawn, on the mirrored column, while a ring on a control does not move.
 */

const PHONE = { width: 390, height: 844, dpr: 1 };
const WAVE = WAVES.findIndex((w) => w.name === "THE FLIP");
const TPB = ticksPerBeat(CFG);

beforeAll(installCanvasGlobals);

/** The wave's own world, stepped this many beats in — past the fold or not. */
function flipped(beats: number): World {
  const world = createWorld({ ...CFG, briefings: false }, 3);
  const queue = buildQueue(WAVE, CFG.cols);
  startWave(world, WAVE, queue, [], null, false, 0, placedFaults(WAVES[WAVE]?.faults));
  for (let t = 0; t < TPB * beats; t++) step(world, []);
  return world;
}

describe("the layout a rehearsal draws a seat with", () => {
  it("is reached at all: the wave carries the fault, on the pilot, at its sixth beat", () => {
    expect(WAVE).toBeGreaterThanOrEqual(0);
    expect(flipSeat(flipped(2))).toBeNull();
    expect(flipSeat(flipped(8))).toBe(1);
  });

  it("stays flat on both seats before the fold", () => {
    const world = flipped(2);
    const box = computeLayout(PHONE, CFG, "p1");
    for (const seat of [1, 2] as const) {
      const own = seatLayout(filmLayout(box, CFG, seat).l, seat, world);
      expect(own.flip).toBe(false);
    }
  });

  it("folds the turned seat's screen and leaves the other's, whichever seat it was laid out for", () => {
    const world = flipped(8);
    const box = computeLayout(PHONE, CFG, "p1");
    for (const laidFor of [1, 2] as const) {
      const { l } = filmLayout(box, CFG, laidFor);
      // The outgoing screen of a slide is drawn in the incoming one's rectangle.
      const pilot = seatLayout(l, 1, world);
      const navigator = seatLayout(l, 2, world);
      expect([pilot.role, pilot.flip]).toEqual(["p1", true]);
      expect([navigator.role, navigator.flip]).toEqual(["p2", false]);
    }
  });
});

describe("a caption on the turned screen", () => {
  it("rings the body where the fold draws it, and the control where it stayed", () => {
    const world = flipped(8);
    expect(world.creatures.length).toBeGreaterThan(0);
    const set = controlSetForWave(WAVE);
    const box = computeLayout(PHONE, CFG, "p1");
    const folded = seatLayout(filmLayout(box, CFG, 1).l, 1, world);
    const flat = { ...folded, flip: false };
    const body = anchorPoint(folded, world, set, { at: "body" }, 0);
    const bodyFlat = anchorPoint(flat, world, set, { at: "body" }, 0);
    if (!body || !bodyFlat) throw new Error("no body to point at");
    // Mirrored about the field's middle: the two rings are as far from it as
    // each other, on opposite sides, and the field has an odd column count so
    // neither is the middle column itself.
    const middle = (tileCX(folded, 0) + tileCX(folded, CFG.cols - 1)) / 2;
    expect(body.x).not.toBeCloseTo(bodyFlat.x, 3);
    expect(body.x - middle).toBeCloseTo(middle - bodyFlat.x, 3);
    const thumb = { at: "control", control: "cannon" } as const;
    const control = anchorPoint(folded, world, set, thumb, 0);
    const controlFlat = anchorPoint(flat, world, set, thumb, 0);
    expect(control).toEqual(controlFlat);
  });
});
