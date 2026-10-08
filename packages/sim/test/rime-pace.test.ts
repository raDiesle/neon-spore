import { describe, expect, it } from "bun:test";
import { RIME_FULL_MILLI, type RimeStep } from "../src/rime.js";
import { CFG, install, rime, rub, TPB, tick, toLit } from "./rime-rig.js";

/**
 * THE RIME's count against its window (the owner, 7 October 2026: *every
 * "Rub" should require more rubs*): from solid frost a wipe takes thirteen
 * reversals and from the film seven, and the shortest wipe the act authors,
 * four beats, still holds them at one thumb's pace — three reversals a second
 * of the hand, which under THE SLOW's quarter rate is one every ten ticks.
 */

const EVERY = Math.floor((CFG.tickHz * CFG.slowRateMilli) / 1000 / 3);
const SHORT: readonly RimeStep[] = [
  { ask: "left", color: "either", beats: 4 },
  { ask: "left", color: "either", beats: 4 },
  { ask: "fire", color: "either", beats: 3 },
];

/** One thumb down on the left half, turned back at a thumb's pace until it clears or four beats go by. */
function rubAtPace(world: ReturnType<typeof install>): Set<string> {
  const seen = new Set<string>();
  const end = world.tick + 4 * TPB;
  rub(world, "left", false);
  for (let n = 1; world.tick < end && !seen.has("rimeClear"); n++) {
    for (const e of rub(world, "left", true, n)) seen.add(e);
    for (let i = 1; i < EVERY; i++) for (const e of tick(world)) seen.add(e);
  }
  return seen;
}

describe("THE RIME's wipe at a thumb's pace", () => {
  it("needs thirteen reversals from solid and seven from the film", () => {
    expect(Math.ceil(RIME_FULL_MILLI / CFG.rimeShaveMilli)).toBe(13);
    expect(Math.ceil(CFG.rimeFilmMilli / CFG.rimeShaveMilli)).toBe(7);
  });

  it("clears both of a half's wipes inside four beats each", () => {
    const world = install(SHORT);
    toLit(world);
    const first = rubAtPace(world);
    expect(first.has("rimeClear")).toBe(true);
    expect(first.has("rimeFrost")).toBe(false);
    toLit(world);
    expect(rime(world).rimeMilli[0]).toBe(CFG.rimeFilmMilli);
    const second = rubAtPace(world);
    expect(second.has("rimeClear")).toBe(true);
    expect(second.has("rimeFrost")).toBe(false);
  });
});
