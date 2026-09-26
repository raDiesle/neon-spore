import { describe, expect, it } from "bun:test";
import { DEFAULT_CONFIG, ticksPerBeat } from "../src/config.js";
import { faultCovers, faultOn, faultsNow, faultWindow, TO_THE_END } from "../src/fault-placed.js";
import { faultSwallows } from "../src/fault-swallow.js";
import type { Command } from "../src/types.js";
import { startWave } from "../src/wave-start.js";
import { createWorld, step, type World } from "../src/world.js";

/**
 * **A FAULT IS A PENCIL ON THE MAP**, and this is the half of that which is a
 * function of a beat.
 *
 * The owner asked for it on 14 September 2026: *all malfunctions are not
 * attached to the wave, but a pencil to be placed on the map, so I can define
 * when it enters the wave (what beat row) and when it ends.* A wave carried
 * exactly one fault before that, for the whole of itself.
 *
 * Three things are worth holding and they are the three the old shape could not
 * say: a fault that **has not started yet**, a fault that **has finished**, and
 * **two at once**. The fourth — a fault placed with no end — is the shape every
 * wave that already carried one is written with, so it is here as the control:
 * if that broke, nothing in the game would have a fault at all.
 */

const CFG = DEFAULT_CONFIG;
const TPB = ticksPerBeat(CFG);

/**
 * A world on a wave with these pencils on it, stood on the fault's own beat.
 *
 * `(beat + 1) * TPB`, which is `handover.test.ts`'s own line and the same
 * arithmetic: `onBeat` moves `waveBeat` before a fault reads it, so the wave's
 * first beat is 1 and the fault's own clock is one less (`fault-clock.ts`).
 */
function at(beat: number, faults: Parameters<typeof startWave>[7]): World {
  const world = createWorld({ ...CFG, hullInvulnerable: true }, 5);
  startWave(world, 0, [], [], null, false, 0, faults);
  for (let t = 0; t <= (beat + 1) * TPB; t++) step(world, []);
  return world;
}

const steer = (a: number, b: number) => ({ kind: "steer", at: a, beats: b }) as const;
const gun = (a: number, b: number) => ({ kind: "cannon", color: "red", at: a, beats: b }) as const;

describe("when a placed fault is in force", () => {
  it("covers its own rows and no others", () => {
    const f = { kind: "steer", at: 4, beats: 3 } as const;
    expect([3, 4, 5, 6, 7].map((s) => faultCovers(f, s))).toEqual([false, true, true, true, false]);
  });

  it("holds to the end of the wave when it names no length", () => {
    const f = { kind: "steer", at: 2, beats: TO_THE_END } as const;
    expect([1, 2, 200].map((s) => faultCovers(f, s))).toEqual([false, true, true]);
  });

  it("is not on before its row, and not on after it", () => {
    expect(faultOn(at(2, [steer(4, 3)]), "steer")).toBeNull();
    expect(faultOn(at(5, [steer(4, 3)]), "steer")).not.toBeNull();
    expect(faultOn(at(8, [steer(4, 3)]), "steer")).toBeNull();
  });
});

describe("a wave with more than one pencil on it", () => {
  it("has both in force where they overlap", () => {
    const world = at(5, [steer(4, 4), gun(5, 2)]);
    expect(faultsNow(world).map((f) => f.kind)).toEqual(["steer", "cannon"]);
  });

  it("swallows a press either of them takes", () => {
    // The whole reason `faultSwallows` asks a list: the strip is THE CHOKE's
    // and the colours are the gun's, and on a beat both stand over, a pair has
    // neither.
    const world = at(5, [steer(4, 4), gun(5, 2)]);
    const strip: Command = { kind: "cannonCol", col: 2 };
    const fire: Command = { kind: "fire", color: "red" };
    expect(faultSwallows(world, strip)).toBe(true);
    expect(faultSwallows(world, fire)).toBe(true);
    // And on a beat only the first covers, only the strip is gone.
    const earlier = at(4, [steer(4, 4), gun(5, 2)]);
    expect(faultSwallows(earlier, strip)).toBe(true);
    expect(faultSwallows(earlier, fire)).toBe(false);
  });

  it("places the same kind twice with quiet in between", () => {
    const twice = [steer(2, 2), steer(8, 2)];
    expect([1, 2, 4, 8, 10].map((b) => faultOn(at(b, twice), "steer") !== null)).toEqual([
      false,
      true,
      false,
      true,
      false,
    ]);
  });
});

describe("the window a picture counts down to", () => {
  it("is the one in force", () => {
    expect(faultWindow(at(5, [steer(4, 3)]), "steer")).toEqual({ from: 4, to: 7 });
  });

  it("is the next one when none is in force yet", () => {
    // THE HANDOVER's plate is why: it says how many beats until the panels
    // change, which means looking at a pencil that has not started.
    expect(faultWindow(at(1, [steer(4, 3), steer(20, 3)]), "steer")).toEqual({ from: 4, to: 7 });
    expect(faultWindow(at(9, [steer(4, 3), steer(20, 3)]), "steer")).toEqual({ from: 20, to: 23 });
  });

  it("is nothing at all for a kind the wave never places", () => {
    expect(faultWindow(at(5, [steer(4, 3)]), "codex")).toBeNull();
  });
});
