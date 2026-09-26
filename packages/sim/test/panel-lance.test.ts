import { describe, expect, it } from "bun:test";
import { DEFAULT_CONFIG, ticksPerBeat } from "../src/config.js";
import { faultSwallows } from "../src/fault-swallow.js";
import { lanceLeaks, lanceReady, primeChargeMilli, priming } from "../src/lance.js";
import type { Command, TimedCommand } from "../src/types.js";
import { startWave } from "../src/wave-start.js";
import { createWorld, type SpawnEntry, step, type World } from "../src/world.js";

/**
 * A panel whose hold fills nothing: the rungs of the standard ladder, and
 * STANDARD 5, which is every button and still no gesture.
 *
 * It has to be tested from both ends at once, because the two halves are what
 * make it a weapon the pair have not been given rather than a broken trigger:
 * **the beam never comes, and the tap still fires**. A panel that swallowed
 * the press would have passed the first half and failed the game.
 *
 * **It was a malfunction until 15 September 2026** — `{ kind: "leak" }`, one
 * wave, a thing hanging over the field — and the owner moved it onto the
 * ladder: a fault is something the seat that still works aims somewhere
 * harmless, and a gesture nobody was ever handed is nothing to aim. What that
 * cost in `sim` is this file's one argument: `startWave` takes the fact beside
 * the fault, and every rule below is unchanged, because all of them were
 * already asking `lanceLeaks` rather than the fault by name.
 */

const CFG = DEFAULT_CONFIG;
const TPB = ticksPerBeat(CFG);
/** Long enough for any hold to have come full twice over. */
const HELD = Math.round(CFG.lancePrimeBeats * TPB) + 2 * TPB;

const slick = (col: number): SpawnEntry => ({ beat: 0, col, kind: "slick", color: "red" });

/** A wave on a panel whose hold fills nothing — or, with `lance`, on one whose
 * hold does, which is the control every case here rests on. */
function leakWorld(queue: SpawnEntry[], lance = false): World {
  const world = createWorld({ ...CFG }, 0);
  startWave(world, 0, queue, [], null, false, 0, [], lance);
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

describe("the lobe on a panel with no hold", () => {
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

  it("is the panel and not the fill: the same hold on STANDARD lances", () => {
    // The control, and the one this whole file rests on: on a panel that has
    // the gesture, this exact hold burns the column with nothing lifted. If it
    // did not, every expectation above would pass on a wave that simply could
    // not lance, and the panel would be proving nothing at all.
    const world = leakWorld([slick(3)], true);
    play(world, 1, [aim(0, 3)]);
    play(world, HELD, [press(0, true)]);
    expect(world.creatures).toHaveLength(0);
  });

  it("leaves the body standing under a thumb that never comes up", () => {
    // The same hold, the same column, the gesture held back: nothing has
    // fired, because the only thing that fires without a lift is the beam.
    const world = leakWorld([slick(3)]);
    play(world, 1, [aim(0, 3)]);
    play(world, HELD, [press(0, true)]);
    expect(world.creatures).toHaveLength(1);
  });
});

describe("the trigger on a panel with no hold", () => {
  it("swallows nothing, so the panel is not dead", () => {
    // There is no fault on this wave at all now, which is the plainest form
    // the answer could take: nothing is drawn dead because nothing is broken.
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
