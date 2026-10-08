import { describe, expect, it } from "bun:test";
import { GRINDSTONE_FULL_MILLI, type GrindstoneStep } from "../src/grindstone.js";
import { CFG, grindstone, install, liftFlat, rub, TPB, tick, toLit } from "./grindstone-rig.js";

/**
 * THE GRINDSTONE's count against its window (the owner, 7 October 2026:
 * *every "Rub" should require more rubs*): from solid grit a pass takes
 * thirty-eight reversals and from the film nineteen, and the shipped passes,
 * six beats and then four, still hold them at one thumb's pace — three
 * reversals a second of the hand, which under THE SLOW's quarter rate is one
 * every ten ticks.
 */

const EVERY = Math.floor((CFG.tickHz * CFG.slowRateMilli) / 1000 / 3);
const PASSES: readonly GrindstoneStep[] = [
  { ask: "left", color: "either", beats: 6 },
  { ask: "left", color: "either", beats: 4 },
  { ask: "fire", color: "either", beats: 3 },
];

/** One thumb down on the left flat, turned back at a thumb's pace until it clears or `beats` go by. */
function rubAtPace(world: ReturnType<typeof install>, beats: number): Set<string> {
  const seen = new Set<string>();
  const end = world.tick + beats * TPB;
  for (let n = 1; world.tick < end && !seen.has("grindstoneClear"); n++) {
    for (const e of rub(world, 0, n)) seen.add(e);
    for (let i = 1; i < EVERY; i++) for (const e of tick(world)) seen.add(e);
  }
  liftFlat(world, 0);
  return seen;
}

describe("THE GRINDSTONE's pass at a thumb's pace", () => {
  it("needs thirty-eight reversals from solid and nineteen from the film", () => {
    expect(Math.ceil(GRINDSTONE_FULL_MILLI / CFG.grindstoneShaveMilli)).toBe(38);
    expect(Math.ceil(CFG.grindstoneFilmMilli / CFG.grindstoneShaveMilli)).toBe(19);
  });

  it("clears both of a flat's passes inside their beats", () => {
    const world = install(PASSES);
    toLit(world);
    const first = rubAtPace(world, 6);
    expect(first.has("grindstoneClear")).toBe(true);
    expect(first.has("grindstoneRegrit")).toBe(false);
    toLit(world);
    expect(grindstone(world).gritMilli[0]).toBe(CFG.grindstoneFilmMilli);
    const second = rubAtPace(world, 4);
    expect(second.has("grindstoneClear")).toBe(true);
    expect(second.has("grindstoneRegrit")).toBe(false);
  });
});
