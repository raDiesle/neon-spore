import { describe, expect, it } from "bun:test";
import { beatSeconds, createWorld, DEFAULT_CONFIG, MILLI } from "@neon-spore/sim";
import { smoothstep } from "../src/ease.js";
import { ramp } from "../src/slow-intake-aim.js";
import type { SlowWindow } from "../src/slow-look.js";

/**
 * **The look eases over the same wall seconds at every pace** (`ramp`,
 * `slow-intake-aim.ts`). THE FLUE's levels open their windows at their own
 * pace (`sim/slow.ts` `openSlow`), and until 7 October 2026 the look read the
 * config's: at the ordinary rate it took a quarter as long to arrive.
 */

const BEATS = 20;
/** Half the look's arrival, in wall seconds: four tenths for the whole of it. */
const HALF = 0.2;

function window(left: number): SlowWindow {
  return { beats: BEATS, through: 1 - left / BEATS, left, span: BEATS, asks: true, holds: false };
}

describe("the slow look's ease", () => {
  it.each([250, 500, 1000])("is halfway up a fifth of a second in, at a pace of %i", (pace) => {
    const world = createWorld({ ...DEFAULT_CONFIG }, 1);
    // As `openSlow` opens one (`sim/slow.ts`), which the package does not export.
    world.slowFromBeat = world.beat;
    world.slowToBeat = world.beat + BEATS;
    world.slowPaceMilli = pace;
    const inHand = beatSeconds(world.cfg) * (MILLI / pace);
    expect(ramp(window(BEATS - HALF / inHand), world)).toBeCloseTo(smoothstep(0.5), 9);
  });
});
