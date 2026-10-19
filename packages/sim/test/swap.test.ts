import { describe, expect, it } from "bun:test";
import { DEFAULT_CONFIG, ticksPerBeat } from "../src/config.js";
import { faultStep } from "../src/fault-clock.js";
import { type PlacedFault, TO_THE_END } from "../src/fault-placed.js";
import { faultSwallows } from "../src/fault-swallow.js";
import { handedOver } from "../src/handover.js";
import { swapChangedAgo, swapChangeIn, swapInWave, swapWarning } from "../src/swap.js";
import { startWave } from "../src/wave-start.js";
import { createWorld, step, type World } from "../src/world.js";

/**
 * THE SWAP: the panels change hands on the placement's first beat and every
 * `swapEveryBeats` after it, come home on its last beat if they are away, and
 * every change is counted down `swapWarnBeats` ahead. Like THE HANDOVER it
 * changes nothing in the simulation, so what is held here is the clock.
 */

const CFG = DEFAULT_CONFIG;
const TPB = ticksPerBeat(CFG);
const EVERY = CFG.swapEveryBeats;
const WARN = CFG.swapWarnBeats;

function swapWorld(at: number, beats: number): World {
  const world = createWorld({ ...CFG, hullInvulnerable: true }, 7);
  startWave(world, 0, [], [], null, false, 0, [{ kind: "swap", at, beats } as PlacedFault]);
  return world;
}

/** Each fault step of the wave, in order, with what the clock says on it. */
function walk(
  world: World,
  steps: number,
): { step: number; away: boolean; warn: number; ago: number }[] {
  const seen = new Map<number, { step: number; away: boolean; warn: number; ago: number }>();
  for (let t = 0; t < (steps + 2) * TPB; t++) {
    step(world, []);
    const s = faultStep(world);
    if (!seen.has(s)) {
      seen.set(s, {
        step: s,
        away: handedOver(world),
        warn: swapWarning(world),
        ago: swapChangedAgo(world),
      });
    }
  }
  return [...seen.values()].filter((r) => r.step <= steps);
}

describe("THE SWAP", () => {
  it("is the owner's numbers: a change every twelve beats, warned five ahead", () => {
    expect(EVERY).toBe(12);
    expect(WARN).toBe(5);
  });

  it("trades on its first beat, back every period, and home on its last", () => {
    const at = 4;
    const beats = EVERY * 2 + 6;
    const rows = walk(swapWorld(at, beats), at + beats + 2);
    const away = (s: number) => rows.find((r) => r.step === s)?.away;
    expect(away(at - 1)).toBe(false);
    expect(away(at)).toBe(true);
    expect(away(at + EVERY - 1)).toBe(true);
    expect(away(at + EVERY)).toBe(false);
    expect(away(at + EVERY * 2)).toBe(true);
    expect(away(at + beats - 1)).toBe(true);
    expect(away(at + beats)).toBe(false);
  });

  it("counts down every change, including the one home at the end", () => {
    const at = 6;
    // Away for a period, home for a period, then away again for four beats
    // when the placement ends — so the last change is the one home.
    const beats = EVERY * 2 + 4;
    const rows = walk(swapWorld(at, beats), at + beats + 2);
    const warn = (s: number) => rows.find((r) => r.step === s)?.warn;
    expect(warn(at - WARN - 1)).toBe(0);
    expect(warn(at - WARN)).toBe(WARN);
    expect(warn(at - 1)).toBe(1);
    expect(warn(at)).toBe(0);
    expect(warn(at + EVERY - 1)).toBe(1);
    expect(warn(at + EVERY * 2 - 1)).toBe(1);
    expect(warn(at + beats - 1)).toBe(1);
    expect(warn(at + beats)).toBe(0);
  });

  it("does not warn about a return that never comes", () => {
    // Two periods long: away for the first, home for the second, and on the
    // end beat they are already home — so nothing is counted down to it.
    const rows = walk(swapWorld(0, EVERY * 2), EVERY * 2 + 4);
    expect(rows.find((r) => r.step === EVERY * 2 - 1)?.warn).toBe(0);
    expect(rows.find((r) => r.step === EVERY * 2)?.away).toBe(false);
  });

  it("knows how long ago the last change was, for a picture of it", () => {
    const at = 2;
    const rows = walk(swapWorld(at, TO_THE_END), at + EVERY + 3);
    const ago = (s: number) => rows.find((r) => r.step === s)?.ago;
    expect(ago(at - 1)).toBe(-1);
    expect(ago(at)).toBe(0);
    expect(ago(at + 1)).toBe(1);
    expect(ago(at + EVERY)).toBe(0);
  });

  it("swallows nothing and is said to be in the wave", () => {
    const world = swapWorld(0, TO_THE_END);
    expect(swapInWave(world)).toBe(true);
    step(world, []);
    expect(faultSwallows(world, { kind: "fire", color: "red" })).toBe(false);
    expect(swapChangeIn(world)).toBeGreaterThan(0);
  });
});
