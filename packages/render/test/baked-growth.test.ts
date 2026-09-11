import { describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildQueue } from "@neon-spore/content";
import { createWorld } from "@neon-spore/sim";
import { bakedEntries } from "../src/baked.js";
import { CFG, FRAME_TIMEOUT_MS, installCanvasGlobals, runFrames } from "./frame-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * WHAT A CACHE KEYED ON SOMETHING THAT MOVES LOOKS LIKE.
 *
 * The house pattern for drawing something expensive cheaply is everywhere in
 * this package: `glow.ts` keys a halo on `${colour}@${radius}`, `key-light.ts`
 * rounds a radius to four pixels and a spin to a twenty-fourth, `sheen.ts`
 * rounds its bloom radius, `depth.ts` quantises its haze into six steps for
 * exactly this reason and says so. Every one of them exists because the failure
 * is not "a slower frame": it is a cache that never hits, baking a canvas per
 * frame *and keeping all of them*.
 *
 * `frame-budget.test.ts` cannot see that. A cache missing every frame costs
 * precisely what having no cache costs, so the op count is unchanged and the
 * budget stays green while the phone fills up. What gives it away is how many
 * things are being held: a quantised key has a small fixed set of answers
 * however long the game runs, and a key that drifts has one per frame.
 *
 * So this is not a ceiling on how much may be baked — bake as much as the
 * picture wants. It is the distance between those two shapes, and the run is
 * long on purpose: four hundred frames, where a single drifting key would put
 * four hundred entries in on its own.
 */

/** Four hundred frames, at `runFrames`'s one frame every fourth tick. */
const TICKS = 1600;
const FRAMES = TICKS / 4;

function entriesAfter(role: "p1" | "p2"): number {
  installCanvasGlobals();
  runFrames(createWorld(CFG, 7, buildQueue(0, CFG.cols)), role, TICKS);
  return bakedEntries();
}

/**
 * What each seat holds after that run. Exact and measured, not padded, the way
 * `frame-budget.test.ts`'s rows are: a number that is allowed to be "about
 * right" is a number nobody notices doubling. A legitimate new sprite raises
 * one of these by the handful of keys it is baked at — remeasure and move the
 * row in the same commit. A change that puts it into the hundreds has not
 * added sprites, it has added a key that moves.
 */
// Four more on each seat from 10 September 2026, when the slick's own motion
// became BANK: it rolls with its own travel through a wider arc than SWALLOW's
// lean, so `key-light.ts`'s twenty-fourth-of-a-turn spin key takes four more
// distinct values on the first wave's slicks — a bounded set, as the run says.
// One more on each seat from 11 September 2026: the light in the sky's
// bottom-right corner (`corner-light.ts`), baked once per size and act tint —
// one key on one wave.
const HELD = { p1: 78, p2: 83 } as const;

describe("what the renderer keeps between frames", () => {
  for (const role of ["p1", "p2"] as const) {
    it(`bakes a bounded set of things over ${FRAMES} frames on ${role}`, () => {
      const held = entriesAfter(role);
      expect(held).toBe(HELD[role]);
      // The claim, rather than the number: whatever is held, it is not one
      // thing per frame. Nothing quantised can approach this line.
      expect(held).toBeLessThan(FRAMES / 4);
    });
  }
});
