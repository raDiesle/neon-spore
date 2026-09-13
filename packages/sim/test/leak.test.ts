import { describe, expect, it } from "bun:test";
import { DEFAULT_CONFIG, ticksPerBeat } from "../src/config.js";
import { lanceLeaks, lanceReady, primeChargeMilli, priming } from "../src/lance.js";
import { faultSwallows } from "../src/malfunction.js";
import type { Command, TimedCommand } from "../src/types.js";
import { startWave } from "../src/wave-start.js";
import { createWorld, type SpawnEntry, step, type World } from "../src/world.js";

/**
 * THE LEAK: the fault that takes a **gesture** rather than a control.
 *
 * Every other fault is tested by what a press does not do. This one has to be
 * tested from both ends at once, because the two halves are what make it the
 * mechanic the owner asked for rather than a broken trigger: **the beam never
 * comes, and the tap still fires**. A fault that swallowed the press would
 * have passed the first half and failed the game.
 */

const CFG = DEFAULT_CONFIG;
const TPB = ticksPerBeat(CFG);
/** Long enough for any hold to have come full twice over. */
const HELD = Math.round(CFG.lancePrimeBeats * TPB) + 2 * TPB;

const slick = (col: number): SpawnEntry => ({ beat: 0, col, kind: "slick", color: "red" });

function leakWorld(queue: SpawnEntry[], fault = true): World {
  const world = createWorld({ ...CFG }, 0);
  startWave(world, 0, queue, [], null, false, 0, fault ? { kind: "leak" } : null);
  return world;
}

function play(world: World, ticks: number, inputs: TimedCommand[] = []): World {
  const byTick = new Map<number, TimedCommand[]>();
  for (const i of inputs) byTick.set(i.tick, [...(byTick.get(i.tick) ?? []), i]);
  for (let t = 0; t < ticks; t++) step(world, byTick.get(t) ?? []);
  return world;
}

const aim = (tick: number, col: number): TimedCommand => ({
  tick,
  player: 1,
  command: { kind: "cannonCol", col },
});
const press = (tick: number, on: boolean): TimedCommand => ({
  tick,
  player: 2,
  command: { kind: "prime", on, color: "red" },
});

describe("the lobe under THE LEAK", () => {
  it("fills nothing, however long the thumb stays down", () => {
    const world = leakWorld([slick(3)]);
    play(world, HELD, [press(0, true)]);
    expect(lanceLeaks(world)).toBe(true);
    // The thumb is still down — this is a lobe that is being held, not one
    // nobody pressed — and there is nothing in it.
    expect(priming(world)).toBe(true);
    expect(primeChargeMilli(world)).toBe(0);
  });

  it("never comes full, so no beam is ever standing in the column", () => {
    const world = leakWorld([slick(3)]);
    play(world, HELD, [press(0, true)]);
    expect(lanceReady(world)).toBe(false);
    expect(world.beam).toBeNull();
  });

  it("is the fault and not the fill: the same hold on the same wave lances", () => {
    // The control, and the one this whole file rests on: without the fault
    // this exact hold burns the column with nothing lifted. If it did not,
    // every expectation above would pass on a wave that simply could not
    // lance, and the fault would be proving nothing at all.
    const world = leakWorld([slick(3)], false);
    play(world, 1, [aim(0, 3)]);
    play(world, HELD, [press(0, true)]);
    expect(world.creatures).toHaveLength(0);
  });

  it("leaves the body standing under a thumb that never comes up", () => {
    // The same hold, the same column, the fault on: nothing has fired, because
    // the only thing that fires without a lift is the beam.
    const world = leakWorld([slick(3)]);
    play(world, 1, [aim(0, 3)]);
    play(world, HELD, [press(0, true)]);
    expect(world.creatures).toHaveLength(1);
  });
});

describe("the trigger under THE LEAK", () => {
  it("swallows nothing, so the panel is not dead", () => {
    const world = leakWorld([slick(3)]);
    const kinds: Command[] = [
      { kind: "cannonCol", col: 2 },
      { kind: "shieldCol", col: 4 },
      { kind: "guard" },
      { kind: "fire", color: "red" },
      { kind: "prime", on: true, color: "cyan" },
    ];
    for (const c of kinds) {
      expect(faultSwallows(world, c), `${c.kind} swallowed`).toBe(false);
    }
  });

  it("still owes the ordinary bolt on the lift, which is what a tap is", () => {
    // The half that makes it a lost weapon rather than a lost trigger: press,
    // hold past the top, lift — and a body standing in the column dies of the
    // bolt the lift fired.
    const world = leakWorld([slick(3)]);
    play(world, 1, [aim(0, 3)]);
    play(world, HELD + 4 * TPB, [press(0, true), press(HELD, false)]);
    expect(world.creatures).toHaveLength(0);
  });
});
